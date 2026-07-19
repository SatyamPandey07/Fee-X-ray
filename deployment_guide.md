# Fee X-ray — Production Deployment Guide

This guide outlines how to move the **Fee X-ray** SaaS platform from local development to production.

---

## 1. Third-Party Credentials Configuration (Plaid, Stripe, Sentry)

Since no live credentials are configured initially, follow these steps to retrieve and configure them:

### A. Plaid (Production Mode)
1. Register your business at [Plaid Developer Portal](https://dashboard.plaid.com/).
2. Submit your application for **Production Access** (requires business details and security questionnaires).
3. Once approved, retrieve your `PLAID_CLIENT_ID` and `PLAID_SECRET`.
4. Create a URL-safe 32-byte Base64 key for local token encryption:
   ```bash
   openssl rand -base64 32
   ```
   Set this value as `PLAID_TOKEN_ENCRYPTION_KEY` in the Analysis Engine's environment.

### B. Stripe (Production Payments)
1. Create and activate a merchant account at [Stripe Dashboard](https://dashboard.stripe.com/).
2. In the Developers section, retrieve your **Live Secret Key** (`STRIPE_SECRET_KEY`) and **Publishable Key**.
3. Create your plans/prices under the Products tab and map the resulting Price IDs:
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_GROWTH`
   - `STRIPE_PRICE_ENTERPRISE`
4. Set up a **Webhook Endpoint** pointing to `https://core-api.yourdomain.com/api/v1/webhooks/stripe` listening for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Retrieve the signing secret and set it as `STRIPE_WEBHOOK_SECRET`.

### C. Sentry (Error Tracking)
1. Create a Sentry account at [sentry.io](https://sentry.io/).
2. Set up three separate projects:
   - `fee-xray-core-service` (Java/Spring)
   - `fee-xray-analysis-engine` (Python/FastAPI)
   - `fee-xray-frontend` (Next.js)
3. Inject the respective DSNs into the application environments (`SENTRY_DSN`).

---

## 2. Keycloak Cloud Setup

Instead of running self-hosted Keycloak in a Docker container, you can use a managed service like **Keycloak Cloud** (e.g., Cloud-IAM, Phoslight, or managed Red Hat SSO):

1. **Create a Realm**: Name it `fee-xray`.
2. **Configure OpenID Clients**:
   - Create client `fee-xray-web` for the frontend (Public client, Standard Flow, Redirect URIs set to your web domain).
   - Create client `fee-xray-core` for the Spring Boot backend (Confidential client with client credentials flow).
3. **Environment Updates**:
   - Update `KEYCLOAK_ISSUER` to your Keycloak Cloud endpoint (e.g., `https://<tenant>.cloud-iam.com/auth/realms/fee-xray`).
   - Update JWKS URI in the Spring Boot and FastAPI backends to fetch signatures from the cloud domain.

---

## 3. Recommended Deployment Target (Railway + Vercel)

For a polyglot system (Java, Python, Postgres, Redis, RabbitMQ), **Railway** is the most feasible platform for backend services, and **Vercel** is optimal for the Next.js frontend.

### A. Deploying Infrastructure & Backends on Railway

Railway supports deploying multi-container systems directly via Dockerfiles or custom builds.

1. **Deploy PostgreSQL**: Create two isolated Postgres databases (Core and Analysis).
2. **Deploy Redis & RabbitMQ**: Spin up managed Redis and RabbitMQ services in your project.
3. **Deploy Core Service (Java)**:
   - Point Railway to the `/core-service` directory.
   - Railway will build the multi-stage `Dockerfile`.
   - Set environment variables for DB, RabbitMQ, and Keycloak Cloud.
4. **Deploy Analysis Engine & Celery Worker**:
   - **FastAPI App**: Deploy pointing to `/analysis-engine` (runs web server).
   - **Celery Worker**: Deploy pointing to `/analysis-engine` but override the command to run:
     ```bash
     celery -A app.tasks.celery_app worker --loglevel=info -Q fee_analysis,plaid_sync
     ```
   - **Celery Beat**: Deploy another instance overriding command to run:
     ```bash
     celery -A app.tasks.celery_app beat --loglevel=info
     ```

### B. Deploying Frontend on Vercel

1. Import the `/frontend` directory of your GitHub repository into Vercel.
2. Vercel automatically detects Next.js and builds the production bundle.
3. Configure Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_CORE_API_URL`: Your deployed Core Service API URL.
   - `NEXT_PUBLIC_ANALYSIS_API_URL`: Your deployed Analysis API URL.
   - `NEXTAUTH_SECRET`: Generate a secure key.
   - `KEYCLOAK_CLIENT_ID` / `KEYCLOAK_ISSUER`.
