package com.unihub.app.entities;

public enum SessionRevokeReason {
    LOGOUT,
    SESSION_EXPIRED,
    PASSWORD_RESET,
    ROTATED,
    REUSE_DETECTED
}
