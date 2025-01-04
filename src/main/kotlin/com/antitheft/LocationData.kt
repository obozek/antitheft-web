package com.antitheft

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.Instant

@Serializable
data class LocationData(
    val partNumber: String,
    val deviceId: String,
    val locations: List<Location>
)

@Serializable
data class Location(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    @Serializable(with = EpochToInstantSerializer::class)
    @Contextual
    val `when`: Instant = Instant.now(),
    val accuracy: Int = 0
)
