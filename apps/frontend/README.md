# Habitly (Frontend)

The Habitly frontend is a responsive, mobile-first application built with React and Vite, optimized for both web and native platforms using Capacitor. Designed for habit formation and gamification, it delivers a joyful and intuitive experience whether you're on desktop or mobile.

---

## 🔧 Tech Stack

| Area           | Tech                      |
| -------------- | ------------------------- |
| Framework      | React (w/ TypeScript)     |
| Build Tool     | Vite                      |
| Mobile Support | Capacitor (iOS & Android) |
| Styling        | TailwindCSS               |
| Routing        | React Router              |
| Notifications  | Capacitor Push + Toast    |

---

## 🧭 Project Structure

```
apps/frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # App screens and routes
│   ├── contexts/     # Global app state (auth, habits, etc.)
│   ├── hooks/        # Custom hooks (API, logic, effects)
│   ├── services/     # API calls and auth token handling
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types and interfaces
├── public/           # Static files and PWA config
├── android/          # Capacitor Android config
├── ios/              # Capacitor iOS config
└── dist/             # Built output for deployment
```

---

## 🚀 Key Features

### 🎨 UI & UX

- Mobile-first design, fully responsive
- Dark mode with system preference detection
- Loading states, toast notifications, error feedback
- Smooth navigation and gesture support

### 🔐 Auth & Security

- JWT-based auth with refresh flow
- Google OAuth login
- Secure storage of session tokens (per environment)

### 📅 Habit Experience

- Create, update, and complete habits
- Flexible scheduling (daily, weekly, custom)
- Mood tracking with icons and notes
- Calendar view with completion history
- Streak tracking and achievements

### 🔔 Notifications

- Push notifications via Capacitor
- Daily habit reminders (customizable)
- Celebration animations and sounds

### 📱 Native App Support

- Syncs with backend via API
- Runs offline and syncs on reconnect
- Build-ready for iOS and Android via Capacitor

---

## 🛠️ Getting Started

### Install dependencies

```bash
npm install
```

### Run local dev server

```
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## 📱 Mobile Setup (Capacitor)

To build or test the native app:

```bash
npx cap sync
npx cap open ios
npx cap open android
```

The build output (/dist) is used as the web view in the native shell.

---

## 🧪 Testing

| Type          | Status              |
| ------------- | ------------------- |
| TypeScript    | ✅ Fully typed code |
| Unit Tests    | 🚧 Partial coverage |
| E2E / Cypress | 🔜 Planned          |

To check types:

```bash
npx tsc --noEmit
```

---
## ⚙️ Build & Environment

- Built with `Vite` and deployed via Vercel
- Uses Vercel environment variables (`VITE_`)
- Auto-deployment on push to `main`
- Supports Vercel preview deployments
---

## 🚀 Deployment

- **Platform**: Deployed on [Vercel](https://vercel.com/)
- **Preview URLs**: Automatic per branch via Vercel
- **Production URL**: [https://app.myhabitly.com](https://app.myhabitly.com)
- **Mobile Support**: Built with Capacitor for iOS/Android (optional build)

---

## 🧠 Notes

- Uses a shared layout system with mobile navigation
- State is persisted using localStorage for offline support
- Toasts and celebration screens add delight to habit completions

---

## ✅ Status

- MVP complete: Auth, habit flows, gamification
- Mobile build launch on iOS and Android
- Testing suite under active development

---

## 📄 License

© 2025 FT Tan  
Shared under a [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/)

This project is for learning, exploration, and portfolio sharing. Not for redistribution or reuse without permission.
