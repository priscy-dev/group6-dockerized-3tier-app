# GitHub Actions workflows

- **CI** validates frontend, backend container, and Terraform changes on pull requests and feature branches.
- **Release** runs after an accepted pull request is merged to `main`. It calls the reusable build and deploy workflows.
- **Build + push images (reusable)** publishes immutable frontend and backend images to ECR using the merge commit SHA.
- **Deploy to production (reusable)** deploys a selected image tag through AWS Systems Manager and verifies `/health` and `/version`.
- **Roll back production** is manually triggered from the Actions tab with an existing ECR image tag.

Production deployment uses GitHub OIDC and repository variables; it does not require stored AWS access keys.
