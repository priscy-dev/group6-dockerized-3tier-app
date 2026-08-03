variable "aws_region" {
  description = "AWS region for the development environment."
  type        = string
  default     = "ca-central-1"
}
variable "project_name" {
  type    = string
  default = "fitness-tracker"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "application_domain_name" {
  description = "Public DNS name for the application."
  type        = string
}

variable "route53_hosted_zone_id" {
  description = "Route 53 public hosted-zone ID that owns the application domain."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository in owner/name form, used to restrict the OIDC deployment role."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must use owner/name format."
  }
}

variable "github_repository_owner_id" {
  description = "Immutable GitHub numeric ID of the repository owner, used to restrict the OIDC deployment role."
  type        = string

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_owner_id))
    error_message = "github_repository_owner_id must contain only digits."
  }
}

variable "github_repository_id" {
  description = "Immutable GitHub numeric repository ID, used to restrict the OIDC deployment role."
  type        = string

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_id))
    error_message = "github_repository_id must contain only digits."
  }
}

variable "application_instance_type" {
  type    = string
  default = "t3.small"
}

variable "database_instance_type" {
  type    = string
  default = "t3.small"
}

variable "database_volume_size_gib" {
  type    = number
  default = 30
}
