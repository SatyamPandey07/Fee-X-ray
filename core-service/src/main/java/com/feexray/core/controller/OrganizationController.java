package com.feexray.core.controller;

import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.model.UserRole;
import com.feexray.core.service.OrganizationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orgs")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    private User getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            throw new AccessDeniedException("User not authenticated or not onboarded");
        }
        return user;
    }

    @GetMapping
    public List<Organization> getAllOrgs(HttpServletRequest request) {
        User user = getCurrentUser(request);
        // Only return the user's own organization
        return List.of(user.getOrganization());
    }

    @GetMapping("/{id}")
    public Organization getOrgById(@PathVariable UUID id, HttpServletRequest request) {
        User user = getCurrentUser(request);
        if (!user.getOrganization().getId().equals(id)) {
            throw new AccessDeniedException("Access denied to organization: " + id);
        }
        return organizationService.getOrganizationById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Organization createOrg(@Valid @RequestBody Organization organization, HttpServletRequest request) {
        // Organizations are automatically created upon OIDC login
        throw new AccessDeniedException("Organizations are auto-provisioned. Manual creation is disabled.");
    }

    @PutMapping("/{id}")
    public Organization updateOrg(@PathVariable UUID id, @Valid @RequestBody Organization details, HttpServletRequest request) {
        User user = getCurrentUser(request);
        if (!user.getOrganization().getId().equals(id)) {
            throw new AccessDeniedException("Access denied to organization: " + id);
        }
        if (user.getRole() != UserRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can update the organization");
        }
        return organizationService.updateOrganization(id, details);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrg(@PathVariable UUID id, HttpServletRequest request) {
        User user = getCurrentUser(request);
        if (!user.getOrganization().getId().equals(id)) {
            throw new AccessDeniedException("Access denied to organization: " + id);
        }
        if (user.getRole() != UserRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can delete the organization");
        }
        organizationService.deleteOrganization(id);
    }
}
