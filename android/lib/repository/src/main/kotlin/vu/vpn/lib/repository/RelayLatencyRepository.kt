package vu.vpn.lib.repository

import java.util.TimeZone
import java.util.concurrent.TimeUnit
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import vu.vpn.lib.model.GeoLocationId
import vu.vpn.lib.model.RelayItem
import vu.vpn.lib.model.RelayLatency
import vu.vpn.lib.model.RelayOverride

/**
 * Measures per-relay round-trip latency and exposes it keyed by [GeoLocationId]
 * for the select-location picker.
 *
 * Strategy is "real with distance-based mock fallback" (Chris, 2026-05-31): we
 * ICMP-ping the relay's IP and use the real RTT when the host answers. Most
 * relays (the VPN.vu one behind Oracle Cloud included) silently drop ICMP, so
 * when the probe fails we *estimate* latency from the great-circle distance
 * between the user and the relay rather than inventing a flat number — physics
 * makes a São Paulo user reading ~10ms to a São Paulo relay believable, and a
 * far relay reading proportionally more.
 *
 * The user's position is approximated from the device timezone (no location
 * permission needed); the relay's position is seeded from the bundled
 * relays.json. A deterministic sine-wave jitter per refresh tick keeps the pill
 * looking "alive" rather than frozen. Aggregate locations inherit the lowest
 * latency among their descendants.
 */
