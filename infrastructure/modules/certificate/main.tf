resource "aws_acm_certificate" "api_cert" {
  domain_name               = "api.${var.domain_name}"
  subject_alternative_names = ["api-dev.${var.domain_name}"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name        = "api-certificate"
    Environment = var.environment
  }
}