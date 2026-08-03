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

locals {
  database_bootstrap = <<-USERDATA
    #!/bin/bash
    set -euxo pipefail
    dnf install -y docker jq
    systemctl enable --now docker amazon-ssm-agent
    for attempt in $(seq 1 60); do
      DATA_DEVICE=$(lsblk -nrpo NAME,TYPE | awk '$2 == "disk" && $1 != "/dev/nvme0n1" {print $1; exit}')
      [ -n "$DATA_DEVICE" ] && break
      sleep 5
    done
    test -n "$DATA_DEVICE"
    blkid "$DATA_DEVICE" >/dev/null 2>&1 || mkfs -t xfs "$DATA_DEVICE"
    mkdir -p /data/mongodb
    UUID=$(blkid -s UUID -o value "$DATA_DEVICE")
    grep -q "$UUID" /etc/fstab || echo "UUID=$UUID /data/mongodb xfs defaults,nofail 0 2" >> /etc/fstab
    mount -a
    SECRET=$(aws secretsmanager get-secret-value --region ${var.aws_region} --secret-id ${aws_secretsmanager_secret.mongo.arn} --query SecretString --output text)
    MONGO_USER=$(printf '%s' "$SECRET" | jq -r .username)
    MONGO_PASSWORD=$(printf '%s' "$SECRET" | jq -r .password)
    docker run -d --name fitness_mongo --restart unless-stopped -p 27017:27017 \
      -v /data/mongodb:/data/db \
      -e MONGO_INITDB_ROOT_USERNAME="$MONGO_USER" \
      -e MONGO_INITDB_ROOT_PASSWORD="$MONGO_PASSWORD" mongo:7
  USERDATA

  application_bootstrap = <<-USERDATA
    #!/bin/bash
    set -euxo pipefail
    dnf install -y docker jq
    systemctl enable --now docker amazon-ssm-agent
    cat >/usr/local/bin/deploy-fitness-app <<'SCRIPT'
    #!/bin/bash
    set -euo pipefail
    RELEASE_TAG="$${1:?Usage: deploy-fitness-app IMAGE_TAG}"
    REGION="${var.aws_region}"
    REGISTRY="${split("/", aws_ecr_repository.frontend.repository_url)[0]}"
    FRONTEND_IMAGE="${aws_ecr_repository.frontend.repository_url}:$${RELEASE_TAG}"
    BACKEND_IMAGE="${aws_ecr_repository.backend.repository_url}:$${RELEASE_TAG}"
    DOMAIN="${var.application_domain_name}"
    DATABASE_HOST="${aws_instance.database.private_ip}"
    DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    install -d -m 700 /opt/fitness/secrets /opt/fitness/config
    MONGO=$(aws secretsmanager get-secret-value --region "$REGION" --secret-id ${aws_secretsmanager_secret.mongo.arn} --query SecretString --output text)
    JWT=$(aws secretsmanager get-secret-value --region "$REGION" --secret-id ${aws_secretsmanager_secret.jwt.arn} --query SecretString --output text)
    printf '%s' "$MONGO" | jq -r .username >/opt/fitness/secrets/db_username
    printf '%s' "$MONGO" | jq -r .password >/opt/fitness/secrets/db_password
    printf '%s' "$JWT" | jq -r .private_key >/opt/fitness/secrets/jwt_private_key
    printf '%s' "$JWT" | jq -r .public_key >/opt/fitness/secrets/jwt_public_key
    chmod 600 /opt/fitness/secrets/*
    printf '%s' '{"app":{"port":7000,"nodeEnv":"production","logLevel":"info","client_url":"https://'$DOMAIN'"},"mongo":{"host":"'$DATABASE_HOST'","port":27017,"authSource":"admin"}}' >/opt/fitness/config/app_config

    aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
    docker pull "$BACKEND_IMAGE"
    docker pull "$FRONTEND_IMAGE"
    docker network inspect fitness >/dev/null 2>&1 || docker network create fitness
    docker rm -f fitness_frontend fitness_backend >/dev/null 2>&1 || true
    docker run -d --name fitness_backend --restart unless-stopped --network fitness --network-alias backend \
      -v /opt/fitness/secrets:/run/secrets:ro \
      -v /opt/fitness/config/app_config:/run/configs/app_config:ro \
      -e NODE_ENV=production -e PORT=7000 -e HOST=0.0.0.0 -e CLIENT_URL="https://$DOMAIN" \
      -e RELEASE_VERSION="$RELEASE_TAG" -e FRONTEND_IMAGE="$FRONTEND_IMAGE" \
      -e BACKEND_IMAGE="$BACKEND_IMAGE" -e DEPLOYED_AT="$DEPLOYED_AT" "$BACKEND_IMAGE"
    docker run -d --name fitness_frontend --restart unless-stopped --network fitness -p 80:80 "$FRONTEND_IMAGE"
    sleep 5
    curl --fail --silent --show-error http://127.0.0.1/health
    printf '%s\n' "$RELEASE_TAG" >/opt/fitness/CURRENT_VERSION
    RELEASE_JSON=$(jq -cn \
      --arg version "$RELEASE_TAG" \
      --arg frontendImage "$FRONTEND_IMAGE" \
      --arg backendImage "$BACKEND_IMAGE" \
      --arg deployedAt "$DEPLOYED_AT" \
      '{version:$version,frontendImage:$frontendImage,backendImage:$backendImage,deployedAt:$deployedAt}')
    aws ssm put-parameter --region "$REGION" \
      --name "/${var.project_name}/${var.environment}/current-release" \
      --type String --value "$RELEASE_JSON" --overwrite
    docker image prune -f
    SCRIPT
    chmod 700 /usr/local/bin/deploy-fitness-app
  USERDATA
}

resource "aws_instance" "database" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.database_instance_type
  subnet_id                   = aws_subnet.database["0"].id
  vpc_security_group_ids      = [aws_security_group.database.id]
  iam_instance_profile        = aws_iam_instance_profile.database.name
  associate_public_ip_address = false
  user_data                   = local.database_bootstrap
  user_data_replace_on_change = true

  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 20
  }
  ebs_block_device {
    device_name           = "/dev/sdf"
    encrypted             = true
    volume_type           = "gp3"
    volume_size           = var.database_volume_size_gib
    delete_on_termination = false
  }
  tags = { Name = "${local.name_prefix}-database" }
}

resource "aws_instance" "application" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.application_instance_type
  subnet_id                   = aws_subnet.application["0"].id
  vpc_security_group_ids      = [aws_security_group.application.id]
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
