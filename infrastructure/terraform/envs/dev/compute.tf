data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_key_pair" "deployment" {
  key_name   = "${local.name_prefix}-access"
  public_key = var.ssh_public_key
}

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "bastion" {
  name               = "${local.name_prefix}-bastion-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}
resource "aws_iam_role" "application" {
  name               = "${local.name_prefix}-application-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}
resource "aws_iam_role" "database" {
  name               = "${local.name_prefix}-database-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_role_policy_attachment" "application_ssm" {
  role       = aws_iam_role.application.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_role_policy_attachment" "database_ssm" {
  role       = aws_iam_role.database.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_role_policy_attachment" "application_ecr" {
  role       = aws_iam_role.application.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "bastion" {
  name = "${local.name_prefix}-bastion-profile"
  role = aws_iam_role.bastion.name
}
resource "aws_iam_instance_profile" "application" {
  name = "${local.name_prefix}-application-profile"
  role = aws_iam_role.application.name
}
resource "aws_iam_instance_profile" "database" {
  name = "${local.name_prefix}-database-profile"
  role = aws_iam_role.database.name
}

locals {
  docker_bootstrap = <<-EOF
    #!/bin/bash
    set -euxo pipefail
    dnf update -y
    dnf install -y docker amazon-ssm-agent
    systemctl enable --now docker amazon-ssm-agent
    usermod -aG docker ec2-user
  EOF

  database_bootstrap = <<-EOF
    #!/bin/bash
    set -euxo pipefail
    dnf update -y
    dnf install -y docker jq amazon-ssm-agent
    systemctl enable --now docker amazon-ssm-agent
    for attempt in $(seq 1 60); do
      DATA_DEVICE=$(lsblk -nrpo NAME,TYPE | awk '$2 == "disk" && $1 != "/dev/nvme0n1" { print $1; exit }')
      [ -n "$DATA_DEVICE" ] && break
      sleep 5
    done
    test -n "$DATA_DEVICE"
    blkid "$DATA_DEVICE" >/dev/null 2>&1 || mkfs -t xfs "$DATA_DEVICE"
    mkdir -p /data/mongodb
    UUID=$(blkid -s UUID -o value "$DATA_DEVICE")
    grep -q "$UUID" /etc/fstab || echo "UUID=$UUID /data/mongodb xfs defaults,nofail 0 2" >> /etc/fstab
    mount -a
    secret=$(aws secretsmanager get-secret-value --region ${var.aws_region} --secret-id ${aws_secretsmanager_secret.mongo.arn} --query SecretString --output text)
    export MONGO_INITDB_ROOT_USERNAME=$(printf '%s' "$secret" | jq -r .username)
    export MONGO_INITDB_ROOT_PASSWORD=$(printf '%s' "$secret" | jq -r .password)
    docker run -d --name fitness-mongo --restart unless-stopped -p 27017:27017 -v /data/mongodb:/data/db -e MONGO_INITDB_ROOT_USERNAME -e MONGO_INITDB_ROOT_PASSWORD mongo:7
  EOF

  application_bootstrap = <<-EOF
    #!/bin/bash
    set -euxo pipefail
    dnf update -y
    dnf install -y docker jq amazon-ssm-agent
    systemctl enable --now docker amazon-ssm-agent
    cat >/usr/local/bin/deploy-fitness-app <<'SCRIPT'
    #!/bin/bash
    set -euxo pipefail
    REGION="${var.aws_region}"
    REGISTRY="${split("/", aws_ecr_repository.frontend.repository_url)[0]}"
    FRONTEND="${aws_ecr_repository.frontend.repository_url}:${var.application_image_tag}"
    BACKEND="${aws_ecr_repository.backend.repository_url}:${var.application_image_tag}"
    MONGO_SECRET="${aws_secretsmanager_secret.mongo.arn}"
    JWT_SECRET="${aws_secretsmanager_secret.jwt.arn}"
    DATABASE_HOST="${aws_instance.database.private_ip}"
    DOMAIN="${var.application_domain_name}"
    mkdir -p /opt/fitness/secrets /opt/fitness/config
    mongo=$(aws secretsmanager get-secret-value --region "$REGION" --secret-id "$MONGO_SECRET" --query SecretString --output text)
    jwt=$(aws secretsmanager get-secret-value --region "$REGION" --secret-id "$JWT_SECRET" --query SecretString --output text)
    printf '%s' "$mongo" | jq -r .username >/opt/fitness/secrets/db_username
    printf '%s' "$mongo" | jq -r .password >/opt/fitness/secrets/db_password
    printf '%s' "$jwt" | jq -r .private_key >/opt/fitness/secrets/jwt_private_key
    printf '%s' "$jwt" | jq -r .public_key >/opt/fitness/secrets/jwt_public_key
    cat >/opt/fitness/config/app_config <<CONFIG
    {"app":{"port":7000,"nodeEnv":"production","logLevel":"info","client_url":"https://$DOMAIN"},"mongo":{"host":"$DATABASE_HOST","port":27017,"authSource":"admin"}}
    CONFIG
    aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
    docker network create fitness || true
    docker rm -f fitness_frontend fitness_backend || true
    docker pull "$BACKEND"
    docker pull "$FRONTEND"
    docker run -d --name fitness_backend --restart unless-stopped --network fitness --network-alias backend -v /opt/fitness/secrets:/run/secrets:ro -v /opt/fitness/config/app_config:/run/configs/app_config:ro -e NODE_ENV=production -e PORT=7000 -e HOST=0.0.0.0 -e CLIENT_URL="https://$DOMAIN" "$BACKEND"
    docker run -d --name fitness_frontend --restart unless-stopped --network fitness -p 80:80 "$FRONTEND"
    SCRIPT
    chmod 700 /usr/local/bin/deploy-fitness-app
    cat >/etc/systemd/system/fitness-deploy.service <<'UNIT'
    [Unit]
    After=docker.service network-online.target
    Wants=network-online.target
    [Service]
    Type=simple
    ExecStart=/usr/local/bin/deploy-fitness-app
    Restart=on-failure
    RestartSec=60
    [Install]
    WantedBy=multi-user.target
    UNIT
    systemctl enable --now fitness-deploy.service
  EOF
}

resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.bastion_instance_type
  subnet_id                   = aws_subnet.public["0"].id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  key_name                    = aws_key_pair.deployment.key_name
  iam_instance_profile        = aws_iam_instance_profile.bastion.name
  associate_public_ip_address = true
  user_data                   = local.docker_bootstrap
  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 30
  }
  tags = { Name = "${local.name_prefix}-bastion" }
}

resource "aws_instance" "application" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.application_instance_type
  subnet_id                   = aws_subnet.application["0"].id
  vpc_security_group_ids      = [aws_security_group.application.id]
  key_name                    = aws_key_pair.deployment.key_name
  iam_instance_profile        = aws_iam_instance_profile.application.name
  associate_public_ip_address = false
  user_data                   = local.application_bootstrap
  user_data_replace_on_change = true
  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 30
  }
  tags = { Name = "${local.name_prefix}-application" }
}

resource "aws_instance" "database" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.database_instance_type
  subnet_id                   = aws_subnet.database["0"].id
  vpc_security_group_ids      = [aws_security_group.database.id]
  key_name                    = aws_key_pair.deployment.key_name
  iam_instance_profile        = aws_iam_instance_profile.database.name
  associate_public_ip_address = false
  user_data                   = local.database_bootstrap
  user_data_replace_on_change = true
  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 30
  }
  ebs_block_device {
    device_name           = "/dev/sdf"
    volume_size           = var.database_volume_size_gib
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = false
  }
  tags = { Name = "${local.name_prefix}-mongodb" }
}

resource "aws_lb_target_group_attachment" "application" {
  target_group_arn = aws_lb_target_group.application.arn
  target_id        = aws_instance.application.id
  port             = 80
}
