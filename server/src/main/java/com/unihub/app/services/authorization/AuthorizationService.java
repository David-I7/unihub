package com.unihub.app.services.authorization;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepository userRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final RoleService roleService;

    public JwtAuthentication safeRequireAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthentication jwtAuthentication && jwtAuthentication.isAuthenticated()) {
            return jwtAuthentication;
        }
        return null;
    }

    public JwtAuthentication requireAuthentication() {
        JwtAuthentication authentication = safeRequireAuthentication();
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return authentication;
    }

    public String getGlobalRoleName(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return roleService.getRoleById(user.getRoleId()).getName();
    }

    public boolean hasGlobalPermission(UUID userId, String permission) {
        String roleName = getGlobalRoleName(userId);
        List<String> permissions = roleService.getPermissionNamesByRoleName(roleName);
        return permissions.contains(permission);
    }

    public boolean isCommunityMember(String communitySlug, UUID userId) {
        return communityMemberRepository.isMemberOfCommunity(communitySlug, userId);
    }

    public Optional<String> getCommunityRoleName(String communitySlug, UUID userId) {
        return communityMemberRepository.findMemberByCommunitySlug(communitySlug, userId)
                .map(CommunityMember::getRoleId)
                .map(roleId -> roleService.getRoleById(roleId).getName());
    }

    public boolean hasCommunityPermission(String communitySlug, UUID userId, String permission) {
        // Global ROOT / ADMIN override
        String globalRole = getGlobalRoleName(userId);
        if ("ROOT".equals(globalRole) || "ADMIN".equals(globalRole)) {
            List<String> globalPermissions = roleService.getPermissionNamesByRoleName(globalRole);
            if (globalPermissions.contains(permission)) {
                return true;
            }
        }

        // Community role permission check
        Optional<String> communityRole = getCommunityRoleName(communitySlug, userId);
        if (communityRole.isEmpty()) {
            return false;
        }

        List<String> permissions = roleService.getPermissionNamesByRoleName(communityRole.get());
        return permissions.contains(permission);
    }



    public void requireGlobalPermission(PermissionType permission) {
        UserDto user = requireAuthentication().getUserDto();
        if (!hasGlobalPermission(user.id(), permission.getValue())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied: " + permission.getValue());
        }
    }

    public void requireCommunityPermission(String communitySlug, PermissionType permission) {
        UserDto user = requireAuthentication().getUserDto();
        if (!hasCommunityPermission(communitySlug, user.id(), permission.getValue())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied: " + permission.getValue());
        }
    }
}
