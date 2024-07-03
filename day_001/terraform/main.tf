## The Network section
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "MainVpc"
  }
}

// The public subnet
resource "aws_subnet" "public" {
  vpc_id                                      = aws_vpc.main.id
  cidr_block = cidrsubnet(aws_vpc.main.cidr_block, 8, 4)
  availability_zone                           = "${var.aws_region}a"
  map_public_ip_on_launch                     = true
  enable_resource_name_dns_a_record_on_launch = true

  depends_on = [aws_vpc.main]

  tags = {
    Name = "PublicSubnet"
  }
}

// The Internet gateway to routing traffic to/from internet
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  depends_on = [aws_vpc.main]

  tags = {
    Name = "InternetGateway"
  }
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  depends_on = [aws_vpc.main]

  tags = {
    Name = "RouteTable"
  }
}

resource "aws_route_table_association" "rt_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.rt.id
}

## Local section

resource "null_resource" "currIpAddr" {
  provisioner "local-exec" {
    command = "chmod +x ../../utils/ip_address.sh && cat ../../utils/ip_address.sh | bash > ./.terraform/ip.txt"
  }
}

data "local_file" "ipfile" {
  depends_on = [null_resource.currIpAddr]
  filename = "${path.module}/.terraform/ip.txt"
}

## Security section
# Generate the keypair for ssh connection

resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "privatekey" {
  filename = "day1kp.pem"
  content  = tls_private_key.key.private_key_pem
  depends_on = [tls_private_key.key]
}

resource "aws_key_pair" "keypair" {
  key_name   = "day1kp"
  public_key = tls_private_key.key.public_key_openssh
  depends_on = [tls_private_key.key]

  tags = {
    Name = "Instance-KeyPair"
  }
}

resource "aws_security_group" "ssh" {
  name        = "Allow-SSH"
  description = "Allow SSH inbound traffic"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "all"
    cidr_blocks = ["0.0.0.0/0"]
    description = "allow internet access outbound"
  }

  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = ["${trimspace(data.local_file.ipfile.content)}/32"]
  }

  depends_on = [data.local_file.ipfile]

  tags = {
    Name = "Allow-SSH"
  }
}

resource "aws_security_group" "http" {
  name        = "http-sg"
  vpc_id      = aws_vpc.main.id
  description = "Allow HTTP traffic from/to ec2"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "all"
    cidr_blocks = ["0.0.0.0/0"]
    description = "allow internet access outbound"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "allow internet access inbound"
  }

  tags = {
    Name = "Allow-HTTP"
  }
}


## Computer section

resource "aws_instance" "webapp" {
  instance_type = "t2.micro"
  ami           = var.ami_ubuntu-2204-tls
  key_name      = aws_key_pair.keypair.key_name
  vpc_security_group_ids = [aws_security_group.http.id, aws_security_group.ssh.id]
  subnet_id     = aws_subnet.public.id
  user_data = templatefile("bootstrap.sh.tpl", {})

  depends_on = [
    aws_subnet.public,
    aws_key_pair.keypair,
    aws_security_group.http,
    aws_security_group.ssh
  ]

  tags = {
    Name = "WebAppInstance"
  }
}