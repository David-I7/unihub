package com.unihub.app.repositories.authentication;

import com.unihub.app.entities.authentication.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u WHERE u.username = :username or u.email = :email")
    List<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findByUsername(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    long countByRoleId(UUID roleId);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NOT NULL AND u.deletedAt <= :threshold")
    List<User> findScheduledDeletedUsers(@Param("threshold") OffsetDateTime threshold);
}
