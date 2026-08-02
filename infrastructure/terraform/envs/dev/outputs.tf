output "application_url" { value = "https://${var.application_domain_name}" }
output "application_certificate_arn" { value = aws_acm_certificate.application.arn }
output "vpc_id" { value = aws_vpc.this.id }
output "public_subnet_ids" { value = values(aws_subnet.public)[*].id }
output "application_subnet_ids" { value = values(aws_subnet.application)[*].id }
output "database_subnet_ids" { value = values(aws_subnet.database)[*].id }
output "ecr_repositories" { value = { frontend = aws_ecr_repository.frontend.repository_url, backend = aws_ecr_repository.backend.repository_url } }
output "security_group_ids" { value = { alb = aws_security_group.alb.id, application = aws_security_group.application.id, bastion = aws_security_group.bastion.id, database = aws_security_group.database.id } }
output "instance_connection_details" { value = { bastion_public_ip = aws_instance.bastion.public_ip, application_private_ip = aws_instance.application.private_ip, database_private_ip = aws_instance.database.private_ip } }
