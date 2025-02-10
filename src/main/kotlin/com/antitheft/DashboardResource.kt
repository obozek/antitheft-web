package com.antitheft

import com.antitheft.security.TokenClaims
import io.quarkus.oidc.IdToken
import io.quarkus.qute.Template
import io.quarkus.qute.TemplateInstance
import io.quarkus.security.Authenticated
import jakarta.inject.Inject
import jakarta.inject.Provider
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken

@Path("/dashboard")
internal class DashboardResource(
    private val dashboard: Template,
    private val firestoreRepository: FirestoreRepository
) {

    @Inject
    @IdToken
    lateinit var idTokenProvider: Provider<JsonWebToken>

    @GET
    @Authenticated
    @Produces(MediaType.TEXT_HTML)
    fun getDashboard(): TemplateInstance {
        val claims = TokenClaims(idTokenProvider.get())
        return dashboard.data(
            "username", claims.name ?: "anonymous",
            "loggedIn", true,
            "picture", claims.picture,
            "devices", firestoreRepository.fetchAllDeviceIds()
        )
    }
}
