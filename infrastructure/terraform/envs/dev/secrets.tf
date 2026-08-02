resource "random_password" "mongo" {
  length  = 32
  special = false
}
resource "tls_private_key" "jwt" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_secretsmanager_secret" "mongo" {
  name                    = "${var.project_name}/${var.environment}/mongo"
  recovery_window_in_days = 7
}
resource "aws_secretsmanager_secret_version" "mongo" {
  secret_id     = aws_secretsmanager_secret.mongo.id
  secret_string = jsonencode({ username = "fitness_app", password = random_password.mongo.result })
}
resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}/${var.environment}/jwt"
  recovery_window_in_days = 7
}
resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({ private_key = tls_private_key.jwt.private_key_pem, public_key = tls_private_key.jwt.public_key_pem })
}

data "aws_iam_policy_document" "application_secrets" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.mongo.arn, aws_secretsmanager_secret.jwt.arn]
  }
}
resource "aws_iam_role_policy" "application_secrets" {
  name   = "${local.name_prefix}-application-secrets"
  role   = aws_iam_role.application.id
  policy = data.aws_iam_policy_document.application_secrets.json
}
data "aws_iam_policy_document" "database_secrets" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.mongo.arn]
  }
}
resource "aws_iam_role_policy" "database_secrets" {
  name   = "${local.name_prefix}-database-secrets"
  role   = aws_iam_role.database.id
  policy = data.aws_iam_policy_document.database_secrets.json
}
