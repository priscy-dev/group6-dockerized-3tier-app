variable "aws_region" {
  description = "AWS region for this environment."
  type        = string
  default     = "ca-central-1"
}

variable "project_name" {
  description = "Short project name used in AWS resource names."
  type        = string
  default     = "fitness-tracker"
}

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "IPv4 range for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "admin_cidr" {
  description = "Administrator public IPv4 address in CIDR notation, permitted to SSH to the bastion."
  type        = string
}

variable "ssh_public_key" {
  description = "Public half of the SSH key pair. Never commit a private key."
  type        = string
  sensitive   = true
}

variable "application_domain_name" {
  description = "Public DNS name for the application."
  type        = string
}

variable "route53_hosted_zone_id" {
  description = "Route 53 public hosted zone ID for the domain's parent zone."
  type        = string
}

variable "bastion_instance_type" {
  type    = string
  default = "t3.micro"
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
  description = "Size of the separate encrypted MongoDB data disk."
  type        = number
  default     = 30
}

variable "application_image_tag" {
  description = "Immutable ECR image tag for the frontend and backend release."
  type        = string
  default     = "v1"
}
