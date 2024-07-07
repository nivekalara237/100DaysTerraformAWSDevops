variable "aws_region" {
  type        = string
  description = "The region in which the VPC should be created."
  default     = "us-east-1"
}

variable "access_key" {
  type = string
}

variable "secret_key" {
  type = string
}

variable "host_ip" {
  type = string
}

variable "ami_ubuntu-2204-tls" {
  type    = string
  default = "ami-04b70fa74e45c3917"
}