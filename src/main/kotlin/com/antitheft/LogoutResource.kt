package com.antitheft

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.config.inject.ConfigProperty
import java.net.URI

@Path("/logout")
class LogoutResource(
    @ConfigProperty(name = "app.url") private val appUrl: String,
    @ConfigProperty(name = "quarkus.oidc.auth-server-url") private val authServerUrl: String,
    @ConfigProperty(name = "quarkus.oidc.client-id") private val clientId: String
) {


    @GET
    fun logout(): Response {
        // Optionally, redirect to Auth0 logout URL:
        val auth0LogoutUrl = "$authServerUrl/v2/logout?returnTo=$appUrl&client_id=$clientId"
        return Response.seeOther(URI.create(auth0LogoutUrl)).build()
    }
}
