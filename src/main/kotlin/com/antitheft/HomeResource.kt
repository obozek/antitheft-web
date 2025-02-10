package com.antitheft

import com.antitheft.security.TokenClaims
import io.quarkus.qute.Template
import io.quarkus.qute.TemplateInstance
import io.quarkus.security.identity.SecurityIdentity
import jakarta.inject.Inject
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken


@Path("/")
class HomeResource(private val home: Template) {

    @Inject
    lateinit var securityIdentity: SecurityIdentity

    @GET
    @Produces(MediaType.TEXT_HTML)
    fun index(): TemplateInstance {
        // Create a data model with information from the SecurityIdentity.
        val isLoggedIn = !securityIdentity.isAnonymous
        val userName = if (isLoggedIn) TokenClaims(securityIdentity.principal as JsonWebToken).name else null

        // Pass these properties to the template.
        return home.data("loggedIn", isLoggedIn, "username", userName)
    }
}
