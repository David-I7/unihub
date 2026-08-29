package com.unihub.app.security;

public record OAuth2ProviderUserInfo(
        String providerSubjectId,
        String email,
        boolean emailVerified
) {
}

