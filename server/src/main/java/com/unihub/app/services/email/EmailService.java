package com.unihub.app.services.email;

import com.unihub.app.config.EmailProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailProperties emailProperties;

    public void sendRegisterVerificationEmail(String to, String username, String confirmationUrl) {
        Map<String, Object> variables = Map.of(
                "username", username,
                "confirmationUrl", confirmationUrl,
                "supportEmail", emailProperties.supportEmail()
        );
        sendHtmlEmail(
                emailProperties.noReplyEmail(),
                to,
                "Confirm your registration - UniHub",
                "email/verifyRegister",
                variables
        );
    }

    public void sendEmailVerificationEmail(String to, String username, String confirmationUrl) {
        Map<String, Object> variables = Map.of(
                "username", username,
                "confirmationUrl", confirmationUrl,
                "supportEmail", emailProperties.supportEmail()
        );
        sendHtmlEmail(
                emailProperties.noReplyEmail(),
                to,
                "Verify your email address - UniHub",
                "email/VerifyEmail",
                variables
        );
    }

    public void sendVerificationEmail(String to, String username, String confirmationUrl) {
        sendEmailVerificationEmail(to, username, confirmationUrl);
    }

    public void sendWelcomeEmail(String to, String username) {
        Map<String, Object> variables = Map.of(
                "username", username,
                "supportEmail", emailProperties.supportEmail()
        );
        sendHtmlEmail(
                emailProperties.noReplyEmail(),
                to,
                "Welcome to UniHub!",
                "email/Welcome",
                variables
        );
    }

    public void sendPasswordResetEmail(String to, String username, String resetUrl) {
        Map<String, Object> variables = Map.of(
                "username", username,
                "resetUrl", resetUrl,
                "supportEmail", emailProperties.supportEmail()
        );
        sendHtmlEmail(
                emailProperties.noReplyEmail(),
                to,
                "Reset your password - UniHub",
                "email/ResetPassword",
                variables
        );
    }

    public void sendDeleteAccountConfirmationEmail(String to, String username, boolean deletedByAdmin, String reason) {
        if (deletedByAdmin) {
            Map<String, Object> variables = Map.of(
                    "username", username,
                    "reason", reason != null ? reason : "",
                    "supportEmail", emailProperties.supportEmail()
            );
            sendHtmlEmail(
                    emailProperties.noReplyEmail(),
                    to,
                    "Account Deletion Notice - UniHub",
                    "email/AdminDeleteAccountConfirmation",
                    variables
            );
        } else {
            Map<String, Object> variables = Map.of(
                    "username", username,
                    "supportEmail", emailProperties.supportEmail()
            );
            sendHtmlEmail(
                    emailProperties.noReplyEmail(),
                    to,
                    "Account Deleted - UniHub",
                    "email/DeleteAccountConfitmation",
                    variables
            );
        }
    }

    public void sendEventNotificationEmail(
            String to,
            String username,
            String eventTitle,
            String eventType,
            String courseName,
            String startTime,
            String location,
            String locationDetails
    ) {
        Map<String, Object> variables = Map.of(
                "username", username,
                "eventTitle", eventTitle,
                "eventType", eventType,
                "courseName", courseName,
                "startTime", startTime,
                "location", location,
                "locationDetails", locationDetails != null ? locationDetails : "",
                "supportEmail", emailProperties.supportEmail()
        );
        sendHtmlEmail(
                emailProperties.notificationEmail(),
                to,
                "Reminder: " + eventTitle + " - UniHub",
                "email/EventNotification",
                variables
        );
    }

    public void sendHtmlEmail(String from, String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            Context context = new Context();
            context.setVariable("year", java.time.Year.now().getValue());
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email '{}' successfully sent to {}", subject, to);
        } catch (MessagingException e) {
            log.error("Failed to construct or send email '{}' to {}", subject, to, e);
        } catch (Exception e) {
            log.error("Unexpected error sending email '{}' to {}", subject, to, e);
        }
    }
}
