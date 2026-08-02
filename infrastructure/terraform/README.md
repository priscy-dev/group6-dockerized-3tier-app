# Fitness Tracker infrastructure

This repository contains the AWS infrastructure for the Fitness Tracker development environment.

Run normal Terraform commands from `envs/dev`. The remote S3 state is already configured; do not commit state files, plans, private keys, or `terraform.tfvars`.

## Normal workflow

```bash
cd "/mnt/c/Users/admin/Projects/Working Projects/Terraform/envs/dev"
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=dev.tfplan
terraform apply dev.tfplan
```

`plan` is read-only. `apply` changes AWS and should only be run after reviewing the plan. Never use `terraform destroy` unless you deliberately intend to remove the whole environment.

## Configuration and secrets

Copy `envs/dev/terraform.tfvars.example` to `envs/dev/terraform.tfvars` and set the administrator's current public IP and SSH public key. The private `terraform.tfvars` is ignored by Git.

Terraform creates the MongoDB password and JWT keys, then stores them in AWS Secrets Manager. The encrypted remote state also contains sensitive generated values, so restrict access to the state S3 bucket.

## Application releases

Build and push frontend/backend images to the existing ECR repositories with a new immutable tag, for example `v2`. Then change `application_image_tag = "v2"` in the private `terraform.tfvars`, make a new plan, and apply it.
