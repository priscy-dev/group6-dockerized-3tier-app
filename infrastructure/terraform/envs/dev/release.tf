resource "aws_ssm_parameter" "current_release" {
  name        = "/${var.project_name}/${var.environment}/current-release"
  description = "Metadata for the release currently running in production"
  type        = "String"
  value       = jsonencode({ status = "not-deployed" })

  lifecycle {
    ignore_changes = [value]
  }
}
