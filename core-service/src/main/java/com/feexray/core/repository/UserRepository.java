package com.feexray.core.repository;

import com.feexray.core.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByKeycloakSubjectId(String keycloakSubjectId);
    Optional<User> findByEmail(String email);
}
