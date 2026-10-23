package com.unihub.app.security.oauth2;

public record OAuth2ProviderUserInfo(
        String providerSubjectId,
        String email,
        boolean emailVerified
) {
}

