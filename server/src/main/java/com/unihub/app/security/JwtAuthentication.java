package com.unihub.app.security;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import lombok.Getter;
import lombok.Setter;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

@Getter
@Setter
public class JwtAuthentication implements Authentication {

    private UserDto userDto;

    private List<GrantedAuthority> authorities = List.of();

    private RoleType globalRole;

    public JwtAuthentication(UserDto userDto){
        this.userDto = userDto;
        this.globalRole = userDto.role();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + userDto.role().name()));
    }

    public UserDto getUserDto() {
        return userDto;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public @Nullable Object getCredentials() {
        return null;
    }

    @Override
    public @Nullable Object getDetails() {
        return null;
    }

    @Override
    public @Nullable Object getPrincipal() {
        return userDto;
    }

    @Override
    public boolean isAuthenticated() {
        return true;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
    }

    @Override
    public String getName() {
        return userDto.username();
    }
}
