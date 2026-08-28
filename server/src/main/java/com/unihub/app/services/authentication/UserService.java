package com.unihub.app.services.authentication;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
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
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
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
    private final CommunityRepository communityRepository;
    private final UserMapper userMapper;

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

        UserIdentity localIdentity = userMapper.toUserIdentity(
                savedUser,
                AuthProvider.LOCAL,
                savedUser.getEmail(),
                savedUser.getEmail(),
                now
        );

        userIdentityService.save(localIdentity);

        return savedUser;
    }

    @Transactional
    public void delete(UUID userId) {
        userRepository.deleteById(userId);
    }

    @Transactional
    public void selfDelete(UUID userId) {
        if (communityRepository.existsByOwnerId(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete account while owning communities. Transfer ownership or delete your communities first."
            );
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public UserProfileResponseDto updateProfile(UUID userId, UpdateUserProfileRequestDto dto) {
        User user = findById(userId);

        if (dto.username() != null) {
            if (userRepository.findByUsername(dto.username()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
            }
            user.setUsername(dto.username());
        }

        // TODO: update to email notification for setting a new password
        if (dto.newPassword() != null) {
            if (user.getPassword() != null) {
                if (dto.currentPassword() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required to set a new password");
                }
                if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
                }
            }
            user.setPassword(passwordEncoder.encode(dto.newPassword()));
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

        return userMapper.toUserProfile(saved);
    }

    @Transactional
    public void adminDeleteUser(String targetUsername) {
        User targetUser = userRepository.findByUsername(targetUsername).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));
        Role rootRole = roleService.getRoleByName(RoleType.ROOT);

        if (targetUser.getRoleId().equals(rootRole.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete user with ROOT role");
        }

        if (communityRepository.existsByOwnerId(targetUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete user who owns communities. Transfer community ownership or delete communities first."
            );
        }

        userRepository.deleteById(targetUser.getId());
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
            User user = existingIdentity.get().getUser();
            return user;
        }

        Optional<User> existingUser = userRepository.findByEmail(providerEmail);

        if (existingUser.isPresent()) {
            UserIdentity userIdentity = userMapper.toUserIdentity(
                    existingUser.get(),
                    provider,
                    providerSubject,
                    providerEmail,
                    OffsetDateTime.now()
            );

            userIdentityService.save(userIdentity);

            return existingUser.get();
        }

        OffsetDateTime now = OffsetDateTime.now();

        User newUser = userMapper.toEntity(
                providerEmail,
                generateUsernameFromEmail(providerEmail),
                roleService.getRoleByName(RoleType.USER).getId(),
                now
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

        return newUser;
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
        return userMapper.toUserProfile(user);
    }

    @Transactional(readOnly = true)
    public UserCommunitiesResponseDto getUserEnrolledCommunities(UUID userId) {
        List<CommunityMember> memberships = communityMemberRepository.findMembershipsByUserIdWithCommunity(userId);
        Map<String, List<String>> permissionsByRole = new HashMap<>();

        List<UserEnrolledCommunityDto> communities = memberships.stream().map(membership -> {
            Community community = membership.getCommunity();
            String roleName = roleService.getRoleById(membership.getRoleId()).getName();

            permissionsByRole.computeIfAbsent(roleName, roleService::getPermissionNamesByRoleName);

            return userMapper.toUserEnrolledCommunityDto(community, roleName, membership.getJoinedAt());
        }).toList();

        return userMapper.toUserCommunitiesResponseDto(communities, permissionsByRole);
    }
}
