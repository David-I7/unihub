package com.unihub.app.events.email;

public record PasswordResetRequestedEvent(
        String email,
        String username,
        String token,
        String resetUrl
) {
}
