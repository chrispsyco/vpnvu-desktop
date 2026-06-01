package vu.vpn.lib.repository

import androidx.datastore.core.CorruptionException
import androidx.datastore.core.Serializer
import com.google.protobuf.InvalidProtocolBufferException
import java.io.InputStream
import java.io.OutputStream
import vu.vpn.repository.UserPreferences

object UserPreferencesSerializer : Serializer<UserPreferences> {
    // PSYCO: mostrar a localização (país/cidade/servidor) na notificação de
    // status por padrão. A notificação é VISIBILITY_SECRET (oculta na
    // lockscreen), então isso não vaza a localização pra quem olha o aparelho
    // bloqueado. O usuário pode desligar em Configurações > Notificações.
    override val defaultValue: UserPreferences =
        UserPreferences.getDefaultInstance()
            .toBuilder()
            .setShowLocationInSystemNotification(true)
            .build()

    override suspend fun readFrom(input: InputStream): UserPreferences {
        try {
            return UserPreferences.parseFrom(input)
        } catch (exception: InvalidProtocolBufferException) {
            throw CorruptionException("Cannot read proto", exception)
        }
    }

    override suspend fun writeTo(t: UserPreferences, output: OutputStream) = t.writeTo(output)
}
