package com.feexray.core.service;

import com.feexray.core.model.User;
import com.feexray.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User getUserByKeycloakSubjectId(String keycloakSubjectId) {
        return userRepository.findByKeycloakSubjectId(keycloakSubjectId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with Keycloak Subject: " + keycloakSubjectId));
    }

    @Transactional
    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User already exists with email: " + user.getEmail());
        }
        if (userRepository.findByKeycloakSubjectId(user.getKeycloakSubjectId()).isPresent()) {
            throw new IllegalArgumentException("User already exists with Keycloak Subject: " + user.getKeycloakSubjectId());
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, User details) {
        User existing = getUserById(id);
        existing.setEmail(details.getEmail());
        existing.setRole(details.getRole());
        return userRepository.save(existing);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User existing = getUserById(id);
        userRepository.delete(existing);
    }
}
