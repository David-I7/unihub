package com.unihub.app.repositories.authentication;

import com.unihub.app.entities.authentication.AuthProvider;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authentication.UserIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface UserIdentityRepository extends JpaRepository<UserIdentity, UUID> {

    @Query("SELECT u FROM UserIdentity u WHERE u.provider = :provider AND u.providerSubject = :providerSubject")
    Optional<UserIdentity> findByProviderAndProviderSubject(AuthProvider provider, String providerSubject);

    @Query("SELECT EXISTS(SELECT 1 FROM UserIdentity u WHERE u.provider = :provider AND u.providerSubject = :providerSubject)")
    boolean existsByProviderAndProviderSubject(AuthProvider provider, String providerSubject);

    @Query("SELECT u FROM UserIdentity u WHERE u.user.id = :userId")
    Set<UserIdentity> findAllByUser(User user);
}
