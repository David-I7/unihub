package com.unihub.app.services.authorization;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

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

    public RoleType getGlobalRole() {
        JwtAuthentication auth = safeRequireAuthentication();
        return auth != null  ? auth.getUserDto().role() : null;
    }

    public boolean hasGlobalPermission(PermissionType permission) {
        RoleType globalRole = getGlobalRole();
        if (globalRole == null || permission == null) {
            return false;
        }
        return roleService.getPermissionNamesByRoleType(globalRole).contains(permission.name());
    }

    public boolean isCommunityMember(String communitySlug, UUID userId) {
        return communityMemberRepository.isMemberOfCommunity(communitySlug, userId);
    }

    public Optional<RoleType> getCommunityRole(String communitySlug, UUID userId) {
        return communityMemberRepository.findMemberByCommunitySlug(communitySlug, userId)
                .map(CommunityMember::getRoleId)
                .map(roleService::getRoleById)
                .map(role-> RoleType.valueOf(role.getName()));
    }

    public boolean hasCommunityPermission(String communitySlug, UUID userId, PermissionType permission) {
        RoleType globalRole = getGlobalRole();
        if (globalRole != null) {
            if (roleService.getPermissionNamesByRoleType(globalRole).contains(permission.name())) {
                return true;
            }
        }

        Optional<RoleType> communityRole = getCommunityRole(communitySlug, userId);
        if (communityRole.isEmpty()) {
            return false;
        }

        return roleService.getPermissionNamesByRoleType(communityRole.get()).contains(permission.name());
    }
}
