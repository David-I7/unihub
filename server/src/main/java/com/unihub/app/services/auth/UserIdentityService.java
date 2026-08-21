package com.unihub.app.services.auth;

import com.unihub.app.domain.AuthProvider;
import com.unihub.app.entities.auth.User;
import com.unihub.app.entities.auth.UserIdentity;
import com.unihub.app.repositories.auth.UserIdentityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserIdentityService {

    private final UserIdentityRepository userIdentityRepository;

    public Optional<UserIdentity> findByProviderAndProviderSubject(AuthProvider provider, String providerSubject) {
        return userIdentityRepository.findByProviderAndProviderSubject(provider, providerSubject);
    }

    public boolean existsByProviderAndProviderSubject(AuthProvider provider, String providerSubject) {
        return userIdentityRepository.existsByProviderAndProviderSubject(provider, providerSubject);
    }

    public Set<UserIdentity> findAllByUser(User user) {
        return userIdentityRepository.findAllByUser(user);
    }

    public UserIdentity save(UserIdentity userIdentity) {
        return userIdentityRepository.save(userIdentity);
    }
}
