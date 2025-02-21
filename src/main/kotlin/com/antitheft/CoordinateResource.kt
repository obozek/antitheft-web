package com.antitheft

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.QueryParam
import jakarta.ws.rs.core.MediaType
import java.time.Instant

@Path("/coordinates")
class CoordinateResource(private val firestoreService: FirestoreRepository) {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    fun getCoordinates(
        @QueryParam("deviceId") deviceId: String,
        @QueryParam("startDate") startDate: String?,
        @QueryParam("endDate") endDate: String?
    ): List<Location> {
        val startInstant = startDate?.let {
            Instant.parse(startDate)
        }
        val endInstant = endDate?.let {
            Instant.parse(endDate)
        }
        return firestoreService.fetchCoordinatesInRange(deviceId, startInstant, endInstant)
    }

//    @GET
//    @Path("/density")
//    @Produces(MediaType.APPLICATION_JSON)
//    fun getDensityData(
//        @QueryParam("deviceId") deviceId: String,
//        @QueryParam("startDate") startDate: String?,
//        @QueryParam("endDate") endDate: String?,
//        @QueryParam("intervalSeconds") intervalSeconds: Long
//    ): List<Location> {
//        val startInstant = startDate?.let {
//            Instant.parse(startDate)
//        }
//        val endInstant = endDate?.let {
//            Instant.parse(endDate)
//        }
//        return firestoreService.getDensityData(deviceId, startInstant, endInstant, intervalSeconds)
//    }
}
