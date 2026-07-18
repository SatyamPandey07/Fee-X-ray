package com.feexray.core.controller;

import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.model.UserRole;
import com.feexray.core.repository.OrganizationRepository;
import com.feexray.core.repository.UserRepository;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BillingControllerIT {

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
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private Organization testOrg;
    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        organizationRepository.deleteAll();

        testOrg = organizationRepository.save(Organization.builder()
                .name("Billing Corp")
                .subscriptionTier("FREE")
                .build());

        testUser = userRepository.save(User.builder()
                .organization(testOrg)
                .email("billing@test.local")
                .keycloakSubjectId("billing-user-sub")
                .role(UserRole.OWNER)
                .build());
    }

    @Test
    void stripeWebhook_CheckoutSessionCompleted_ShouldUpgradeOrg() throws Exception {
        // Mock Stripe Checkout Session Completed event
        Event mockEvent = mock(Event.class);
        when(mockEvent.getType()).thenReturn("checkout.session.completed");

        Session mockSession = mock(Session.class);
        when(mockSession.getCustomer()).thenReturn("cus_mock123");
        when(mockSession.getSubscription()).thenReturn("sub_mock123");
        when(mockSession.getMetadata()).thenReturn(Map.of("orgId", testOrg.getId().toString()));

        com.stripe.model.EventDataObjectDeserializer mockDeserializer = mock(com.stripe.model.EventDataObjectDeserializer.class);
        when(mockDeserializer.getObject()).thenReturn(Optional.of(mockSession));
        when(mockEvent.getDataObjectDeserializer()).thenReturn(mockDeserializer);

        try (MockedStatic<Webhook> mockedWebhook = mockStatic(Webhook.class)) {
            mockedWebhook.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenReturn(mockEvent);

            mockMvc.perform(post("/api/v1/billing/webhook")
                            .header("Stripe-Signature", "t=123,v1=abc")
                            .content("raw_payload")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        Organization updatedOrg = organizationRepository.findById(testOrg.getId()).orElseThrow();
        assertThat(updatedOrg.getSubscriptionTier()).isEqualTo("PRO");
        assertThat(updatedOrg.getSubscriptionStatus()).isEqualTo("active");
        assertThat(updatedOrg.getStripeCustomerId()).isEqualTo("cus_mock123");
        assertThat(updatedOrg.getStripeSubscriptionId()).isEqualTo("sub_mock123");
    }

    @Test
    void stripeWebhook_SubscriptionDeleted_ShouldDowngradeOrg() throws Exception {
        // Setup initial Pro org
        testOrg.setSubscriptionTier("PRO");
        testOrg.setSubscriptionStatus("active");
        testOrg.setStripeSubscriptionId("sub_deleted123");
        organizationRepository.save(testOrg);

        // Mock Stripe Subscription Deleted event
        Event mockEvent = mock(Event.class);
        when(mockEvent.getType()).thenReturn("customer.subscription.deleted");

        Subscription mockSubscription = mock(Subscription.class);
        when(mockSubscription.getId()).thenReturn("sub_deleted123");
        when(mockSubscription.getStatus()).thenReturn("canceled");

        com.stripe.model.EventDataObjectDeserializer mockDeserializer = mock(com.stripe.model.EventDataObjectDeserializer.class);
        when(mockDeserializer.getObject()).thenReturn(Optional.of(mockSubscription));
        when(mockEvent.getDataObjectDeserializer()).thenReturn(mockDeserializer);

        try (MockedStatic<Webhook> mockedWebhook = mockStatic(Webhook.class)) {
            mockedWebhook.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenReturn(mockEvent);

            mockMvc.perform(post("/api/v1/billing/webhook")
                            .header("Stripe-Signature", "t=123,v1=abc")
                            .content("raw_payload")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        Organization updatedOrg = organizationRepository.findById(testOrg.getId()).orElseThrow();
        assertThat(updatedOrg.getSubscriptionTier()).isEqualTo("FREE");
        assertThat(updatedOrg.getSubscriptionStatus()).isEqualTo("canceled");
    }
}
