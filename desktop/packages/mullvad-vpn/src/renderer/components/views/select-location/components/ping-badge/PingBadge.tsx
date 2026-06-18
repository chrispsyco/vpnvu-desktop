import React from 'react';
import styled from 'styled-components';

import { type GeographicalLocation } from '../../../../../features/locations/types';

// -----------------------------------------------------------------------------
// PingBadge · simulated RTT pill rendered inline next to a location's name in
// the select-location picker. Matches the figma `.sl-row__ping` styling.
//
// We're mock-only until the daemon exposes a per-relay RTT — see the upstream
// `connection-check-helper` work — so the value is derived deterministically
// from the location's country code (with a small jitter per tick so the row
// reads "alive" rather than static).
//
// Aggregator rows (country / city with multiple relays) show the SAME value as
// their best-pinging child, both at the baseline level AND in the per-tick
// jitter. That means Brasil never reads "15ms" while its only city São Paulo
// reads "13ms" in the same frame — a discrepancy Chris flagged on 2026-05-19.
//
// Two mechanisms hold this guarantee:
//   1. `mockPingBaseline` returns both the min RTT and the seedLabel of the
//      child it came from, so the country inherits the city's seed.
//   2. `jitterPing` is fully deterministic (`sin`-wave from seed + global
//      tick index), so identical (baseline, seedLabel) pairs always render
//      identical ms. We also share a single setInterval across all badges
//      via a module-level subscriber list, so every badge re-renders on the
//      same tick boundary instead of drifting on its own timer.
// -----------------------------------------------------------------------------

type PingTone = 'good' | 'mid' | 'bad';

const PING_REFRESH_MS = 5000;
const PING_JITTER_RATIO = 0.15;

// Aesthetic ping curve — Chris wants the picker to look healthy across the
// board, so everything that isn't BR sits in a polite 50..120ms band
// (cyan-good edge through amber-mid), instead of the realistic 200-330ms
// reds. BR stays in the low-RTT good band because the user is in São Paulo.
// When a real ping loop hooks in, replace this with daemon RTT and the rest
// of the badge stays put.
const HOME_COUNTRY = 'br';
const HOME_BASELINE_MS = 14;
const OTHER_MIN_MS = 50;
const OTHER_MAX_MS = 120;

function hashSeed(seed: string): number {
  let hash = 5381;
  const key = seed.toLowerCase();
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 33) ^ key.charCodeAt(i);
  }
  return Math.abs(hash);
}

function relayBaseline(country: string | undefined, label: string): number {
  if (country?.toLowerCase() === HOME_COUNTRY) {
    // Small label-stable wobble so BR-* relays don't all read 14ms flat.
    const wobble = (hashSeed(label) % 8) - 4; // -4..+3
    return Math.max(6, HOME_BASELINE_MS + wobble);
  }
  // Everything else hashes into the 50..120ms band. Use country code when
  // available so all rows for the same country anchor near each other; fall
  // back to the label so unknown rows still get a stable value.
  const seed = country?.toLowerCase() ?? label.toLowerCase();
  const range = OTHER_MAX_MS - OTHER_MIN_MS + 1;
  return OTHER_MIN_MS + (hashSeed(seed) % range);
}

type PingResolved = { ms: number; seedLabel: string };

/**
 * Walks the location tree and returns both the minimum RTT among descendants
 * and the seedLabel of the child it came from. The seedLabel is what the
 * country/city inherits so jitter ties exactly with the winning child.
 */
function mockPingBaseline(location: GeographicalLocation): PingResolved {
  if (location.type === 'country') {
    if (location.cities.length === 0) {
      return {
        ms: relayBaseline(location.details.country, location.label),
        seedLabel: location.label,
      };
    }
    return location.cities
      .map(mockPingBaseline)
      .reduce((a, b) => (a.ms <= b.ms ? a : b));
  }
  if (location.type === 'city') {
    if (location.relays.length === 0) {
      return {
        ms: relayBaseline(location.details.country, location.label),
        seedLabel: location.label,
      };
    }
    return location.relays
      .map(mockPingBaseline)
      .reduce((a, b) => (a.ms <= b.ms ? a : b));
  }
  return {
    ms: relayBaseline(location.details.country, location.label),
    seedLabel: location.label,
  };
}

/**
 * Deterministic wave-based jitter in roughly [-1, 1]. Two sin waves at
 * different periods avoid the "obvious sine wobble" look. With identical
 * (seedLabel, tickIndex) the output is bit-identical, so an aggregator that
 * inherits a child's seedLabel renders the exact same ms.
 */
function deterministicWave(seedLabel: string, tickIndex: number): number {
  const seed = hashSeed(seedLabel);
  const a = Math.sin(seed * 0.0001 + tickIndex * 0.73);
  const b = Math.sin(seed * 0.00031 + tickIndex * 1.41);
  return (a + b) * 0.5;
}

function jitterPing(baseline: number, seedLabel: string, tickIndex: number): number {
  const wave = deterministicWave(seedLabel, tickIndex);
  return Math.max(4, Math.round(baseline + wave * baseline * PING_JITTER_RATIO));
}

// -----------------------------------------------------------------------------
// Shared tick driver — single setInterval shared by every PingBadge instance
// so they all flip on the same beat. Without this each badge had its own timer
// and their refresh boundaries drifted (the country could update 200ms before
// its child, briefly desyncing the displayed ms even with identical seeds).
// -----------------------------------------------------------------------------

const tickSubscribers = new Set<() => void>();
let globalTickIndex = Math.floor(Date.now() / PING_REFRESH_MS);
if (typeof window !== 'undefined') {
  window.setInterval(() => {
    globalTickIndex = Math.floor(Date.now() / PING_REFRESH_MS);
    tickSubscribers.forEach((fn) => fn());
  }, PING_REFRESH_MS);
}

function usePingTick(): number {
  const [tick, setTick] = React.useState(globalTickIndex);
  React.useEffect(() => {
    const handler = () => setTick(globalTickIndex);
    tickSubscribers.add(handler);
    return () => {
      tickSubscribers.delete(handler);
    };
  }, []);
  return tick;
}

export function PingBadge({ location }: { location: GeographicalLocation }) {
  const { ms: baseline, seedLabel } = React.useMemo(() => mockPingBaseline(location), [location]);
  const tickIndex = usePingTick();
  const ms = React.useMemo(
    () => jitterPing(baseline, seedLabel, tickIndex),
    [baseline, seedLabel, tickIndex],
  );

  const tone: PingTone = ms < 50 ? 'good' : ms < 150 ? 'mid' : 'bad';
  return (
    <StyledPingPill $tone={tone} aria-label={`${ms} milliseconds`}>
      <StyledPingDot />
      {ms}ms
    </StyledPingPill>
  );
}

const PING_TONE_COLORS: Record<PingTone, string> = {
  good: 'rgb(68, 173, 77)',
  mid: 'rgb(232, 172, 46)',
  bad: 'rgb(227, 67, 73)',
};

const StyledPingPill = styled.span<{ $tone: PingTone }>`
  /* Sits on the 2nd line of the meta stack (below the tags), so no left margin
     — the stack's own gap handles spacing. Scaled down to match the smaller
     tag badges and keep the row height close to the old single-line layout. */
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Geist Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${({ $tone }) => PING_TONE_COLORS[$tone]};
  background: rgba(255, 255, 255, 0.04);
  padding: 1px 4px;
  border-radius: 6px;
  flex-shrink: 0;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
`;

const StyledPingDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 3px;
  background: currentColor;
  box-shadow: 0 0 5px currentColor;
  opacity: 0.9;
`;