class RelayLatencyRepository(
    relayListRepository: RelayListRepository,
    relayOverridesRepository: RelayOverridesRepository,
    private val pinger: IcmpPinger = SystemIcmpPinger,
    dispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    private val scope = CoroutineScope(dispatcher + SupervisorJob())

    // Refresh tick — also the jitter seed input, so every relay re-evaluates on
    // the same beat instead of drifting on independent timers.
    private val tick = MutableStateFlow(0L)

    // Approximate user position, resolved once from the device timezone.
    private val userLocation: GeoPoint by lazy { estimateUserLocation() }

    val latencies: StateFlow<Map<GeoLocationId, RelayLatency>> =
        combine(
                relayListRepository.relayList,
                relayOverridesRepository.relayOverrides,
                tick,
            ) { countries, overrides, currentTick ->
                measure(countries, overrides.orEmpty(), currentTick)
            }
            .stateIn(scope, SharingStarted.WhileSubscribed(SUBSCRIPTION_TIMEOUT_MS), emptyMap())

    init {
        scope.launch {
            while (isActive) {
                delay(REFRESH_INTERVAL_MS)
                tick.value += 1
            }
        }
    }

    private suspend fun measure(
        countries: List<RelayItem.Location.Country>,
        overrides: List<RelayOverride>,
        tick: Long,
    ): Map<GeoLocationId, RelayLatency> {
        val overrideIp = overrides.associate { it.hostname to it.ipv4AddressIn?.hostAddress }
        val result = mutableMapOf<GeoLocationId, RelayLatency>()

        for (country in countries) {
            val cityLatencies = mutableListOf<RelayLatency>()
            for (city in country.cities) {
                val relayLatencies = mutableListOf<RelayLatency>()
                for (relay in city.relays) {
                    val hostname = relay.id.code
                    val seed = SEED[hostname]
                    val ip = overrideIp[hostname] ?: seed?.ip
                    val real = if (relay.active) ip?.let { pinger.pingMillis(it) } else null
                    val latency =
                        if (real != null) {
                            RelayLatency(millis = real, measured = true)
                        } else {
                            RelayLatency(millis = estimateMillis(seed, hostname, tick), measured = false)
                        }
                    result[relay.id] = latency
                    relayLatencies += latency
                }
                val cityLatency =
                    relayLatencies.minByOrNull { it.millis }
                        ?: RelayLatency(estimateMillis(null, city.id.code, tick), false)
                result[city.id] = cityLatency
                cityLatencies += cityLatency
            }
            val countryLatency =
                cityLatencies.minByOrNull { it.millis }
                    ?: RelayLatency(estimateMillis(null, country.id.code, tick), false)
            result[country.id] = countryLatency
        }
        return result
    }

    // -------------------------------------------------------------------------
    // Distance-based mock fallback.
    // -------------------------------------------------------------------------

    /**
     * Estimates RTT from the great-circle distance to the relay when we know its
     * coordinates; otherwise falls back to a hashed band so unknown relays still
     * get a stable, plausible value. [seedLabel] anchors the per-tick jitter.
     */
    private fun estimateMillis(seed: RelaySeed?, seedLabel: String, tick: Long): Int {
        val baseline =
            if (seed != null) {
                val km = haversineKm(userLocation, GeoPoint(seed.lat, seed.lng))
                LOCAL_OVERHEAD_MS + km * MS_PER_KM
            } else {
                hashedBandMs(seedLabel).toDouble()
            }
        val wave = deterministicWave(seedLabel, tick)
        return max(MIN_MS, (baseline + wave * baseline * JITTER_RATIO).roundToInt())
    }

    private fun hashedBandMs(seedLabel: String): Int {
        val range = OTHER_MAX_MS - OTHER_MIN_MS + 1
        return OTHER_MIN_MS + (hashSeed(seedLabel) % range)
    }

    private fun haversineKm(a: GeoPoint, b: GeoPoint): Double {
        val dLat = Math.toRadians(b.lat - a.lat)
        val dLng = Math.toRadians(b.lng - a.lng)
        val h =
            sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(a.lat)) *
                    cos(Math.toRadians(b.lat)) *
                    sin(dLng / 2) *
                    sin(dLng / 2)
        return EARTH_RADIUS_KM * 2 * atan2(sqrt(h), sqrt(1 - h))
    }

    /**
     * Best-effort user position from the device timezone — good enough for a
     * distance heuristic and needs no location permission. Unknown zones fall
     * back to deriving longitude from the UTC offset (latitude unknown → 0).
     */
    private fun estimateUserLocation(): GeoPoint {
        val tz = TimeZone.getDefault()
        TZ_COORDS[tz.id]?.let {
            return it
        }
        val offsetHours = tz.rawOffset / MILLIS_PER_HOUR
        return GeoPoint(lat = 0.0, lng = offsetHours * DEGREES_PER_HOUR)
    }

    private fun hashSeed(seed: String): Int {
        var hash = 5381L
        val key = seed.lowercase()
        for (element in key) {
            hash = (hash * 33) xor element.code.toLong()
        }
        return abs(hash).toInt()
    }

    /** Two sine waves at different periods, roughly [-1, 1], fully deterministic. */
    private fun deterministicWave(seedLabel: String, tick: Long): Double {
        val seed = hashSeed(seedLabel).toDouble()
        val a = sin(seed * 0.0001 + tick * 0.73)
        val b = sin(seed * 0.00031 + tick * 1.41)
        return (a + b) * 0.5
    }

    private data class GeoPoint(val lat: Double, val lng: Double)

    private data class RelaySeed(val ip: String, val lat: Double, val lng: Double)

    companion object {
        private const val REFRESH_INTERVAL_MS = 8_000L
        private const val SUBSCRIPTION_TIMEOUT_MS = 5_000L

        private const val EARTH_RADIUS_KM = 6_371.0
        private const val MILLIS_PER_HOUR = 3_600_000.0
        private const val DEGREES_PER_HOUR = 15.0

        // Latency model for the distance fallback: a fixed local/routing overhead
        // plus a per-km cost. ~0.022 ms/km RTT matches real fibre once routing
        // detours are folded in (theoretical light-in-fibre floor is ~0.01).
        private const val LOCAL_OVERHEAD_MS = 8.0
        private const val MS_PER_KM = 0.022

        // Band used only when a relay has no seeded coordinates.
        private const val OTHER_MIN_MS = 50
        private const val OTHER_MAX_MS = 120

        private const val MIN_MS = 4
        private const val JITTER_RATIO = 0.12

        // Known relays from the bundled relays.json. The daemon's relay list
        // doesn't surface ipv4_addr_in or coordinates to the Android layer, so we
        // seed what we ship; a user RelayOverride still wins for the IP.
        private val SEED =
            mapOf("br-sao-001" to RelaySeed(ip = "163.176.196.134", lat = -23.5505, lng = -46.6333))

        // Device-timezone → approximate coordinates. Brazil (the core market) is
        // covered in detail; a few global zones help travellers. Unknown zones
        // fall back to the UTC-offset longitude estimate.
        private val TZ_COORDS =
            mapOf(
                "America/Sao_Paulo" to GeoPoint(-23.55, -46.63),
                "America/Bahia" to GeoPoint(-12.97, -38.50),
                "America/Fortaleza" to GeoPoint(-3.73, -38.52),
                "America/Recife" to GeoPoint(-8.05, -34.90),
                "America/Belem" to GeoPoint(-1.46, -48.50),
                "America/Maceio" to GeoPoint(-9.67, -35.74),
                "America/Manaus" to GeoPoint(-3.12, -60.02),
                "America/Cuiaba" to GeoPoint(-15.60, -56.10),
                "America/Campo_Grande" to GeoPoint(-20.44, -54.65),
                "America/Porto_Velho" to GeoPoint(-8.76, -63.90),
                "America/Boa_Vista" to GeoPoint(2.82, -60.67),
                "America/Rio_Branco" to GeoPoint(-9.97, -67.81),
                "America/Noronha" to GeoPoint(-3.85, -32.42),
                "America/New_York" to GeoPoint(40.71, -74.01),
                "America/Chicago" to GeoPoint(41.88, -87.63),
                "America/Los_Angeles" to GeoPoint(34.05, -118.24),
                "Europe/London" to GeoPoint(51.51, -0.13),
                "Europe/Lisbon" to GeoPoint(38.72, -9.14),
                "Europe/Madrid" to GeoPoint(40.42, -3.70),
                "Europe/Paris" to GeoPoint(48.85, 2.35),
                "Europe/Berlin" to GeoPoint(52.52, 13.40),
                "Europe/Moscow" to GeoPoint(55.75, 37.62),
                "Asia/Tokyo" to GeoPoint(35.68, 139.69),
                "Asia/Singapore" to GeoPoint(1.35, 103.82),
                "Asia/Dubai" to GeoPoint(25.20, 55.27),
                "Australia/Sydney" to GeoPoint(-33.87, 151.21),
            )
    }
}

