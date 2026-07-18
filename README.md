# Fee X-ray

A production-grade, multi-service SaaS fintech platform that connects to small business bank and payment processor accounts, automatically detects fees being lost, explains them in plain English, and tracks savings over time.

---

## Overall Architecture

Fee X-ray is built as a polyglot, multi-service architecture utilizing:
1. **Core Service (Java / Spring Boot 3)**: Manages users, organizations, authentication, billing, and entitlements.
2. **Analysis Engine (Python / FastAPI)**: Syncs transaction data via Plaid, runs fee detection rules, and computes analytical insights.
3. **Frontend (Next.js 14 / TypeScript / Tailwind CSS)**: Provides a premium web dashboard for organizations to monitor and resolve fees.

```
                  ┌─────────────────────────────────┐
                  │            Browser              │
                  │            Next.js 14           │
                  └───────────────┬─────────────────┘
                                  │
                  ┌───────────────┴─────────────────┐
                  │          Keycloak Cloud         │
                  │         (OIDC / Identity)       │
                  └───────────────┬─────────────────┘
                                  │
       ┌──────────────────────────┴──────────────────────────┐
       │                                                     │
       ▼                                                     ▼
┌───────────────────────────────┐                     ┌───────────────────────────────┐
│        Core Service           │                     │        Analysis Engine        │
│    (Spring Boot 3 + Java 21)  │                     │       (FastAPI + Python)      │
└──────────────┬────────────────┘                     └──────────────┬────────────────┘
               │                                                     │
               ▼ (Flyway / JPA)                                      ▼ (SQLAlchemy / Async)
┌───────────────────────────────┐                     ┌───────────────────────────────┐
│       postgres-core           │                     │       postgres-analysis       │
│       (PostgreSQL DB)         │                     │        (PostgreSQL DB)        │
└───────────────────────────────┘                     └───────────────────────────────┘
```

---

## Why Two Backend Languages?

We intentionally divide the backend into two specialized services:

- **Java (Spring Boot) for the Core Service**:
  - Owning the core domain (users, orgs, billing, and plans) requires absolute, provable correctness and reliability.
  - Spring Security provides production-grade, battle-tested implementations of role-based access control and OpenID Connect (OIDC).
  - Strong typing and a robust compiler catch entire classes of errors before code reaches production.

- **Python (FastAPI) for the Analysis Engine**:
  - Banking integration and data analysis require rapid iterations and support for complex calculations.
  - Python's data ecosystem (Pandas, NumPy) is perfectly suited for high-volume transaction parsing and running mathematical rules.
  - FastAPI offers an asynchronous, modern, and high-performance framework for building fast I/O analytics endpoints.

---

## Roadmap & Upcoming Phases

- **Phase 1: Monorepo Scaffolding & Orchestration** (Current Phase)
  - Scaffolding minimal Java/Spring, Python/FastAPI, and Next.js projects.
  - Setting up Docker Compose for local orchestration.
- **Phase 2: Core Domain Model & Databases**
  - Database schema configuration with Flyway (Core) and Alembic (Analysis).
  - Provisioning of standard entities (Organization, User, Entitlement) and repositories.
- **Phase 3: Bank Connection & Analysis Engine**
  - Plaid sandbox integration and transaction sync.
  - Plaid token encryption and storage.
  - 8-rule custom fee detection logic.
- **Phase 4: Stripe Billing & Webhook Processing**
  - Stripe webhook signature verification and idempotency processing.
  - Multi-tier entitlement gates.
- **Phase 5: Premium Dashboard UI**
  - Building the Next.js frontend with full support for user roles, connected accounts, and savings visualization.
- **Phase 6: Observability, Metrics & Sentry**
  - Setting up Prometheus metrics collection, Grafana dashboards, and Sentry tracking.
