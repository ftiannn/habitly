variable "environment" {
  description = "Environment name"
  type        = string
}

variable "enable_free_tier_constraints" {
  description = "Enforce AWS Free Tier limits"
  type        = bool
  default     = true
}

variable "cors_allowed_origins" {
  description = "Allowed CORS origins"
  type        = map(list(string))
  default = {
    dev = [
      # Web development origins (these work with API Gateway)
      "http://localhost:3000",
      "http://localhost:8080", 
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "https://localhost:3000",
      "https://localhost:8080",
      
      # Your dev domain if you have one
      "https://dev.myhabitly.com"
    ]
    prod = [
      "https://app.myhabitly.com",
      "https://www.app.myhabitly.com"
    ]
  }
}

