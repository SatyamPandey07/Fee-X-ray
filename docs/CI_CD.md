# Fee X-ray CI/CD Strategy

This document outlines the Continuous Integration (CI) and Continuous Deployment (CD) pipelines, as well as the promotion flow and rollback strategies for the Fee X-ray multi-service architecture.

## 1. Pipelines Overview

### Continuous Integration (`ci.yml`)
The CI pipeline is triggered on any Pull Request against the `develop` or `main` branches. It focuses on isolating tests to only the services that have changed to minimize CI time.
- **Path Filtering**: Utilizes `dorny/paths-filter` to detect changes in `core-service/`, `analysis-engine/`, or `frontend/`.
- **Testing**:
  - `core-service`: Runs `gradle test` using Java 20.
  - `analysis-engine`: Runs `pytest` using Python 3.11.
  - `frontend`: Runs `npm run lint` and `npm run build` using Node.js 20.
- **Security Scanning**: If any tests pass, it builds Docker images for all three services and scans them for HIGH and CRITICAL vulnerabilities using `aquasecurity/trivy-action`.

### Continuous Deployment (`cd.yml`)
The CD pipeline triggers upon merges (pushes) to the `develop` and `main` branches.
- **Build & Publish**: Builds the Docker images for all three services and pushes them to GitHub Container Registry (`ghcr.io`). The images are tagged with the Git SHA (`sha-<hash>`) and the branch name.
- **Staging Deployment**: Triggered when code is merged into `develop`. Targets the `staging` GitHub Environment, automatically deploying the updated images.
- **Production Deployment**: Triggered when code is merged into `main`. Targets the `production` GitHub Environment. **This step requires manual approval in the GitHub UI before the deployment script executes.**

## 2. Environment Promotion Flow

Our strategy ensures a strict, linear flow of code from development to production:

1. **Development**: Engineers create feature branches (e.g., `feat/login`) branching off from `develop`.
2. **Pull Request (CI)**: When a PR is opened against `develop`, the CI pipeline runs unit tests and Trivy security scans. Code reviews happen here.
3. **Staging (CD)**: Upon merging the PR into `develop`, the CD pipeline builds the Docker images, pushes them to GHCR, and automatically deploys them to the **Staging** environment. QA and integration testing occur in Staging.
4. **Production Release**: When Staging is validated, a PR is opened from `develop` into `main`. Once merged into `main`, the CD pipeline builds the final images and prepares the **Production** deployment.
5. **Approval Gate**: The production deployment job pauses. An authorized team member must navigate to the GitHub Actions UI and explicitly approve the deployment to Production.

## 3. Rollback Strategy for Multi-Service Architecture

In a multi-service environment, a failure in one service (e.g., `core-service`) might be tightly coupled to changes in another (e.g., `frontend`). For this reason, our primary rollback strategy focuses on reverting deployments at the **artifact level** rather than the code level for speed, followed by a code-level fix.

### Strategy A: Image Tag Reversion (Fastest, Preferred for Outages)
If a critical bug is discovered in production, the fastest way to restore service is to redeploy the previous known-good Docker image tags.
1. Identify the previous stable Git SHA (e.g., `sha-abc1234`).
2. Manually trigger a deployment script or update the infrastructure-as-code manifests (like Helm charts or Kubernetes Deployments) to point to `ghcr.io/feexray/core-service:sha-abc1234` (and the corresponding tags for the other services).
3. Apply the changes to the production cluster. This takes seconds, bypassing the need to rebuild images.

### Strategy B: Git Revert (Permanent Fix)
Once service is restored via Strategy A, the underlying code must be fixed to ensure the `main` branch reflects the actual production state.
1. Use `git revert <merge-commit-sha>` to revert the faulty PR on the `main` (and `develop`) branch.
2. Open a new PR with the reverted code.
3. Allow the CI/CD pipeline to build new images and push them through the standard promotion flow.
4. (Optional) Fix the bug on a new feature branch and push it through the pipeline again.
