output "application_url" { value = "https://${var.application_domain_name}" }
output "application_instance_id" { value = aws_instance.application.id }
output "github_actions_role_arn" { value = aws_iam_role.github_deploy.arn }
output "aws_region" { value = var.aws_region }
output "ecr_frontend_repository" { value = aws_ecr_repository.frontend.name }
output "ecr_backend_repository" { value = aws_ecr_repository.backend.name }
output "ecr_repository_urls" {
  value = {
    frontend = aws_ecr_repository.frontend.repository_url
    backend  = aws_ecr_repository.backend.repository_url
  }
}
output "database_instance_id" { value = aws_instance.database.id }
output "current_release_parameter" { value = aws_ssm_parameter.current_release.name }
output "state_bucket" { value = "fitness-tracker-622004253908-ca-central-1-tfstate" }
