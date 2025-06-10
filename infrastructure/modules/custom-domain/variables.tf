variable "domain_name" {
  description = "The domain name for the API"
  type        = string
}

variable "environment" {
  description = "Environment (dev or prod)"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate"
  type        = string
}

variable "api_id" {
  description = "ID of the API Gateway"
  type        = string
}

variable "stage_name" {
  description = "Stage name of the API Gateway"
  type        = string
}