package com.feexray.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feexray.core.model.Organization;
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
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OrganizationControllerIT {

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
            System.err.println("Testcontainers failed to start, falling back to local running postgres: " + e.getMessage());
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

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();
    }

    @Test
    void firstLogin_shouldAutoProvisionAndAllowGetAndUpdate() throws Exception {
        // 1. OIDC login request (GET /api/v1/orgs) should trigger auto-provisioning
        String responseJson = mockMvc.perform(get("/api/v1/orgs")
                        .with(jwt().jwt(j -> j.subject("new-keycloak-sub").claim("email", "newuser@feexray.local"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("newuser@feexray.local's Org"))
                .andExpect(jsonPath("$[0].subscriptionTier").value("FREE"))
                .andReturn().getResponse().getContentAsString();

        List<Organization> orgs = objectMapper.readValue(responseJson, objectMapper.getTypeFactory().constructCollectionType(List.class, Organization.class));
        Organization provisioned = orgs.get(0);

        // 2. We can retrieve the organization by ID
        mockMvc.perform(get("/api/v1/orgs/" + provisioned.getId())
                        .with(jwt().jwt(j -> j.subject("new-keycloak-sub").claim("email", "newuser@feexray.local"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("newuser@feexray.local's Org"));

        // 3. We can update the organization name
        Organization updateReq = Organization.builder()
                .name("Updated Corp")
                .subscriptionTier("STARTER")
                .build();

        mockMvc.perform(put("/api/v1/orgs/" + provisioned.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq))
                        .with(jwt().jwt(j -> j.subject("new-keycloak-sub").claim("email", "newuser@feexray.local"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Corp"))
                .andExpect(jsonPath("$.subscriptionTier").value("STARTER"));
    }
}
