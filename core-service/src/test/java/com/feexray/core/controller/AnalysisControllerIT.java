package com.feexray.core.controller;

import com.feexray.core.config.RabbitConfig;
import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.model.UserRole;
import com.feexray.core.repository.OrganizationRepository;
import com.feexray.core.repository.UserRepository;
import com.feexray.core.model.AnalysisJob;
import com.feexray.core.repository.AnalysisJobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AnalysisControllerIT {

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

        try {
            RabbitMQContainer rabbit = new RabbitMQContainer("rabbitmq:3.13-management-alpine");
            rabbit.start();
            System.setProperty("spring.rabbitmq.host", rabbit.getHost());
            System.setProperty("spring.rabbitmq.port", rabbit.getAmqpPort().toString());
            System.setProperty("spring.rabbitmq.username", rabbit.getAdminUsername());
            System.setProperty("spring.rabbitmq.password", rabbit.getAdminPassword());
        } catch (Exception e) {
            System.setProperty("spring.rabbitmq.host", "localhost");
            System.setProperty("spring.rabbitmq.port", "5672");
            System.setProperty("spring.rabbitmq.username", "feexray");
            System.setProperty("spring.rabbitmq.password", "changeme");
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnalysisJobRepository analysisJobRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private Organization testOrg;
    private User testUser;

    @BeforeEach
    void setUp() {
        analysisJobRepository.deleteAll();
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        testOrg = Organization.builder()
                .name("E2E Testing Org")
                .subscriptionTier("FREE")
                .build();
        testOrg = organizationRepository.save(testOrg);

        testUser = User.builder()
                .email("tester@feexray.local")
                .keycloakSubjectId("keycloak-sub-tester-job")
                .role(UserRole.OWNER)
                .organization(testOrg)
                .build();
        testUser = userRepository.save(testUser);
    }

    @Test
    void testEndToEndAnalysisLifecycle() throws Exception {
        // 1. Submit analysis run request via endpoint
        String responseStr = mockMvc.perform(post("/api/v1/analysis/run")
                        .with(jwt().jwt(j -> j.subject("keycloak-sub-tester-job")))
                        .requestAttr("currentUser", testUser)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        // 2. Consume request message from RabbitMQ (simulating python-analysis-engine worker)
        Object message = rabbitTemplate.receiveAndConvert(RabbitConfig.REQUEST_QUEUE, 5000);
        assertThat(message).isInstanceOf(Map.class);
        
        Map<?, ?> requestMsg = (Map<?, ?>) message;
        String jobIdStr = (String) requestMsg.get("jobId");
        String orgIdStr = (String) requestMsg.get("orgId");
        
        assertThat(jobIdStr).isNotNull();
        assertThat(orgIdStr).isEqualTo(testOrg.getId().toString());

        // 3. Publish mock completion response back to RabbitMQ (simulating rules engine outcome)
        Map<String, String> responseMsg = Map.of(
                "jobId", jobIdStr,
                "orgId", orgIdStr,
                "status", "COMPLETED",
                "summary", "End-to-end integration test run completed. Detected 3 findings totaling $250.00."
        );
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.RESPONSE_KEY, responseMsg);

        // 4. Await database state update asynchronously (listener processing)
        UUID jobId = UUID.fromString(jobIdStr);
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            Optional<AnalysisJob> jobOpt = analysisJobRepository.findById(jobId);
            assertThat(jobOpt).isPresent();
            assertThat(jobOpt.get().getStatus()).isEqualTo("COMPLETED");
            assertThat(jobOpt.get().getResultsSummary()).contains("totaling $250.00");
        });

        // 5. Query status and retrieve results via API endpoint
        mockMvc.perform(get("/api/v1/analysis/jobs/" + jobIdStr)
                        .with(jwt().jwt(j -> j.subject("keycloak-sub-tester-job")))
                        .requestAttr("currentUser", testUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.resultsSummary").value("End-to-end integration test run completed. Detected 3 findings totaling $250.00."));
    }

    @Test
    void testCrossOrgRetrievalBlocked() throws Exception {
        Organization otherOrg = Organization.builder()
                .name("Other Org")
                .subscriptionTier("FREE")
                .build();
        otherOrg = organizationRepository.save(otherOrg);

        AnalysisJob otherJob = AnalysisJob.builder()
                .orgId(otherOrg.getId())
                .status("PENDING")
                .build();
        otherJob = analysisJobRepository.save(otherJob);

        mockMvc.perform(get("/api/v1/analysis/jobs/" + otherJob.getId())
                        .with(jwt().jwt(j -> j.subject("keycloak-sub-tester-job")))
                        .requestAttr("currentUser", testUser))
                .andExpect(status().isForbidden());
    }
}
