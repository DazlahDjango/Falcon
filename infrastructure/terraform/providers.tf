terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "falcon-pms-tfstate-bucket"
    key            = "terraform/state/falcon-pms.tfstate"
    region         = "us-east-1"
    dynamodb_table = "falcon-pms-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Falcon PMS"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
