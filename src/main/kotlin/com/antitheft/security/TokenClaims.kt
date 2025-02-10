package com.antitheft.security

import org.eclipse.microprofile.jwt.JsonWebToken


class TokenClaims(private val token: JsonWebToken) {

    fun get(): JsonWebToken = token

    val name: String?
        get() = get().getClaim("name")

    val email: String?
        get() = get().getClaim("email")

    val picture: String?
        get() = get().getClaim("picture")
}
