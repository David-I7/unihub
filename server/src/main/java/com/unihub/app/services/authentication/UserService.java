package com.unihub.app.services.authentication;

import com.unihub.app.config.EmailProperties;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.authentication.MessageResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.dto.user.request.UpdateUserProfileRequestDto;
import com.unihub.app.dto.user.request.UpdateUserRoleRequestDto;
import com.unihub.app.entities.authentication.AuthProvider;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authentication.UserIdentity;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.events.email.EmailVerificationRequestedEvent;
import com.unihub.app.events.email.PasswordResetRequestedEvent;
import com.unihub.app.events.email.RegisterVerificationRequestedEvent;
import com.unihub.app.events.email.UserDeletedEvent;
import com.unihub.app.events.email.UserWelcomeEvent;
import com.unihub.app.exceptions.InvalidJwtTokenException;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.utils.AppUtils;
import com.unihub.app.utils.Random;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private int SCHEDULE_DELETE_DAYS = 30;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserIdentityService userIdentityService;
    private final RoleService roleService;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserMapper userMapper;
    private final PageMapper pageMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final JwtService jwtService;
    private final SessionService sessionService;
    private final EmailProperties emailProperties;
    private final AppUtils appUtils;
    private final VerificationCodeService verificationCodeService;

    @Transactional
    public MessageResponseDto register(User user) {
        List<User> existingUsers = userRepository.findByUsernameOrEmail(
                user.getUsername(),
                user.getEmail()
        );

        if (!existingUsers.isEmpty()) {
            if (existingUsers.size() > 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username and email are already taken");
            }
            User existingUser = existingUsers.get(0);
            boolean sameUsername = user.getUsername() != null && user.getUsername().equals(existingUser.getUsername());

            String message = sameUsername
                      ? "Username is already taken"
                      : "Email is already taken";

            throw new ResponseStatusException(HttpStatus.CONFLICT, message);
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        String code = verificationCodeService.generateCode();
        verificationCodeService.savePendingRegistration(user.getUsername(), user.getEmail(), encodedPassword, code);

        eventPublisher.publishEvent(new RegisterVerificationRequestedEvent(
                user.getEmail(),
                user.getUsername(),
                code
        ));

        return new MessageResponseDto("Verification email sent. Please check your inbox.");
    }

    @Transactional
    public User confirmRegister(String email, String code) {
        VerificationCodeService.PendingRegistration pending = verificationCodeService.verifyAndConsumeRegistration(email, code);

        List<User> existingUsers = userRepository.findByUsernameOrEmail(pending.getUsername(), pending.getEmail());
        if (!existingUsers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already registered");
        }

        OffsetDateTime now = OffsetDateTime.now();
        User user = User.builder()
                .username(pending.getUsername())
                .email(pending.getEmail())
                .password(pending.getEncodedPassword())
                .emailVerified(true)
                .roleId(roleService.getRoleByName(RoleType.USER).getId())
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(user);

        UserIdentity localIdentity = userMapper.toUserIdentity(
                savedUser,
                AuthProvider.LOCAL,
                savedUser.getEmail(),
                savedUser.getEmail(),
                now
        );

        userIdentityService.save(localIdentity);

        eventPublisher.publishEvent(new UserWelcomeEvent(savedUser.getEmail(), savedUser.getUsername()));

        return savedUser;
    }

    @Transactional
    public MessageResponseDto confirmEmail(String email, String code) {
        verificationCodeService.verifyAndConsumeEmailVerification(email, code);

        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setEmailVerified(true);
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        return new MessageResponseDto("Email has been successfully verified.");
    }

    @Transactional(readOnly = true)
    public MessageResponseDto requestConfirmEmail(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if(optionalUser.get().isEmailVerified()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already verified");
        }

        User user = optionalUser.get();
        String code = verificationCodeService.generateCode();
        verificationCodeService.savePendingEmailVerification(user.getEmail(), code);

        eventPublisher.publishEvent(new EmailVerificationRequestedEvent(
                user.getEmail(),
                user.getUsername(),
                code
        ));

        return new MessageResponseDto("If an account exists with that email, a verification code has been sent.");
    }

    @Transactional(readOnly = true)
    public MessageResponseDto requestPasswordReset(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if(!optionalUser.get().isEmailVerified()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is not verified");
        }

        User user = optionalUser.get();
        long expirationSec = emailProperties.passwordResetTokenExpirationSec();
        Map<String, Object> claims = Map.of(
                JwtService.PURPOSE_CLAIM, JwtService.PURPOSE_PASSWORD_RESET,
                "email", user.getEmail()
        );

        String token = jwtService.generateToken(user.getId().toString(), claims, expirationSec);
        String resetUrl = appUtils.getOrigin() + "/reset-password?token=" + token;

        eventPublisher.publishEvent(new PasswordResetRequestedEvent(
                user.getEmail(),
                user.getUsername(),
                token,
                resetUrl
        ));

        return new MessageResponseDto("If an account exists with that email, a password reset link has been sent.");
    }

    @Transactional
    public MessageResponseDto resetPassword(String token, String newPassword) {
        Claims claims;
        try {
            claims = jwtService.parseClaims(token);
        } catch (InvalidJwtTokenException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid or expired password reset token");
        }

        String purpose = claims.get(JwtService.PURPOSE_CLAIM, String.class);
        if (!JwtService.PURPOSE_PASSWORD_RESET.equals(purpose)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid token purpose");
        }

        String subject = claims.getSubject();
        if (subject == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed reset token");
        }

        UUID userId = UUID.fromString(subject);
        User user = findById(userId);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        sessionService.revokeAllUserSessions(userId);

        return new MessageResponseDto("Password has been successfully reset. Please log in with your new password.");
    }

    @Transactional
    public void delete(UUID userId) {
        userRepository.deleteById(userId);
    }

    @Transactional
    public void selfDelete(UUID userId) {
        User user = findById(userId);
        String email = user.getEmail();
        String username = user.getUsername();

        user.setDeletedAt(OffsetDateTime.now());
        userRepository.save(user);

        sessionService.invalidateUserTokens(userId);

        eventPublisher.publishEvent(new UserDeletedEvent(email, username, false, null));
    }

    @Transactional
    public UserProfileResponseDto updateProfile(UUID userId, UpdateUserProfileRequestDto dto) {
        if (dto.username().isUndefined()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid update request.");
        }

        User user = findById(userId);

        if (dto.username().isPresent() && dto.username().get() != null) {
            String newUsername = dto.username().get();
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.findByUsername(newUsername).isPresent()) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
                }
                user.setUsername(newUsername);
            }
        }

        user.setUpdatedAt(OffsetDateTime.now());
        User saved = userRepository.save(user);
        return userMapper.toUserProfile(saved);
    }

    @Transactional
    public UserProfileResponseDto updateUserRole(String targetUsername, UpdateUserRoleRequestDto dto) {
        if(dto.role() == RoleType.ROOT){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update role to ROOT");
        } else if (dto.role() != RoleType.ADMIN && dto.role() != RoleType.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update role to COMMUNITY_MEMBER or COMMUNITY_ADMIN. Use community endpoints for that.");
        }

        User targetUser = userRepository.findByUsername(targetUsername).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        Role newRole = roleService.getRoleByName(dto.role());
        targetUser.setRoleId(newRole.getId());
        targetUser.setUpdatedAt(OffsetDateTime.now());
        User saved = userRepository.save(targetUser);

        sessionService.invalidateUserTokens(saved.getId());

        return userMapper.toUserProfile(saved);
    }

    @Transactional
    public void adminDeleteUser(String targetUsername, String reason) {
        User targetUser = userRepository.findByUsername(targetUsername).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));
        Role rootRole = roleService.getRoleByName(RoleType.ROOT);

        if (targetUser.getRoleId().equals(rootRole.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete user with ROOT role");
        }

        String email = targetUser.getEmail();
        String username = targetUser.getUsername();
        UUID targetId = targetUser.getId();

        userRepository.deleteById(targetId);
        sessionService.invalidateUserTokens(targetId);

        eventPublisher.publishEvent(new UserDeletedEvent(email, username, true, reason));
    }

    @Transactional
    public User registerOrLoginWithProvider(AuthProvider provider, String providerSubject, String providerEmail, boolean emailVerified) {
        if (provider == AuthProvider.LOCAL) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Use local registration or login for LOCAL provider"
            );
        }

        if (providerSubject == null || providerSubject.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider subject is required");
        }

        if (providerEmail == null || providerEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider email is required");
        }

        Optional<UserIdentity> existingIdentity = userIdentityService.findByProviderAndProviderSubject(
                provider,
                providerSubject
        );

        if (existingIdentity.isPresent()) {
            User user = existingIdentity.get().getUser();
            reactivateIfDeleted(user);
            setEmailVerified(user, emailVerified);
            return user;
        }

        Optional<User> existingUser = userRepository.findByEmail(providerEmail);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            reactivateIfDeleted(user);
            UserIdentity userIdentity = userMapper.toUserIdentity(
                    user,
                    provider,
                    providerSubject,
                    providerEmail,
                    OffsetDateTime.now()
            );

            userIdentityService.save(userIdentity);
            setEmailVerified(user, emailVerified);

            return user;
        }

        OffsetDateTime now = OffsetDateTime.now();

        User newUser = userMapper.toEntity(
                providerEmail,
                generateUsernameFromEmail(providerEmail),
                roleService.getRoleByName(RoleType.USER).getId(),
                now,
                emailVerified
        );

        User savedUser = userRepository.save(newUser);

        UserIdentity userIdentity = userMapper.toUserIdentity(
                savedUser,
                provider,
                providerSubject,
                providerEmail,
                OffsetDateTime.now()
        );

        userIdentityService.save(userIdentity);

        eventPublisher.publishEvent(new UserWelcomeEvent(savedUser.getEmail(), savedUser.getUsername()));

        return newUser;
    }

    @Transactional
    public User login(User user) {
        List<User> existingUser = userRepository.findByUsernameOrEmail(
                user.getUsername(),
                user.getEmail()
        );

        if (existingUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        User savedUser = existingUser.get(0);

        if (savedUser.getPassword() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This account does not have a password."
            );
        }

        if (!passwordEncoder.matches(user.getPassword(), savedUser.getPassword())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Incorrect password");
        }

        reactivateIfDeleted(savedUser);

        return savedUser;
    }

    @Scheduled(cron = "@daily")
    @Transactional
    public void purgeExpiredDeletedUsers() {
        OffsetDateTime threshold = OffsetDateTime.now().minusDays(SCHEDULE_DELETE_DAYS);
        List<User> expiredUsers = userRepository.findScheduledDeletedUsers(threshold);
        if (!expiredUsers.isEmpty()) {
            userRepository.deleteAll(expiredUsers);
        }
    }

    private void reactivateIfDeleted(User user) {
        if (user.getDeletedAt() != null) {
            if (user.getDeletedAt().isAfter(OffsetDateTime.now().minusDays(SCHEDULE_DELETE_DAYS))) {
                user.setDeletedAt(null);
                userRepository.save(user);
            } else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account has been deleted.");
            }
        }
    }

    @Transactional(readOnly = true)
    public UserProfileResponseDto getUserProfile(UUID userId) {
        User user = findById(userId);
        return userMapper.toUserProfile(user);
    }

    @Transactional(readOnly = true)
    public PageDto<UserEnrolledCommunityDto> getUserEnrolledCommunities(UUID userId, Pageable pageable) {
        Page<CommunityMember> memberships = communityMemberRepository.findMembershipsByUserIdWithCommunity(userId, pageable);
        return pageMapper.toPageDto(memberships.map(membership -> {
            Community community = membership.getCommunity();
            RoleType role = RoleType.valueOf(roleService.getRoleById(membership.getRoleId()).getName());
            return userMapper.toUserEnrolledCommunityDto(community, role.name(), membership.getJoinedAt());
        }));
    }

    private void setEmailVerified(User user, boolean emailVerified){
        if(emailVerified && !user.isEmailVerified()){
            user.setEmailVerified(true);
            userRepository.save(user);
        }
    }

    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.substring(0, email.indexOf("@"))
                .replaceAll("[^a-zA-Z0-9_]", "_");

        if (baseUsername.isBlank()) {
            baseUsername = "user";
        }

        String username = baseUsername;
        int randomInt = Random.randomInt(1, 1000);

        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + "_" + randomInt;
            randomInt = Random.randomInt(1, 1000);
        }

        return username;
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
