resource "random_password" "mongo" {
  length  = 32
  special = true
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
  secret_id = aws_secretsmanager_secret.mongo.id
  secret_string = jsonencode({
    username = "fitness_app"
    password = random_password.mongo.result
  })
}

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}/${var.environment}/jwt"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    private_key = tls_private_key.jwt.private_key_pem
    public_key  = tls_private_key.jwt.public_key_pem
  })
}
