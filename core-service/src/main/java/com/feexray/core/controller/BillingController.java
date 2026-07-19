package com.feexray.core.controller;

import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.repository.OrganizationRepository;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final OrganizationRepository organizationRepository;
    private final com.feexray.core.service.AuditLogger auditLogger;

    @Value("${stripe.api-key}")
    private String apiKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.pro-price-id}")
    private String proPriceId;

    @PostConstruct
    public void init() {
        Stripe.apiKey = apiKey;
    }

    private User getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            throw new AccessDeniedException("User not authenticated or not onboarded");
        }
        return user;
    }

    @PostMapping("/checkout")
    public Map<String, String> createCheckoutSession(HttpServletRequest request) throws Exception {
        User user = getCurrentUser(request);
        Organization org = user.getOrganization();

        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl("http://localhost:3000/billing?success=true")
                .setCancelUrl("http://localhost:3000/billing?canceled=true")
                .putMetadata("orgId", org.getId().toString())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPrice(proPriceId)
                        .setQuantity(1L)
                        .build());

        if (org.getStripeCustomerId() != null) {
            builder.setCustomer(org.getStripeCustomerId());
        }

        Session session = Session.create(builder.build());
        return Map.of("url", session.getUrl());
    }

    @PostMapping("/portal")
    public Map<String, String> createPortalSession(HttpServletRequest request) throws Exception {
        User user = getCurrentUser(request);
        Organization org = organizationRepository.findById(user.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        if (org.getStripeCustomerId() == null) {
            throw new IllegalStateException("Organization does not have a registered Stripe customer yet");
        }

        com.stripe.param.billingportal.SessionCreateParams params =
                com.stripe.param.billingportal.SessionCreateParams.builder()
                        .setCustomer(org.getStripeCustomerId())
                        .setReturnUrl("http://localhost:3000/billing")
                        .build();

        com.stripe.model.billingportal.Session portalSession = com.stripe.model.billingportal.Session.create(params);
        return Map.of("url", portalSession.getUrl());
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            switch (event.getType()) {
                case "checkout.session.completed":
                    Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (session != null) {
                        String orgIdStr = session.getMetadata().get("orgId");
                        if (orgIdStr != null) {
                            UUID orgId = UUID.fromString(orgIdStr);
                            Organization org = organizationRepository.findById(orgId).orElse(null);
                            if (org != null) {
                                org.setStripeCustomerId(session.getCustomer());
                                org.setStripeSubscriptionId(session.getSubscription());
                                org.setSubscriptionStatus("active");
                                org.setSubscriptionTier("PRO");
                                organizationRepository.save(org);
                                auditLogger.logSensitiveAction("billing_tier_changed", org.getId(), null, "Tier upgraded to PRO via Checkout");
                            }
                        }
                    }
                    break;

                case "customer.subscription.updated":
                case "customer.subscription.deleted":
                    Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (subscription != null) {
                        Optional<Organization> orgOpt = organizationRepository.findByStripeSubscriptionId(subscription.getId());
                        if (orgOpt.isPresent()) {
                            Organization org = orgOpt.get();
                            org.setSubscriptionStatus(subscription.getStatus());
                            if ("active".equalsIgnoreCase(subscription.getStatus()) || "trialing".equalsIgnoreCase(subscription.getStatus())) {
                                org.setSubscriptionTier("PRO");
                            } else {
                                org.setSubscriptionTier("FREE");
                            }
                            organizationRepository.save(org);
                            auditLogger.logSensitiveAction("billing_tier_changed", org.getId(), null, "Tier changed to " + org.getSubscriptionTier() + " via Webhook");
                        }
                    }
                    break;

                default:
                    break;
            }

            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook Error: " + e.getMessage());
        }
    }
}
