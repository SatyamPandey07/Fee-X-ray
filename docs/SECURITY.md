# Security Posture of Fee X-ray

This document outlines the proactive security measures, tools, and configurations implemented across the Fee X-ray microservice architecture to ensure system resilience and data privacy.

## 1. Rate Limiting (DDoS Protection & Throttling)
- **Java Core Service (`core-service`)**: API rate limiting is enforced globally using `Bucket4j`. We apply tiered limits based on the organization's subscription plan (e.g., Free vs. PRO), preventing abusive scraping or accidental DoS attacks from high-volume clients.
- **Python Analysis Engine (`analysis-engine`)**: The FastAPI service utilizes `slowapi` to protect sensitive routes (like the Plaid `/link-token` and `/exchange-token` endpoints) from brute-force or abuse.

## 2. Audit Logging
Comprehensive audit logs are generated for all sensitive actions. These logs currently output to standard out (stdout) prefixed with `AUDIT_LOG |` for easy ingestion into SIEM tools like Splunk or Datadog.
- **Billing Tier Changes**: Logged in `BillingController.java` when checkout sessions complete or webhooks trigger plan updates.
- **Member Invitations**: Logged in `UserController.java` whenever an owner adds a new member.
- **Bank Connections**: Logged in `plaid.py` whenever a Plaid Link flow successfully connects a new institution.

## 3. Secrets Management & Scanning
- **Environment Variables**: Hardcoded credentials (like `mock_client_id` for Plaid, or database passwords) have been entirely removed. All microservices fetch secrets via OS environment variables.
- **Continuous Integration Check**: We utilize `TruffleHog` inside a GitHub Actions workflow (`secret-scan.yml`). This scans all incoming pull requests and commits to ensure no high-entropy secrets or API keys are accidentally committed to the repository.

## 4. Frontend Security Headers
The Next.js frontend (`frontend/next.config.mjs`) injects the following HTTP security headers into all responses:
- **Content-Security-Policy (CSP)**: Strictly controls where resources (scripts, images, fonts) can be loaded from, mitigating Cross-Site Scripting (XSS).
- **X-Frame-Options (`DENY`)**: Prevents clickjacking attacks by refusing to render the site inside an iframe.
- **X-Content-Type-Options (`nosniff`)**: Mitigates MIME-type sniffing.
- **Referrer-Policy (`strict-origin-when-cross-origin`)**: Protects referrer information when navigating across origins.
- **Strict-Transport-Security (HSTS)**: Mandates HTTPS for all future connections.

## 5. Dependency Management and Vulnerability Scanning
- **Dependabot**: Configured in `.github/dependabot.yml` to run weekly across all ecosystems (npm, Gradle, pip) and automatically open PRs for outdated dependencies.
- **CodeQL**: Configured in `.github/workflows/codeql.yml` to perform deep static analysis for security vulnerabilities on Java, Python, and JavaScript/TypeScript codebases.
