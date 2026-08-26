package com.unihub.app.services.authorization;

import com.unihub.app.security.JwtAuthentication;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthorizationService {

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
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authentication required");
        }
        return authentication;
    }
}
