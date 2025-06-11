# Habitly Backend

The Habitly backend powers all core functionality — including authentication, habit tracking, and gamification. Built using Node.js and the Serverless Framework, it runs on AWS Lambda and interfaces with a PostgreSQL database via Prisma.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Serverless Framework
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **CI/CD**: GitHub Actions
- **Infrastructure**: AWS Lambda, API Gateway, Secrets Manager

---

## Key Features

- JWT authentication with refresh tokens
- Google OAuth support
- Habit creation, updates, and completion tracking
- Mood tracking and notes
- Streak tracking and gamification logic
- Secure password flow and email change

---

## Folder Structure

```
apps/backend/
├── src/
│   ├── auth/          # Auth controllers and JWT logic
│   ├── habits/        # Habit logic, controllers, stats
│   ├── utils/         # Helper functions and middleware
│   ├── lib/           # Prisma and logger configs
│   └── index.ts       # Main serverless handler
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── migrations/    # Prisma migrations
├── serverless.yml     # Serverless deployment config
└── package.json       # Project config
```

---

## Deployment

The backend is deployed via the Serverless Framework to AWS Lambda.

```bash
npm install -g serverless
npm run package:prod
npm run deploy:prod
```

Secrets and parameters are stored in AWS Secrets Manager and SSM respectively.

---

## Testing & Validation

- Unit tests: `npm run test`
- Prisma validation: `npm run prisma:validate`
- Type generation: `npm run prisma:generate`

---

## Environment Variables (Prod)

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NODE_ENV`
- `STAGE`

---

## Notes

- Use `npm run dev` to start in local offline mode (with `serverless-offline`).
- Backend uses Prisma for schema-first DB development.

---

## License

© 2025 FT Tan. All rights reserved. For inspiration and educational use only.