variable "enable_free_tier_constraints" {
  description = "Enforce AWS Free Tier limits"
  type        = bool
  default     = true
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment (dev, prod)"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the API"
  type        = string
  default     = "myhabitly.com"
}
