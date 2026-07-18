package com.feexray.core.service;

import com.feexray.core.model.Organization;
import com.feexray.core.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @InjectMocks
    private OrganizationService organizationService;

    private Organization org;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        org = Organization.builder()
                .id(orgId)
                .name("Acme Corp")
                .subscriptionTier("FREE")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Test
    void getAllOrganizations_shouldReturnList() {
        when(organizationRepository.findAll()).thenReturn(List.of(org));
        List<Organization> result = organizationService.getAllOrganizations();
        assertThat(result).hasSize(1).contains(org);
        verify(organizationRepository, times(1)).findAll();
    }

    @Test
    void getOrganizationById_whenFound_shouldReturnOrg() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));
        Organization result = organizationService.getOrganizationById(orgId);
        assertThat(result).isEqualTo(org);
        verify(organizationRepository, times(1)).findById(orgId);
    }

    @Test
    void getOrganizationById_whenNotFound_shouldThrow() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> organizationService.getOrganizationById(orgId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Organization not found");
    }

    @Test
    void createOrganization_shouldSaveAndReturn() {
        when(organizationRepository.save(any(Organization.class))).thenReturn(org);
        Organization result = organizationService.createOrganization(org);
        assertThat(result).isEqualTo(org);
        verify(organizationRepository, times(1)).save(org);
    }

    @Test
    void updateOrganization_shouldModifyAndSave() {
        Organization updatedDetails = Organization.builder().name("New Name").subscriptionTier("GROWTH").build();
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));
        when(organizationRepository.save(any(Organization.class))).thenReturn(org);

        Organization result = organizationService.updateOrganization(orgId, updatedDetails);
        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getSubscriptionTier()).isEqualTo("GROWTH");
        verify(organizationRepository, times(1)).save(org);
    }

    @Test
    void deleteOrganization_shouldInvokeDelete() {
        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(org));
        doNothing().when(organizationRepository).delete(org);

        organizationService.deleteOrganization(orgId);
        verify(organizationRepository, times(1)).delete(org);
    }
}
