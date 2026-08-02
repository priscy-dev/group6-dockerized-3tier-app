resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb-sg"
  description = "Allows public web traffic only to the application load balancer."
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "HTTP temporarily supports initial deployment before a certificate is attached"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS customer traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    description     = "Only to the private application servers"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.application.id]
  }
  tags = { Name = "${local.name_prefix}-alb-sg" }
}

resource "aws_security_group" "application" {
  name        = "${local.name_prefix}-app-sg"
  description = "Allows the ALB and bastion to reach private application EC2 instances."
  vpc_id      = aws_vpc.this.id

  egress {
    description = "Required outbound connections through NAT Gateway"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${local.name_prefix}-app-sg" }
}

resource "aws_vpc_security_group_ingress_rule" "application_from_alb" {
  security_group_id            = aws_security_group.application.id
  referenced_security_group_id = aws_security_group.alb.id
  description                  = "Frontend Nginx from ALB only"
  from_port                    = 80
  to_port                      = 80
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "application_ssh_from_bastion" {
  security_group_id            = aws_security_group.application.id
  referenced_security_group_id = aws_security_group.bastion.id
  description                  = "SSH from bastion only"
  from_port                    = 22
  to_port                      = 22
  ip_protocol                  = "tcp"
}

resource "aws_security_group" "bastion" {
  name        = "${local.name_prefix}-bastion-sg"
  description = "Restricts bastion SSH to the administrator public IP."
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "Administrator SSH only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }
  egress {
    description = "Allow required outbound connections"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${local.name_prefix}-bastion-sg" }
}

resource "aws_security_group" "database" {
  name        = "${local.name_prefix}-database-sg"
  description = "Allows MongoDB only from the private application security group."
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "MongoDB from application instances only"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.application.id]
  }
  ingress {
    description     = "SSH from bastion only"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }
  egress {
    description = "Required outbound connections through NAT Gateway"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${local.name_prefix}-database-sg" }
}
