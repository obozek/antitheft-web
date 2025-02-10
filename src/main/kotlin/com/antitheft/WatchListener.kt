package com.antitheft

import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import kotlinx.serialization.Serializable
import org.slf4j.Logger
import org.slf4j.LoggerFactory


@Path("/listen")
class WatchListener(private val firestoreRepository: FirestoreRepository) {


    private val logger: Logger = LoggerFactory.getLogger(WatchListener::class.java)


    @POST()
    @Produces(MediaType.APPLICATION_JSON)
    fun listen(deviceData: LocationData): Response {
        logger.info("Received message: {}", deviceData)

        firestoreRepository.saveLocations(deviceData.deviceId, deviceData.partNumber, deviceData.locations)
            .thenAccept {
                println("Locations saved successfully")
            }
            .exceptionally { exception ->
                exception.printStackTrace()
                println("Failed to save locations: ${exception.message}")
                null
            }

        return Response.status(Response.Status.OK)
            .entity(WatchEvent("OK"))
            .build()
    }

    @Serializable
    data class WatchEvent(val status: String)

}
