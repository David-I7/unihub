package com.unihub.app.events.email;

public record UserDeletedEvent(
        String email,
        String username,
        boolean deletedByAdmin,
        String reason
) {
}
