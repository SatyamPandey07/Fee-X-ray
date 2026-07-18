package com.feexray.core.service;

import com.feexray.core.model.Organization;
import com.feexray.core.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Organization getOrganizationById(UUID id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found with id: " + id));
    }

    @Transactional
    public Organization createOrganization(Organization organization) {
        return organizationRepository.save(organization);
    }

    @Transactional
    public Organization updateOrganization(UUID id, Organization details) {
        Organization existing = getOrganizationById(id);
        existing.setName(details.getName());
        if (details.getSubscriptionTier() != null) {
            existing.setSubscriptionTier(details.getSubscriptionTier());
        }
        return organizationRepository.save(existing);
    }

    @Transactional
    public void deleteOrganization(UUID id) {
        Organization existing = getOrganizationById(id);
        organizationRepository.delete(existing);
    }
}
