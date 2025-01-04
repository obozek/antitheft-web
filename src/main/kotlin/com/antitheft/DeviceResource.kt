package com.antitheft

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType

@Path("/devices")
class DeviceResource(private val firestoreService: FirestoreRepository) {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    fun getDevices(): List<String> {
        return firestoreService.fetchAllDeviceIds()
    }
}
