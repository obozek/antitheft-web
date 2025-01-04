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

    fun saveLocations(deviceId: String, locations: List<Location>): CompletableFuture<List<WriteResult>> {
        val batch = firestore.batch()
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
        val snapshot = collectionRef.get().get()

        return snapshot.documents.mapNotNull { it.toObject(Location::class.java) }
    }

    fun fetchAllDeviceIds(): List<String> {
        println(firestore.options.credentials)
        val snapshot = firestore.collection("devices").listDocuments()
        return snapshot.map { it.id }
    }


}
