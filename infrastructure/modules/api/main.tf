# API Gateway HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.environment}-habitly-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.environment == "dev" ? ["*"] : var.cors_allowed_origins[var.environment]
    allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization"]
    allow_credentials = var.environment == "dev" ? false : true
    max_age           = 300
  }

  tags = {
    Name        = "${var.environment}-habitly-api"
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  default_route_settings {
    detailed_metrics_enabled = true
    logging_level            = "INFO"
    throttling_burst_limit   = 100
    throttling_rate_limit    = 50
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      requestTime             = "$context.requestTime"
      httpMethod              = "$context.httpMethod"
      path                    = "$context.path"
      status                  = "$context.status"
      protocol                = "$context.protocol"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      ip                      = "$context.identity.sourceIp"
      userAgent               = "$context.identity.userAgent"
    })
  }


  tags = {
    Name        = "${var.environment}-habitly-api-stage"
    Environment = var.environment
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.environment}-habitly-api"
  retention_in_days = 7

  tags = {
    Name        = "${var.environment}-habitly-api-logs"
    Environment = var.environment
  }
}
