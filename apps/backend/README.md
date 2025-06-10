# Habitly Backend

Node.js serverless backend for the Habitly habit-tracking application.

## Tech Stack

- **Runtime:** Node.js 18.x
- **Framework:** Serverless Framework
- **Database:** Neon PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Google OAuth
- **Bundler:** esbuild
- **Infrastructure:** Deployed to Terraform-managed AWS infrastructure

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth authentication
- `GET /auth/me` - Get current user profile
- `POST /auth/change-password` - Change user password

### Habits (Coming Soon)

- `GET /habits` - List user habits
- `POST /habits` - Create new habit
- `PUT /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit
- `POST /habits/:id/complete` - Mark habit as completed

## Development Setup

### Prerequisites

1. **Node.js** 18+ and npm
2. **Serverless Framework** installed globally
3. **Infrastructure deployed** - See [habitly-infra](https://github.com/ftiannn/habitly-infra)

### Installation

```bash
# Clone repository
git clone https://github.com/ftiannn/habitly-backend.git
cd habitly-backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Environment Setup

The backend reads configuration from AWS infrastructure via SSM parameters. No local environment variables needed for deployment.

For local development:

```bash
# Create .env for local development
DATABASE_URL="postgresql://username:password@host/database"
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Setup

```bash
# Run database migrations
npx prisma migrate dev

# Optional: Seed database
npx prisma db seed
```

### Local Development

```bash
# Start local development server
npm run dev

# Or use Serverless offline
serverless offline
```

## Deployment

### Prerequisites

Ensure infrastructure is deployed first:

```bash
cd ../infra/environments/dev
terraform apply
```

### Deploy Functions

```bash
# Deploy to development
npm run deploy:dev

# Deploy to production (when ready)
npm run deploy:prod
```

### Verify Deployment

```bash
# Test the deployed API
curl https://api-dev.myhabitly.com/auth/me

# Check function logs
serverless logs -f authMe --stage dev
```

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

## Troubleshooting

### Useful Commands

```bash
# Check deployment info
serverless info

# View function logs
serverless logs -f authMe --tail

# Invoke function locally
serverless invoke local -f authMe

# Check Prisma schema
npx prisma introspect
```

## Contributing

1. Create feature branch from `main`
2. Make changes and add tests
3. Ensure all tests pass
4. Submit pull request

## License

This project is part of the Habitly application.
