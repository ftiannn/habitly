# Habitly Infrastructure

This repository contains the Terraform infrastructure for the Habitly habit-tracking application.

## Architecture Overview

```
Frontend/Mobile App
    ↓
https://api-dev.myhabitly.com (Custom Domain)
    ↓
AWS API Gateway (Terraform-managed)
    ↓
Lambda Functions (Serverless-deployed)
    ↓
Secrets Manager (Terraform-managed)
    ↓
Neon PostgreSQL Database
```

## Infrastructure Components

### Terraform Modules

- **`modules/api/`** - API Gateway HTTP API configuration
- **`modules/certificate/`** - SSL certificate management (ACM)
- **`modules/custom-domain/`** - Custom domain mapping for API
- **`modules/lambda-role/`** - IAM roles and policies for Lambda functions
- **`modules/secrets/`** - AWS Secrets Manager for sensitive configuration

### Environments

- **`environments/dev/`** - Development environment configuration
- **`environments/prod/`** - Production environment configuration (future)

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** v1.5+ installed
3. **Domain ownership** - You must own the domain for custom SSL certificates
4. **Cloudflare account** - For DNS management

## Environment Setup

### Required Environment Variables

Create a `.env.dev` file in `environments/dev/`:

```bash
# Source this file before running terraform
export TF_VAR_database_url="postgresql://username:password@host/database"
export TF_VAR_jwt_secret="your-jwt-secret-here"
export TF_VAR_google_client_id="your-google-client-id"
export TF_VAR_google_client_secret="your-google-client-secret"
```

**⚠️ Never commit this file to version control!**

## Deployment Guide

### Initial Setup

1. **Configure AWS credentials:**

   ```bash
   aws configure
   ```

2. **Initialize Terraform:**

   ```bash
   cd environments/dev
   terraform init
   ```

3. **Load environment variables:**

   ```bash
   source .env.dev
   ```

4. **Plan and apply:**
   ```bash
   terraform plan
   terraform apply
   ```

### SSL Certificate Setup

1. **Get certificate validation records:**

   ```bash
   terraform output certificate_validation_records
   ```

2. **Add DNS records to Cloudflare:**

   - Add each validation record as CNAME
   - Set Proxy Status to "DNS Only" (gray cloud)

3. **Wait for certificate validation** (5-10 minutes)

### Custom Domain Setup

1. **Get target domain:**

   ```bash
   terraform output target_domain_name
   ```

2. **Add CNAME record to Cloudflare:**

   ```
   Type: CNAME
   Name: api-dev
   Target: [target_domain_name from output]
   Proxy: DNS Only (gray cloud)
   ```

3. **Wait for DNS propagation** (10-20 minutes)

## Integration with Backend

This infrastructure is designed to work with the [habitly-backend](https://github.com/ftiannn/habitly-backend) repository.

The backend uses SSM parameters to reference infrastructure resources:

```yaml
# In serverless.yml
provider:
  httpApi:
    id: ${ssm:/habitly/${self:provider.stage}/api-gateway-id}
  role: ${ssm:/habitly/${self:provider.stage}/lambda-role-arn}
```

## Outputs

Key infrastructure outputs available after deployment:

- **`api_endpoint`** - Direct API Gateway URL
- **`api_custom_domain`** - Custom domain URL
- **`lambda_role_arn`** - IAM role for Lambda functions
- **`secrets_created`** - List of created secrets

## Cost Optimization

This infrastructure is optimized for AWS Free Tier:

- **API Gateway HTTP API** - Free tier: 1M requests/month
- **Lambda** - Free tier: 1M requests + 400,000 GB-seconds/month
- **ACM Certificates** - Free for AWS services
- **Secrets Manager** - $0.40/secret/month

**Estimated monthly cost: ~$3-5 for secrets + minimal usage charges**

## Troubleshooting

### Common Issues

1. **Certificate validation fails:**

   - Verify DNS records in Cloudflare
   - Ensure Proxy Status is "DNS Only"
   - Wait for DNS propagation

2. **Custom domain not resolving:**

   - Check CNAME record points to correct target
   - Verify DNS propagation with `nslookup`
   - Try adding to `/etc/hosts` for immediate testing

3. **Lambda functions can't access secrets:**
   - Verify IAM role has `secretsmanager:GetSecretValue` permission
   - Check secret ARNs in SSM parameters

### Useful Commands

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn [arn] --region ap-southeast-1

# Check SSM parameters
aws ssm get-parameters --names "/habitly/dev/api-gateway-id" --region ap-southeast-1

# Test DNS resolution
nslookup api-dev.myhabitly.com 1.1.1.1

# Check API Gateway
aws apigatewayv2 get-apis --region ap-southeast-1
```

## Security Notes

- ✅ All secrets stored in AWS Secrets Manager
- ✅ IAM roles follow principle of least privilege
- ✅ SSL/TLS enforced for all API endpoints
- ✅ Environment variables never contain sensitive data
- ✅ Infrastructure as Code for auditability

## Contributing

1. Create a feature branch
2. Make changes to appropriate modules
3. Test in development environment
4. Submit pull request with detailed description

## License

This infrastructure code is part of the Habitly project and follows the same license terms.
