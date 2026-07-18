package com.feexray.core.controller;

import com.feexray.core.dto.UserRequest;
import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.service.OrganizationService;
import com.feexray.core.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final OrganizationService organizationService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @GetMapping("/by-keycloak/{keycloakSub}")
    public User getUserByKeycloakSub(@PathVariable String keycloakSub) {
        return userService.getUserByKeycloakSubjectId(keycloakSub);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@Valid @RequestBody UserRequest request) {
        Organization org = organizationService.getOrganizationById(request.orgId());
        User user = User.builder()
                .organization(org)
                .email(request.email())
                .keycloakSubjectId(request.keycloakSubjectId())
                .role(request.role())
                .build();
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable UUID id, @Valid @RequestBody UserRequest request) {
        User details = User.builder()
                .email(request.email())
                .role(request.role())
                .build();
        return userService.updateUser(id, details);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
    }
}
