terraform {
  required_version = "~> 1.9.0"
  required_providers {
    aws = {
      version = "~> 5.57.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "tf-user"
  default_tags {
    tags = {
      "Environment" : "DEV"
      "Project" : "100DaysIaCChalenge"
      "IaCTools" : "terraform"
      "Owner" : "kevinlactiokemta@gmail.com"
      "Days" : "003"
    }
  }
}