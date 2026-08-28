package com.unihub.app.services.authentication;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.entities.authentication.AuthProvider;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authentication.UserIdentity;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.utils.Random;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserIdentityService userIdentityService;

    private final RoleService roleService;

    private final CommunityMemberRepository communityMemberRepository;

    @Transactional
    public User register(User user) {
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

        OffsetDateTime now = OffsetDateTime.now();

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        user.setRoleId(roleService.getRoleByName(RoleType.USER).getId());

        User savedUser = userRepository.save(user);

        UserIdentity localIdentity = UserIdentity.builder()
                .user(savedUser)
                .provider(AuthProvider.LOCAL)
                .providerSubject(savedUser.getEmail())
                .providerEmail(savedUser.getEmail())
                .createdAt(now)
                .build();

        userIdentityService.save(localIdentity);

        return savedUser;
    }

    @Transactional
    public void delete(UUID userId) {
        userRepository.deleteById(userId);
    }

    @Transactional
    public User registerOrLoginWithProvider(AuthProvider provider, String providerSubject, String providerEmail) {
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
            User user =  existingIdentity.get().getUser();
            return user;
        }

        Optional<User> existingUser = userRepository.findByEmail(providerEmail);

        if (existingUser.isPresent()) {
            // A user that has an account is logging in with a different provider
            UserIdentity userIdentity = buildProviderIdentity(
                    existingUser.get(),
                    provider,
                    providerSubject,
                    providerEmail
            );

            userIdentityService.save(userIdentity);

            return existingUser.get();
        }

        OffsetDateTime now = OffsetDateTime.now();

        User newUser = User.builder()
                .email(providerEmail)
                .username(generateUsernameFromEmail(providerEmail))
                .password(null)
                .createdAt(now)
                .updatedAt(now)
                .roleId(roleService.getRoleByName(RoleType.USER).getId())
                .build();

        User savedUser = userRepository.save(newUser);

        UserIdentity userIdentity = buildProviderIdentity(
                savedUser,
                provider,
                providerSubject,
                providerEmail
        );

        userIdentityService.save(userIdentity);

        return newUser;
    }

    private UserIdentity buildProviderIdentity(
            User user,
            AuthProvider provider,
            String providerSubject,
            String providerEmail
    ) {
        return UserIdentity.builder()
                .user(user)
                .provider(provider)
                .providerSubject(providerSubject)
                .providerEmail(providerEmail)
                .createdAt(OffsetDateTime.now())
                .build();
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

    public User login(User user) {
        List<User> existingUser = userRepository.findByUsernameOrEmail(
                user.getUsername(),
                user.getEmail()
        );

        if (existingUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        User savedUser = existingUser.get(0);

        if (savedUser.getPassword() == null || savedUser.getPassword().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This account does not have a password. Login using a third-party provider and set a password to use this feature."
            );
        }

        if (!passwordEncoder.matches(user.getPassword(), savedUser.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect password");
        }

        return savedUser;
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileResponseDto getUserProfile(UUID userId) {
        User user = findById(userId);
        String roleName = roleService.getRoleById(user.getRoleId()).getName();
        List<String> permissions = roleService.getPermissionNamesByRoleName(roleName);
        return  UserProfileResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(roleName)
                .permissions(permissions)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public UserCommunitiesResponseDto getUserEnrolledCommunities(UUID userId) {
        List<CommunityMember> memberships = communityMemberRepository.findMembershipsByUserIdWithCommunity(userId);
        Map<String, List<String>> permissionsByRole = new HashMap<>();

        List<UserEnrolledCommunityDto> communities = memberships.stream().map(membership -> {
            Community community = membership.getCommunity();
            String roleName = roleService.getRoleById(membership.getRoleId()).getName();

            permissionsByRole.computeIfAbsent(roleName, roleService::getPermissionNamesByRoleName);

            return UserEnrolledCommunityDto.builder()
                    .id(community.getId())
                    .name(community.getName())
                    .slug(community.getSlug())
                    .description(community.getDescription())
                    .memberCount(community.getMemberCount())
                    .role(roleName)
                    .build();
        }).toList();

        return new UserCommunitiesResponseDto(communities, permissionsByRole);
    }
}
