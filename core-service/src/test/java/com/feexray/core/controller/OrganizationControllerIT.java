package com.feexray.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feexray.core.model.Organization;
import com.feexray.core.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OrganizationControllerIT {

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
    private OrganizationRepository organizationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        organizationRepository.deleteAll();
    }

    @Test
    void createAndGetOrganization_shouldSucceed() throws Exception {
        Organization request = Organization.builder()
                .name("Acme Corporation")
                .subscriptionTier("STARTER")
                .build();

        String responseJson = mockMvc.perform(post("/api/v1/orgs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Acme Corporation"))
                .andExpect(jsonPath("$.subscriptionTier").value("STARTER"))
                .andReturn().getResponse().getContentAsString();

        Organization created = objectMapper.readValue(responseJson, Organization.class);

        mockMvc.perform(get("/api/v1/orgs/" + created.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corporation"))
                .andExpect(jsonPath("$.subscriptionTier").value("STARTER"));

        assertThat(organizationRepository.findById(created.getId())).isPresent();
    }
}
