# Group 6 Dockerized 3-Tier Application

This repository contains the Dockerized 3-Tier application with automated CI/CD capabilities using GitHub Actions.

## CI/CD Pipeline

The CI/CD workflow is located at [.github/workflows/ci-cd.yml](file:///.github/workflows/ci-cd.yml).

### Workflow Stages:
1. **Validate**: Automatically runs on Pull Requests and Pushes to `main` or `ci-cd`. Installs dependencies with `npm ci`, runs `oxlint`, and verifies the build with `vite build`.
2. **Build & Push**: Builds the Docker container using `frontend/Dockerfile` and pushes tagged images (`<git-short-sha>` and `latest`) to Docker Hub.
3. **Deploy & Rollback**: Transfers `docker-compose.prod.yml` to the production server over SSH, deploys the updated container, and runs automated health check smoke tests. Supports manual rollback via `workflow_dispatch`.

### Required GitHub Secrets:
Set the following secrets in GitHub Repository Settings (**Settings > Secrets and variables > Actions**):

| Secret Name | Description | Example / Note |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Your Docker Hub account username | `priscydev` |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token | `dckr_pat_...` |
| `VM_HOST` | Target deployment VM IP Address | `20.12.34.56` |
| `VM_USER` | SSH Username on the VM | `azureuser` or `ubuntu` |
| `VM_SSH_KEY` | Private SSH Key (PEM format) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VM_SSH_PORT` | *(Optional)* Custom SSH Port | `22` (default) |
