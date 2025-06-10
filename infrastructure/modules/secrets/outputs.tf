output "jwt_secret_arn" {
  description = "ARN of JWT secret"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "google_client_id_secret_arn" {
  description = "ARN of Google client ID secret"
  value       = aws_secretsmanager_secret.google_client_id.arn
}

output "google_client_secret_secret_arn" {
  description = "ARN of Google client secret secret"
  value       = aws_secretsmanager_secret.google_client_secret.arn
}

output "database_url_secret_arn" {
  description = "ARN of database URL secret"
  value       = aws_secretsmanager_secret.database_url.arn
}
