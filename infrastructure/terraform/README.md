# AWS infrastructure

Terraform in `envs/dev` provisions the Fitness Tracker production path while reusing the existing encrypted S3 backend. It creates the network, private application and database EC2 instances, persistent MongoDB storage, ECR repositories, Secrets Manager values, ALB, HTTPS certificate, Route 53 record, Systems Manager access, and the GitHub OIDC deployment role.

## First deployment

1. Copy `envs/dev/terraform.tfvars.example` to `envs/dev/terraform.tfvars` and set the real GitHub owner/repository.
2. Authenticate to AWS with an administrator-approved local profile.
3. Run from `envs/dev`:

   ```powershell
   terraform init
   terraform fmt -check -recursive
   terraform validate
   terraform plan -out=dev.tfplan
   terraform apply dev.tfplan
   ```

4. Copy the Terraform outputs into GitHub repository variables:

   | GitHub variable | Terraform output |
   | --- | --- |
   | `AWS_REGION` | `aws_region` |
   | `AWS_ROLE_ARN` | `github_actions_role_arn` |
   | `ECR_FRONTEND_REPOSITORY` | `ecr_frontend_repository` |
   | `ECR_BACKEND_REPOSITORY` | `ecr_backend_repository` |
   | `APPLICATION_INSTANCE_ID` | `application_instance_id` |
   | `APPLICATION_URL` | `application_url` |

5. Push to `main`. GitHub Actions builds both images with the same immutable commit tag, pushes them to ECR, runs the deployment script through Systems Manager, and verifies `/health` through HTTPS.

The deployed release is visible in three places: the GitHub production environment and workflow summary, the public read-only `/version` endpoint, and the `/fitness-tracker/dev/current-release` Systems Manager parameter.

MongoDB is not rebuilt by the release pipeline. It runs on the private database instance with a separate encrypted data volume. Its password and the JWT key pair stay in AWS Secrets Manager.

## Important safeguards

- Do not commit `terraform.tfvars`, plans, state files, credentials, or private keys.
- Review every saved plan before applying it.
- Do not recreate or delete the S3 state bucket.
- Do not run `terraform destroy` unless the team explicitly intends to remove the complete environment.
- For rollback, manually run the workflow with a previously published short commit SHA.
