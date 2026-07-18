package com.feexray.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.model.UserRole;
import com.feexray.core.repository.OrganizationRepository;
import com.feexray.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import java.util.UUID;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityControllerIT {

    @MockBean
    private JwtDecoder jwtDecoder;

    static {
        try {
            PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
            postgres.start();
            System.setProperty("spring.datasource.url", postgres.getJdbcUrl());
            System.setProperty("spring.datasource.username", postgres.getUsername());
            System.setProperty("spring.datasource.password", postgres.getPassword());
        } catch (Exception e) {
            System.setProperty("spring.datasource.url", "jdbc:postgresql://localhost:5432/feexray_core");
            System.setProperty("spring.datasource.username", "feexray");
            System.setProperty("spring.datasource.password", "changeme");
        }
        System.setProperty("spring.jpa.hibernate.ddl-auto", "none");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Organization org1;
    private Organization org2;
    private User ownerOrg1;
    private User memberOrg1;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        org1 = organizationRepository.save(Organization.builder().name("Org One").subscriptionTier("FREE").build());
        org2 = organizationRepository.save(Organization.builder().name("Org Two").subscriptionTier("FREE").build());

        ownerOrg1 = userRepository.save(User.builder()
                .organization(org1)
                .email("owner@org1.local")
                .keycloakSubjectId("owner-sub-org1")
                .role(UserRole.OWNER)
                .build());

        memberOrg1 = userRepository.save(User.builder()
                .organization(org1)
                .email("member@org1.local")
                .keycloakSubjectId("member-sub-org1")
                .role(UserRole.MEMBER)
                .build());
    }

    @Test
    void unauthenticatedRequest_shouldBeRejected() throws Exception {
        mockMvc.perform(get("/api/v1/orgs/" + org1.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedRequest_toOwnOrg_shouldSucceed() throws Exception {
        mockMvc.perform(get("/api/v1/orgs/" + org1.getId())
                        .with(jwt().jwt(j -> j.subject("owner-sub-org1").claim("email", "owner@org1.local"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Org One"));
    }

    @Test
    void authenticatedRequest_toOtherOrg_shouldBeForbidden() throws Exception {
        // user belonging to org1 tries to access org2
        mockMvc.perform(get("/api/v1/orgs/" + org2.getId())
                        .with(jwt().jwt(j -> j.subject("owner-sub-org1").claim("email", "owner@org1.local"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void memberUser_tryingToUpdateOrg_shouldBeForbidden() throws Exception {
        // MEMBER role should not be allowed to edit organization
        Organization updateReq = Organization.builder().name("Hacked Name").build();
        mockMvc.perform(put("/api/v1/orgs/" + org1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq))
                        .with(jwt().jwt(j -> j.subject("member-sub-org1").claim("email", "member@org1.local"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void ownerUser_tryingToUpdateOrg_shouldSucceed() throws Exception {
        // OWNER role should be allowed to edit organization
        Organization updateReq = Organization.builder().name("Updated Org One").build();
        mockMvc.perform(put("/api/v1/orgs/" + org1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq))
                        .with(jwt().jwt(j -> j.subject("owner-sub-org1").claim("email", "owner@org1.local"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Org One"));
    }
}
