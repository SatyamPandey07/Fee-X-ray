package com.feexray.core.service;

import com.feexray.core.exception.EntitlementLimitExceededException;
import com.feexray.core.model.Organization;
import com.feexray.core.repository.BankConnectionRepository;
import com.feexray.core.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EntitlementService {

    private final OrganizationRepository organizationRepository;
    private final BankConnectionRepository bankConnectionRepository;

    public void checkConnectionEntitlement(UUID orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + orgId));

        boolean isProActive = "PRO".equalsIgnoreCase(org.getSubscriptionTier()) 
                && "active".equalsIgnoreCase(org.getSubscriptionStatus());

        if (!isProActive) {
            long currentCount = bankConnectionRepository.countByOrganizationId(orgId);
            if (currentCount >= 1) {
                throw new EntitlementLimitExceededException(
                        "Free tier limits organization to a maximum of 1 bank connection. Please upgrade to Pro."
                );
            }
        }
    }

    public boolean isAutoAnalysisAllowed(UUID orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + orgId));

        return "PRO".equalsIgnoreCase(org.getSubscriptionTier()) 
                && "active".equalsIgnoreCase(org.getSubscriptionStatus());
    }
}
