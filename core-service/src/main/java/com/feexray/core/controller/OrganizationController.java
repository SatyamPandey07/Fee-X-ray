package com.feexray.core.controller;

import com.feexray.core.model.Organization;
import com.feexray.core.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orgs")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public List<Organization> getAllOrgs() {
        return organizationService.getAllOrganizations();
    }

    @GetMapping("/{id}")
    public Organization getOrgById(@PathVariable UUID id) {
        return organizationService.getOrganizationById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Organization createOrg(@Valid @RequestBody Organization organization) {
        return organizationService.createOrganization(organization);
    }

    @PutMapping("/{id}")
    public Organization updateOrg(@PathVariable UUID id, @Valid @RequestBody Organization details) {
        return organizationService.updateOrganization(id, details);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrg(@PathVariable UUID id) {
        organizationService.deleteOrganization(id);
    }
}
