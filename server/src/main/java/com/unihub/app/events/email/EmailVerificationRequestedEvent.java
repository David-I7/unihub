package com.unihub.app.events.email;

public record EmailVerificationRequestedEvent(
        String email,
        String username,
        String code
) {
}
