# API Gateway Information
output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api.api_endpoint
}

output "api_id" {
  description = "API Gateway ID"
  value       = module.api.api_id
}

# Infrastructure for Backend Deployment
output "infrastructure_outputs" {
  description = "Infrastructure configuration for backend deployment"
  value = {
    api_id                   = module.api.api_id
    api_execution_arn        = module.api.api_execution_arn
    lambda_role_arn          = module.lambda_role.lambda_role_arn
    jwt_secret_arn           = module.secrets.jwt_secret_arn
    google_client_id_arm     = module.secrets.google_client_id_secret_arn
    google_client_secret_arn = module.secrets.google_client_secret_secret_arn
    database_url_secret_arn  = module.secrets.database_url_secret_arn
    region                   = var.region
  }
  sensitive = true
}

# Secrets Information
output "secrets_created" {
  description = "List of secrets created in AWS Secrets Manager"
  value = [
    module.secrets.jwt_secret_arn,
    module.secrets.google_client_id_secret_arn,
    module.secrets.google_client_secret_secret_arn,
    module.secrets.database_url_secret_arn
  ]
}

output "lambda_role_arn" {
  description = "Lambda execution role ARN"
  value       = module.lambda_role.lambda_role_arn
}

# Custom Domain Information
output "certificate_validation_records" {
  description = "DNS records needed for certificate validation"
  value       = module.certificate.domain_validation_options
}

output "api_custom_domain" {
  description = "Custom domain for the API"
  value       = module.custom_domain.domain_name
}

output "target_domain_name" {
  description = "Target domain name for CNAME record"
  value       = module.custom_domain.target_domain_name
}

resource "aws_ssm_parameter" "api_custom_domain" {
  name  = "/habitly/${var.environment}/api-custom-domain"
  type  = "String"
  value = module.custom_domain.domain_name

  tags = {
    Environment = var.environment
    Purpose     = "serverless-integration"
  }
}

resource "aws_ssm_parameter" "api_gateway_id" {
  name  = "/habitly/${var.environment}/api-gateway-id"
  type  = "String"
  value = module.api.api_id

  tags = {
    Environment = var.environment
    Purpose     = "serverless-integration"
  }
}

resource "aws_ssm_parameter" "lambda_role_arn" {
  name  = "/habitly/${var.environment}/lambda-role-arn"
  type  = "String"
  value = module.lambda_role.lambda_role_arn

  tags = {
    Environment = var.environment
    Purpose     = "serverless-integration"
  }
}

resource "aws_ssm_parameter" "jwt_secret_arn" {
  name  = "/habitly/${var.environment}/jwt-secret-arn"
  type  = "String"
  value = module.secrets.jwt_secret_arn

  tags = {
    Environment = var.environment
    Purpose     = "serverless-integration"
  }
}
resource "aws_ssm_parameter" "google_client_id_secret_arn" {
  name  = "/habitly/${var.environment}/google-client-id-secret-arn"
  type  = "String"
  value = module.secrets.google_client_id_secret_arn

  tags = {
    Environment = var.environment
    Purpose     = "serverless-integration"
  }
}

resource "aws_ssm_parameter" "google_client_secret_secret_arn" {
  name  = "/habitly/${var.environment}/google-client-secret-secret-arn"
  type  = "String"
  value = module.secrets.google_client_secret_secret_arn

  tags = {
    Environment = var.environment
    Purpose     = "serverless-integration"
  }
}

resource "aws_ssm_parameter" "database_url_secret_arn" {
  name  = "/habitly/${var.environment}/database-url-secret-arn"
  type  = "String"
  value = module.secrets.database_url_secret_arn

  tags = {
    Environment = var.environment
    Purpose     = "serverless-integration"
  }
}
