terraform {
  required_version = "~> 1.9.0"

  required_providers {
    aws = {
      version = "~> 5.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  // access_key = var.access_key
  // secret_key = var.secret_key
  region  = var.aws_region
  profile = "tf-user"
  default_tags {
    tags = {
      "Environment" : "DEV"
      "Project" : "100DaysIaCChalenge"
      "IaCTools" : "terraform"
      "Owner" : "kevinlactiokemta@gmail.com"
      "Days" : "001"
    }
  }
}

provider "local" {}
provider "tls" {}