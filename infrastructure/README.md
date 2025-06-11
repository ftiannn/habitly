# Habitly Infrastructure

This module provisions the cloud infrastructure that supports the Habitly app. It uses Terraform to manage AWS services including Lambda, API Gateway, Secrets Manager, S3, and CloudWatch.

---

## Structure

```
infrastructure/
├── modules/                # Reusable modules for API, auth, etc.
├── environments/
│   └── prod/               # Production-specific configuration
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── README.md
```

---

## Tools

- **Terraform**: Infrastructure-as-code
- **Cloud Provider**: AWS
- **CI/CD**: GitHub Actions (via validation workflow)

---

## Key AWS Resources

- API Gateway (HTTP)
- AWS Lambda
- Secrets Manager
- Parameter Store (SSM)
- S3 (optional, for frontend/static)
- ACM (for HTTPS via Cloudflare)
- CloudWatch (monitoring and logs)

---

## Usage

```bash
cd infrastructure/environments/prod

terraform init
terraform validate
terraform plan
terraform apply
```

---

## Formatting & Linting

```bash
terraform fmt -recursive
```

---

## License

© 2025 FT Tan. Infrastructure setup shared for learning and inspiration.