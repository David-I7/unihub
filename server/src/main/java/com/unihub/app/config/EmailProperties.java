package com.unihub.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.mail")
public record EmailProperties(
        String noReplyEmail,
        String supportEmail,
        String notificationEmail,
        long emailVerificationTokenExpirationSec,
        long passwordResetTokenExpirationSec
) {
}

