variable "environment" {
  description = "Environment name"
  type        = string
}

variable "secret_arns" {
  description = "List of secret ARNs that Lambda can access"
  type        = list(string)
}
