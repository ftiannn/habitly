terraform {
  backend "s3" {
    bucket         = "habitly-terraform-state"
    key            = "terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "habitly-terraform-locks"
    encrypt        = true
  }
}
