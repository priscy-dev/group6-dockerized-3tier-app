# Continue the interrupted deployment

The network, load balancer, DNS, ECR repositories, and IAM resources are already recorded in remote Terraform state. The current plan deliberately adds only the missing compute and secrets resources.

The old `fitness-tracker/dev/mongo` and `fitness-tracker/dev/jwt` secrets are still in AWS's recovery window from the previous destroy. Before applying, restore and import them:

```bash
aws secretsmanager restore-secret --region ca-central-1 --secret-id fitness-tracker/dev/mongo
aws secretsmanager restore-secret --region ca-central-1 --secret-id fitness-tracker/dev/jwt

terraform import aws_secretsmanager_secret.mongo fitness-tracker/dev/mongo
terraform import aws_secretsmanager_secret.jwt fitness-tracker/dev/jwt

terraform plan -out=dev.tfplan
```

The resulting plan should show the three EC2 instances, the two secret versions, their IAM access policies, and the ALB target attachment. Only then run `terraform apply dev.tfplan`.
