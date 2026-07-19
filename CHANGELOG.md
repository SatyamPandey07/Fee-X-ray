# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-19

### Added
- **Core Platform**: Complete multi-service architecture (Java Core, Python Analysis Engine, Next.js Frontend).
- **Authentication**: Keycloak OpenID Connect (OIDC) integration with SSO auto-provisioning.
- **Billing**: Stripe subscription integration (FREE and PRO tiers) with webhook processing.
- **Bank Connectivity**: Plaid sandbox integration with token encryption at rest.
- **Fee Detection Rules**: Processor rate benchmarking, zombie subscription detection, unwaived bank fees, and undisputed chargebacks.
- **Asynchronous Processing**: RabbitMQ orchestration connecting the Java and Python services.
- **Frontend Dashboard**: Premium, responsive React UI visualizing savings and managing connections.
- **Security**: Rate limiting (Bucket4j, Slowapi), structured audit logging, secrets scanning (TruffleHog), and strict Next.js security headers.
- **Observability**: Prometheus metrics scraping, Sentry error tracking, and a Grafana dashboard visualizing structured JSON logs.
- **CI/CD**: GitHub Actions pipeline for CI testing, Trivy vulnerability scanning, and environment-gated CD (Staging & Production) deployments via GHCR.