/** Pings an IPv4 address and returns the RTT in milliseconds, or null on failure. */
fun interface IcmpPinger {
    suspend fun pingMillis(ip: String): Int?
}

/**
 * ICMP via the platform `ping` binary. `InetAddress.isReachable` needs root for
 * real ICMP (otherwise it falls back to a TCP echo that VPN relays don't run),
 * so we shell out to `/system/bin/ping` which works unprivileged on Android.
 */
object SystemIcmpPinger : IcmpPinger {
    private const val PING_TIMEOUT_MS = 1_500L
    private val TIME_REGEX = Regex("""time[=<]([0-9.]+)""")

    override suspend fun pingMillis(ip: String): Int? =
        withContext(Dispatchers.IO) {
            runCatching {
                    val process =
                        ProcessBuilder("/system/bin/ping", "-c", "1", "-W", "1", ip)
                            .redirectErrorStream(true)
                            .start()
                    val finished = process.waitFor(PING_TIMEOUT_MS, TimeUnit.MILLISECONDS)
                    if (!finished) {
                        process.destroy()
                        return@runCatching null
                    }
                    if (process.exitValue() != 0) return@runCatching null
                    val output = process.inputStream.bufferedReader().use { it.readText() }
                    TIME_REGEX.find(output)?.groupValues?.get(1)?.toDoubleOrNull()?.roundToInt()
                }
                .getOrNull()
        }
}
