resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${local.name_prefix}-vpc" }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${local.name_prefix}-igw" }
}

resource "aws_subnet" "public" {
  for_each                = toset(["0", "1"])
  vpc_id                  = aws_vpc.this.id
  availability_zone       = local.availability_zones[tonumber(each.key)]
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, tonumber(each.key))
  map_public_ip_on_launch = true
  tags = {
    Name = "${local.name_prefix}-public-${tonumber(each.key) + 1}"
    Tier = "public"
  }
}

resource "aws_subnet" "application" {
  for_each          = toset(["0", "1"])
  vpc_id            = aws_vpc.this.id
  availability_zone = local.availability_zones[tonumber(each.key)]
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 10 + tonumber(each.key))
  tags = {
    Name = "${local.name_prefix}-app-${tonumber(each.key) + 1}"
    Tier = "application"
  }
}

resource "aws_subnet" "database" {
  for_each          = toset(["0", "1"])
  vpc_id            = aws_vpc.this.id
  availability_zone = local.availability_zones[tonumber(each.key)]
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 20 + tonumber(each.key))
  tags = {
    Name = "${local.name_prefix}-database-${tonumber(each.key) + 1}"
    Tier = "database"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
  tags = { Name = "${local.name_prefix}-public-rt" }
}

resource "aws_route_table_association" "public" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat" {
  for_each = { shared = aws_subnet.public["0"].id }
  domain   = "vpc"
  tags     = { Name = "${local.name_prefix}-nat-${each.key}" }
}

resource "aws_nat_gateway" "this" {
  for_each      = aws_eip.nat
  allocation_id = each.value.id
  subnet_id     = aws_subnet.public["0"].id
  depends_on    = [aws_internet_gateway.this]
  tags          = { Name = "${local.name_prefix}-nat-${each.key}" }
}

resource "aws_route_table" "private" {
  for_each = aws_nat_gateway.this
  vpc_id   = aws_vpc.this.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = each.value.id
  }
  tags = { Name = "${local.name_prefix}-private-rt-${each.key}" }
}

resource "aws_route_table_association" "application" {
  for_each       = aws_subnet.application
  subnet_id      = each.value.id
  route_table_id = aws_route_table.private["shared"].id
}

resource "aws_route_table_association" "database" {
  for_each       = aws_subnet.database
  subnet_id      = each.value.id
  route_table_id = aws_route_table.private["shared"].id
}
