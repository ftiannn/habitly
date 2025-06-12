# Habitly

**Habitly** is a modern, full-featured habit-tracking application built for web and mobile. Designed to help users build lasting habits through gamification, streak tracking, push notifications, and an intuitive UI — all supported by a robust infrastructure and CI/CD pipeline.


<p align="center">
<!--   <img src="https://cpfcwrekrexf3svp.public.blob.vercel-storage.com/Habitly%20%281%29-dy56MiVjYrE8bEigVjR44tCpW6J9ET.png" alt="Habitly Logo" width="200"/> -->
  <img src="https://media.licdn.com/dms/image/v2/D562DAQFYAOQ_-uWJeA/profile-treasury-image-shrink_8192_8192/B56ZdjibiXGoAk-/0/1749721662011?e=1750348800&v=beta&t=IgjqEXHHVzwUbWmaLOIA5rlNQ2grL2H_XW-So56uZ-M" alt="Habitly App" width="400"/>
</p>
---

## Tech Stack

| Layer          | Technologies                                        |
| -------------- | --------------------------------------------------- |
| Frontend       | React, Vite, Capacitor (iOS/Android)                |
| Backend        | Node.js, Serverless Framework                       |
| Database       | Neon PostgreSQL, Prisma ORM                         |
| Infrastructure | AWS (Terraform), Cloudflare, GitHub Actions (CI/CD) |

---

## Monorepo Structure

```
habitly/
├── apps/
│ ├── backend/ # Node.js API with Serverless Framework
│ └── frontend/ # React Web App + Capacitor for mobile
├── infrastructure/ # AWS Infrastructure (Terraform)
├── scripts/ # Automation scripts (optional)
├── docs/ # Internal documentation (WIP)
├── package.json # Workspace configuration and shared deps
└── README.md # Root project overview
```

---

## Features Overview

### Authentication

- Email/password login
- Google OAuth integration
- Secure JWT handling with refresh tokens
- Password change support

### Habit Tracking

- Create habits with daily, weekly, or custom schedules
- Track completions, moods, and notes
- Filter by categories and tags
- View detailed progress and statistics

### Gamification & Motivation

- Achievement badges and milestones
- Streak tracking with celebrations
- Motivational quotes and progress rewards

### Mobile Support

- iOS and Android apps via Capacitor
- Push notifications for reminders
- Offline support with sync on reconnect

### Infrastructure & DevOps

- Modular AWS Terraform setup (Lambda, S3, API Gateway)
- GitHub Actions CI/CD for builds, validation, and deployments
- Secrets and parameters managed with AWS services
- Separate environments: dev, staging, and prod

---

## Deployment

Habitly is live and production-ready.

| Component  | Platform        | URL                            |
| ---------- | --------------- | ------------------------------ |
| Frontend   | Vercel          | https://app.myhabitly.com      |
| Backend    | AWS Lambda      | https://api.myhabitly.com/docs |
| Mobile     | Capacitor (WIP) | Deployed manually to devices   |
| Infra Code | Terraform       | `infrastructure/` folder       |

---

## Testing & Quality Assurance

| Area            | Status                     |
| --------------- | -------------------------- |
| Backend         | ✅ 25+ Postman test cases  |
| Frontend        | 🚧 Partial unit test suite |
| E2E Integration | 🚧 Incomplete              |
| Performance     | 🔜 Planned load testing    |
| Security        | ⚠️ `npm audit` coverage    |

---

## CI/CD Workflow

Powered by GitHub Actions:

- Runs on every push and PR
- Validates frontend and backend builds
- Checks TypeScript and lint rules
- Formats Terraform code and validates plans
- Security checks using npm audit
- Supports manual approval and environment inputs

---

## Tooling & Packages

- **Frontend**: React, Vite, Capacitor, TailwindCSS
- **Backend**: Node.js, Serverless Framework, Prisma
- **Infra**: Terraform, CloudWatch, SSM, Secrets Manager
- **Dev Tools**: TypeScript, ESLint, Prettier, GitHub Actions

---

## Environment & Secret Management

| Item          | Tool/Platform           |
| ------------- | ----------------------- |
| Secrets       | AWS Secrets Manager     |
| Config Params | AWS SSM Parameter Store |
| Domains       | Cloudflare DNS          |
| SSL Certs     | AWS ACM (auto-renewed)  |
| Logging       | AWS CloudWatch          |

---

## Project Milestones

| Status      | Description                                             |
| ----------- | ------------------------------------------------------- |
| ✅ Complete | MVP (auth, tracking, gamification, mobile push)         |
| 🔄 Ongoing  | Test coverage and analytics                             |
| 🔜 Planned  | User onboarding, WAF, backups, advanced infra hardening |

---

## Inspiration

Habitly was born from the desire to combine productivity with psychology and play. It helps users form better habits through engaging design, data-driven insights, and delightful interactions.

---

## About

Created by **FT Tan**  
This project is shared as inspiration and demonstration of end-to-end app development.

---

## License

© 2025 FT Tan.  
This project is licensed under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/).

_Please do not reuse, modify, or redistribute without permission._
