terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "habitly-terraform-state-prod"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "habitly-terraform-locks-prod"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Environment = "prod"
      Project     = "habitly"
      ManagedBy   = "terraform"
    }
  }
}

# Secrets Manager - Production secrets
module "secrets" {
  source = "../../modules/secrets"

  environment          = "prod"
  jwt_secret           = var.jwt_secret           # From TF_VAR_jwt_secret
  google_client_id     = var.google_client_id     # From TF_VAR_google_client_id
  google_client_secret = var.google_client_secret # From TF_VAR_google_client_secret
  database_url         = var.database_url         # From TF_VAR_database_url
}

# Lambda IAM Role
module "lambda_role" {
  source = "../../modules/lambda-role"

  environment = "prod"
  secret_arns = [
    module.secrets.jwt_secret_arn,
    module.secrets.google_client_id_secret_arn,
    module.secrets.google_client_secret_secret_arn,
    module.secrets.database_url_secret_arn
  ]
}

# API Gateway - Production configuration
module "api" {
  source = "../../modules/api"

  environment                  = "prod"
  enable_free_tier_constraints = false
}

# Certificate module - Production domain
module "certificate" {
  source = "../../modules/certificate"

  domain_name = var.domain_name
  environment = var.environment
}

# Custom Domain - Production
module "custom_domain" {
  source = "../../modules/custom-domain"

  domain_name     = var.domain_name
  environment     = var.environment
  certificate_arn = module.certificate.certificate_arn
  api_id          = module.api.api_id
  stage_name      = module.api.stage_name
}
