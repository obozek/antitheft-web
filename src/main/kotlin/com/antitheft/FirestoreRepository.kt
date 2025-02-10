package com.antitheft

import com.google.api.core.ApiFuture
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.google.cloud.firestore.WriteResult
import jakarta.enterprise.context.ApplicationScoped
import java.time.Instant
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors


@ApplicationScoped
class FirestoreRepository(private val firestore: Firestore) {

    fun saveLocations(deviceId: String, partNumber: String,  locations: List<Location>): CompletableFuture<List<WriteResult>> {
        val batch = firestore.batch()
        // save part number to device if it is not set yet

        val deviceRef = firestore.collection("devices").document(deviceId)
        batch.set(deviceRef, Device(deviceId, partNumber))
        val collRef = firestore.collection("devices/$deviceId/locations")

        locations.forEach { location ->
            val docRef = collRef.document() // Auto-generate document ID
            batch.set(docRef, location)
        }
        return batch.commit().toCompletableFuture()
    }

    fun <T> ApiFuture<T>.toCompletableFuture(): CompletableFuture<T> {
        val completableFuture = CompletableFuture<T>()
        this.addListener({
            try {
                completableFuture.complete(this.get())
            } catch (ex: Exception) {
                completableFuture.completeExceptionally(ex)
            }
        }, Executors.newSingleThreadExecutor())
        return completableFuture
    }

    fun fetchCoordinatesInRange(deviceId: String, start: Instant?, end: Instant?): List<Location> {
        var collectionRef: Query = firestore.collection("devices/$deviceId/locations")
        start?.let {
            collectionRef = collectionRef.whereGreaterThanOrEqualTo("when", it)
        }
        end?.let {
            collectionRef = collectionRef.whereLessThanOrEqualTo("when", it)
        }
        val snapshot = collectionRef.orderBy("when").get().get()

        return snapshot.documents.mapNotNull { it.toObject(Location::class.java) }
    }

    fun fetchAllDeviceIds(): List<Device> {
        println(firestore.options.credentials)
        val snapshot = firestore.collection("devices").get().get()
        val results = snapshot.mapNotNull { it.toObject(Device::class.java) }
        // check if firstRecord field of every device has a value and if not set it to whe of the first location and save it to Firebase
        results.filter { it.firstRecordTime == null }.forEach { device ->
            val firstRecord = firestore.collection("devices/${device.id}/locations")
                .orderBy("when")
                .limit(1)
                .get().get()
            if (firstRecord.documents.isNotEmpty()) {
                val location = firstRecord.documents[0].toObject(Location::class.java)
                device.firstRecordTime = location.`when`
                firestore.collection("devices").document(device.id).set(device)
            }
        }
        return results
    }

//        results.forEach { device ->
//            val firstRecord = firestore.collection("devices/${device.deviceId}/locations")
//                .orderBy("when")
//                .limit(1)
//                .get().get()
//            if (firstRecord.documents.isNotEmpty()) {
//                val location = firstRecord.documents[0].toObject(Location::class.java)
//                device.firstRecord = location.`when`
//            }
//        }
//    fun getDensityData(
//        deviceId: String,
//        startTimestamp: Instant?,
//        endTimestamp: Instant?,
//        intervalInSeconds: Long
//    ): Map<Long, Int> {
//        val densityMap = mutableMapOf<Long, Int>()
//
//        val query = firestore.collection("devices/$deviceId/locations")
//            .whereGreaterThanOrEqualTo("when", startTimestamp)
//            .whereLessThanOrEqualTo("when", endTimestamp)
//            .get().get()
//
//        for (doc in query.documents) {
//            val location = doc.toObject(Location::class.java)
//            location.let {
//                val bucket = (it.`when`.epochSecond / intervalInSeconds) * intervalInSeconds
//                densityMap[bucket] = densityMap.getOrDefault(bucket, 0) + 1
//            }
//        }
//
//        return densityMap
//    }


}
