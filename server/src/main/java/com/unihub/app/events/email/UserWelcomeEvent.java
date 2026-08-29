package com.unihub.app.events.email;

public record UserWelcomeEvent(
        String email,
        String username
) {
}
