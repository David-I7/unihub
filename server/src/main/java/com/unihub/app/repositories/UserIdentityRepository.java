package com.unihub.app.repositories;

import com.unihub.app.entities.UserIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserIdentityRepository extends JpaRepository<UserIdentity, UUID> {
}
