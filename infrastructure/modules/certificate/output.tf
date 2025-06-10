output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.api_cert.arn
}

output "domain_validation_options" {
  description = "Certificate validation options for DNS records"
  value       = aws_acm_certificate.api_cert.domain_validation_options
}