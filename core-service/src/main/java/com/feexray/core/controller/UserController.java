package com.feexray.core.controller;

import com.feexray.core.dto.UserRequest;
import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.model.UserRole;
import com.feexray.core.service.OrganizationService;
import com.feexray.core.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final OrganizationService organizationService;
    private final com.feexray.core.service.AuditLogger auditLogger;

    private User getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            throw new AccessDeniedException("User not authenticated or not onboarded");
        }
        return user;
    }

    @GetMapping
    public List<User> getAllUsers(HttpServletRequest request) {
        User current = getCurrentUser(request);
        // Only return users in the current user's organization
        return userService.getAllUsers().stream()
                .filter(u -> u.getOrganization().getId().equals(current.getOrganization().getId()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id, HttpServletRequest request) {
        User current = getCurrentUser(request);
        User target = userService.getUserById(id);
        if (!target.getOrganization().getId().equals(current.getOrganization().getId())) {
            throw new AccessDeniedException("Access denied to user: " + id);
        }
        return target;
    }

    @GetMapping("/by-keycloak/{keycloakSub}")
    public User getUserByKeycloakSub(@PathVariable String keycloakSub, HttpServletRequest request) {
        User current = getCurrentUser(request);
        User target = userService.getUserByKeycloakSubjectId(keycloakSub);
        if (!target.getOrganization().getId().equals(current.getOrganization().getId())) {
            throw new AccessDeniedException("Access denied to user with sub: " + keycloakSub);
        }
        return target;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@Valid @RequestBody UserRequest request, HttpServletRequest requestCtx) {
        User current = getCurrentUser(requestCtx);
        if (current.getRole() != UserRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can invite or create users");
        }
        if (!request.orgId().equals(current.getOrganization().getId())) {
            throw new AccessDeniedException("Cannot create a user in a different organization");
        }

        Organization org = organizationService.getOrganizationById(request.orgId());
        User user = User.builder()
                .organization(org)
                .email(request.email())
                .keycloakSubjectId(request.keycloakSubjectId())
                .role(request.role())
                .build();
        User createdUser = userService.createUser(user);
        auditLogger.logSensitiveAction("member_invited", request.orgId(), current.getId(), "Invited email: " + request.email() + " with role: " + request.role());
        return createdUser;
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable UUID id, @Valid @RequestBody UserRequest request, HttpServletRequest requestCtx) {
        User current = getCurrentUser(requestCtx);
        User target = userService.getUserById(id);
        if (!target.getOrganization().getId().equals(current.getOrganization().getId())) {
            throw new AccessDeniedException("Access denied to user: " + id);
        }
        if (current.getRole() != UserRole.OWNER && !current.getId().equals(id)) {
            throw new AccessDeniedException("Only OWNER or the user themselves can update profiles");
        }

        User details = User.builder()
                .email(request.email())
                .role(request.role())
                .build();
        return userService.updateUser(id, details);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id, HttpServletRequest requestCtx) {
        User current = getCurrentUser(requestCtx);
        User target = userService.getUserById(id);
        if (!target.getOrganization().getId().equals(current.getOrganization().getId())) {
            throw new AccessDeniedException("Access denied to user: " + id);
        }
        if (current.getRole() != UserRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can delete users");
        }
        if (current.getId().equals(id)) {
            throw new IllegalArgumentException("Cannot delete your own user account to prevent lockout");
        }
        userService.deleteUser(id);
    }
}
