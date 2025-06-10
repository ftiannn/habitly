resource "aws_apigatewayv2_domain_name" "api_domain" {
  domain_name = var.environment == "prod" ? "api.${var.domain_name}" : "api-dev.${var.domain_name}"

  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = {
    Name        = "api-domain-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  api_id      = var.api_id
  domain_name = aws_apigatewayv2_domain_name.api_domain.id
  stage       = var.stage_name
}