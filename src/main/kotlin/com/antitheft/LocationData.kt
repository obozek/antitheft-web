package com.antitheft

import com.google.cloud.firestore.annotation.DocumentId
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

@Serializable
class Device(
    @DocumentId
    var id: String,
    var partNumber: String,
    @Serializable(with = EpochToInstantSerializer::class)
    @Contextual
    var firstRecordTime: Instant? = null,
) {
    // add no arg constructor for Firestore
    constructor() : this("", "")
}
