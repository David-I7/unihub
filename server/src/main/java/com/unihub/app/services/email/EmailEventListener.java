package com.unihub.app.services.email;

import com.unihub.app.events.email.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {

    private final EmailService emailService;

    @Async
    @EventListener
    public void handleRegisterVerificationRequested(RegisterVerificationRequestedEvent event) {
        log.info("Handling RegisterVerificationRequestedEvent for {}", event.email());
        emailService.sendRegisterVerificationEmail(
                event.email(),
                event.username(),
                event.confirmationUrl()
        );
    }

    @Async
    @EventListener
    public void handleEmailVerificationRequested(EmailVerificationRequestedEvent event) {
        log.info("Handling EmailVerificationRequestedEvent for {}", event.email());
        emailService.sendEmailVerificationEmail(
                event.email(),
                event.username(),
                event.confirmationUrl()
        );
    }

    @Async
    @EventListener
    public void handleUserWelcome(UserWelcomeEvent event) {
        log.info("Handling UserWelcomeEvent for {}", event.email());
        emailService.sendWelcomeEmail(
                event.email(),
                event.username()
        );
    }

    @Async
    @EventListener
    public void handlePasswordResetRequested(PasswordResetRequestedEvent event) {
        log.info("Handling PasswordResetRequestedEvent for {}", event.email());
        emailService.sendPasswordResetEmail(
                event.email(),
                event.username(),
                event.resetUrl()
        );
    }

    @Async
    @EventListener
    public void handleUserDeleted(UserDeletedEvent event) {
        log.info("Handling UserDeletedEvent for {}", event.email());
        emailService.sendDeleteAccountConfirmationEmail(
                event.email(),
                event.username(),
                event.deletedByAdmin(),
                event.reason()
        );
    }

    @Async
    @EventListener
    public void handleEventReminderNotification(EventReminderNotificationEvent event) {
        log.info("Handling EventReminderNotificationEvent for {}", event.email());
        String formattedStartTime = event.startTime() != null
                ? event.startTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm (O)"))
                : "Scheduled time";

        emailService.sendEventNotificationEmail(
                event.email(),
                event.username(),
                event.eventTitle(),
                event.eventType(),
                event.courseName(),
                formattedStartTime,
                event.location(),
                event.locationDetails()
        );
    }
}
