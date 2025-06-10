variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "database_url" {
  description = "Neon PostgreSQL database URL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "The domain name for the API"
  type        = string
  default     = "myhabitly.com"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
