package com.unihub.app.events.email;

public record RegisterVerificationRequestedEvent(
        String email,
        String username,
        String code
) {
}
