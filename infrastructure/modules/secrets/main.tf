# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.environment}/habitly/jwt-secret"
  description             = "JWT secret for Habitly authentication"
  recovery_window_in_days = 0 # Immediate deletion for dev environment

  tags = {
    Environment = var.environment
    Service     = "habitly"
    SecretType  = "jwt"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}

# Google OAuth Credentials
resource "aws_secretsmanager_secret" "google_client_id" {
  name                    = "${var.environment}/habitly/google-client-id"
  description             = "Google OAuth client ID for Habitly"
  recovery_window_in_days = 0

  tags = {
    Environment = var.environment
    Service     = "habitly"
    SecretType  = "oauth"
  }
}

resource "aws_secretsmanager_secret_version" "google_client_id" {
  secret_id     = aws_secretsmanager_secret.google_client_id.id
  secret_string = var.google_client_id
}

resource "aws_secretsmanager_secret" "google_client_secret" {
  name                    = "${var.environment}/habitly/google-client-secret"
  description             = "Google OAuth client secret for Habitly"
  recovery_window_in_days = 0

  tags = {
    Environment = var.environment
    Service     = "habitly"
    SecretType  = "oauth"
  }
}

resource "aws_secretsmanager_secret_version" "google_client_secret" {
  secret_id     = aws_secretsmanager_secret.google_client_secret.id
  secret_string = var.google_client_secret
}


# Database URL
resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.environment}/habitly/database-url"
  description             = "Neon PostgreSQL connection string"
  recovery_window_in_days = 0

  tags = {
    Environment = var.environment
    Service     = "habitly"
    SecretType  = "database"
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = var.database_url
}
