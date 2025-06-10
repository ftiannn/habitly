output "domain_name" {
  description = "The custom domain name"
  value       = aws_apigatewayv2_domain_name.api_domain.domain_name
}

output "target_domain_name" {
  description = "The target domain name for CNAME record"
  value       = aws_apigatewayv2_domain_name.api_domain.domain_name_configuration[0].target_domain_name
}

output "hosted_zone_id" {
  description = "The hosted zone ID"
  value       = aws_apigatewayv2_domain_name.api_domain.domain_name_configuration[0].hosted_zone_id
}