# 🌱 Habitly

A full-featured habit-tracking app designed for modern users — available across web and mobile platforms. Built with a monorepo architecture and powered by a robust CI/CD pipeline, Habitly provides users with everything from streak tracking and gamification to push notifications and offline support.

---

## 🔧 Tech Stack

| Layer         | Tech                                             |
|---------------|--------------------------------------------------|
| Frontend      | React, Vite, Capacitor (iOS/Android)             |
| Backend       | Node.js, Serverless Framework                    |
| Database      | Neon PostgreSQL, Prisma ORM                      |
| Infrastructure| AWS (Terraform), Cloudflare, GitHub Actions CI/CD|

---

## 🏗️ Monorepo Structure

```
habitly/
├── apps/
│ ├── backend/ # Serverless API (Node.js, Prisma)
│ └── frontend/ # React Web App with Capacitor Mobile Support
├── infrastructure/ # Terraform-based AWS Infrastructure
├── scripts/ # Automation scripts (optional - WIP)
├── docs/ # Internal documentation (WIP)
├── package.json # Shared dependencies and workspace config
└── README.md # This file
```

---

## ✅ Key Features

### 🔐 Authentication
- Email/password login
- Google OAuth integration
- JWT with refresh tokens
- Secure password change flow

### 🧠 Habit Tracking
- Custom schedules (daily, weekly, flexible)
- Completion history & mood tracking
- Notes, categories, and filtering

### 🎯 Gamification
- Badge & achievement system
- Streaks and celebrations
- Motivational quotes and rewards

### 📱 Mobile-Ready
- Native iOS & Android app via Capacitor
- Push notifications
- Offline mode with sync

### ⚙️ Infrastructure
- Terraform-managed AWS setup
- API Gateway, Lambda, S3, Secrets Manager
- CI/CD with GitHub Actions
- Secure token handling & environment separation

---

## 🚀 Deployment

Habitly is fully deployed and production-ready.

- **Frontend**: Hosted via CDN, mobile built with Capacitor
- **Backend**: Deployed with Serverless Framework to AWS Lambda
- **API**: `https://api.myhabitly.com`
- **Infrastructure**: Provisioned using Terraform (`infrastructure/`)

---

## 🧪 Testing & Quality

| Type           | Status              |
|----------------|---------------------|
| Backend Tests  | ✅ 25+ Postman cases |
| Frontend Tests | 🚧 Some unit tests   |
| E2E Tests      | 🚧 Partial           |
| Performance    | 🔜 Planned           |
| Security       | ⚠️ `npm audit` only  |

---

## 📈 CI/CD Workflow

- GitHub Actions triggers on push & PRs
- Validates:
  - Backend build & packaging
  - Frontend TypeScript & build output
  - Terraform formatting & validation
  - Security audit on both apps
- Manual deploy approval via workflow inputs

---

## 📦 Packages & Tools Used

**Frontend**: React, Vite, Capacitor, TailwindCSS  
**Backend**: Node.js, Serverless Framework, Prisma  
**Infrastructure**: Terraform (modular), CloudWatch, SSM, Secrets Manager  
**Dev Tools**: ESLint, Prettier, TypeScript, GitHub Actions

---

## 🔒 Environments & Secrets

| Type           | Tool                    |
|----------------|-------------------------|
| Secrets        | AWS Secrets Manager     |
| Params         | AWS SSM Parameter Store |
| Domains        | Cloudflare DNS          |
| SSL            | AWS ACM (auto-renewal)  |
| Logging        | CloudWatch              |

---

### ✅ Completed
- MVP: Authentication, Habit Tracking, Gamification, Push Notifications

### 🔄 In Progress
- Add full test coverage (Frontend & Integration)

### 🔜 Upcoming
- Launch onboarding & analytics
- Add WAF, backups, and rate limiting

**Legend**  
✅ Completed | 🔄 In Progress | 🔜 Not Started

---

## 🧠 Inspiration

Habitly was created to combine productivity, psychology, and gamification — helping users build better habits in a joyful and sustainable way.

---

## 👩‍💻 Author

Built with ❤️ by FT Tan
This project is shared for inspiration — feel free to reach out if you're curious.

---

## 📄 License

© 2025 FT Tan  
This work is licensed under a [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/).

Feel free to explore the project, but do not reuse, modify, or distribute without permission.
