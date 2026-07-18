package com.feexray.core.service;

import com.feexray.core.exception.EntitlementLimitExceededException;
import com.feexray.core.model.Organization;
import com.feexray.core.repository.BankConnectionRepository;
import com.feexray.core.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EntitlementServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private BankConnectionRepository bankConnectionRepository;

    @InjectMocks
    private EntitlementService entitlementService;

    private UUID orgId;
    private Organization freeOrg;
    private Organization activeProOrg;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        freeOrg = Organization.builder()
                .id(orgId)
                .name("Free Corp")
                .subscriptionTier("FREE")
                .build();

        activeProOrg = Organization.builder()
                .id(orgId)
                .name("Pro Corp")
                .subscriptionTier("PRO")
                .subscriptionStatus("active")
                .build();
    }

    @Test
    void checkConnectionEntitlement_FreeTier_NoConnections_ShouldSucceed() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(freeOrg));
        when(bankConnectionRepository.countByOrganizationId(orgId)).thenReturn(0L);

        entitlementService.checkConnectionEntitlement(orgId);

        verify(bankConnectionRepository).countByOrganizationId(orgId);
    }

    @Test
    void checkConnectionEntitlement_FreeTier_HasConnections_ShouldThrowException() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(freeOrg));
        when(bankConnectionRepository.countByOrganizationId(orgId)).thenReturn(1L);

        assertThatThrownBy(() -> entitlementService.checkConnectionEntitlement(orgId))
                .isInstanceOf(EntitlementLimitExceededException.class)
                .hasMessageContaining("Please upgrade to Pro");
    }

    @Test
    void checkConnectionEntitlement_ProTier_HasConnections_ShouldSucceed() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(activeProOrg));

        // Should not query repository since organization has active PRO tier
        entitlementService.checkConnectionEntitlement(orgId);

        verify(bankConnectionRepository, never()).countByOrganizationId(any());
    }

    @Test
    void isAutoAnalysisAllowed_FreeTier_ShouldReturnFalse() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(freeOrg));

        boolean allowed = entitlementService.isAutoAnalysisAllowed(orgId);

        assertThat(allowed).isFalse();
    }

    @Test
    void isAutoAnalysisAllowed_ProActive_ShouldReturnTrue() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(activeProOrg));

        boolean allowed = entitlementService.isAutoAnalysisAllowed(orgId);

        assertThat(allowed).isTrue();
    }
}
