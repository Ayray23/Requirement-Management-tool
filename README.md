# REMT

REMT is a production-oriented requirement elicitation and management platform built with React, Firebase, and Node.js. The current codebase uses live Firebase Authentication, Firestore, Firebase Cloud Functions, and Firestore security rules to support real users, admin governance, and role-based access control.

## Architecture

- `client/`
  React + Vite frontend, Tailwind UI, Firebase client SDK, live Firestore data services
- `functions/`
  Firebase Cloud Functions for privileged actions such as role assignment, user suspension, and safe requirement deletion
- `server/`
  Lightweight Express API for health checks and report export
- `firestore.rules`
  Production Firestore authorization rules
- `firestore.indexes.json`
  Indexed query definitions for requirements, users, comments, and activity

## Core Capabilities

- Firebase email/password and Google authentication
- Persistent session handling with claims-aware auth state
- Firestore-backed requirements, comments, and activity tracking
- Role-based access control with `user`, `admin`, and `super-admin`
- Admin governance console for user management and access control
- Analytics and dashboard views backed by live Firestore data
- Cloud Functions for sensitive admin actions

## Firebase Data Model

### Collections

- `users/{uid}`
  Stores identity, role, status, profile, and audit timestamps
- `requirements/{requirementId}`
  Stores requirement metadata, ownership, workflow status, and summary counters
- `requirements/{requirementId}/comments/{commentId}`
  Requirement discussion thread entries
- `requirements/{requirementId}/activity/{activityId}`
  Requirement audit trail and collaboration activity
- `system/counters`
  Stores the running counter for public requirement ids

## Environment Variables

### Frontend: `client/.env`

Copy from [client/.env.example](C:\Users\Owner\Desktop\Ray final year project\client\.env.example).

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_USE_FUNCTIONS_EMULATOR=false
```

### Backend: `server/.env`

Copy from [server/.env.example](C:\Users\Owner\Desktop\Ray final year project\server\.env.example).

```env
PORT=5000
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication.
3. Enable the Email/Password provider.
4. Enable the Google provider.
5. Enable Firestore Database in production mode.
6. Add your frontend domain under Firebase Authentication authorized domains.
7. Create a Web App and copy the web config values into `client/.env`.
8. Open `Project settings` -> `Service accounts` -> generate a private key and copy the admin values into `server/.env`.

## Local Development

From the project root [C:\Users\Owner\Desktop\Ray final year project](C:\Users\Owner\Desktop\Ray final year project):

```powershell
npm.cmd install
```

Run the frontend:

```powershell
npm.cmd run dev:client
```

Run the backend:

```powershell
npm.cmd run dev:server
```

Optional checks:

```powershell
npm.cmd run check
npm.cmd run check:functions
npm.cmd run build --workspace client
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health endpoint: `http://localhost:5000/api/health`

## Firebase Functions and Rules

Deploy Firebase resources with:

```powershell
firebase deploy --only firestore:rules,firestore:indexes,functions,hosting
```

Key callable functions:

- `syncSessionProfile`
- `setUserRole`
- `setUserStatus`
- `deleteRequirementCascade`

## RBAC Model

- `user`
  Can sign in, read workspace data, comment, and update their own profile
- `admin`
  Can manage requirements and suspend/reactivate standard users
- `super-admin`
  Can assign roles and manage other admins

The UI uses role checks for visibility, while Firestore rules and Cloud Functions enforce backend authorization.

## Deployment

### Firebase-first deployment

1. Build the client:

```powershell
npm.cmd run build --workspace client
```

2. Deploy Firestore rules, indexes, functions, and hosting:

```powershell
firebase deploy --only firestore:rules,firestore:indexes,functions,hosting
```

### Split deployment

- Frontend can still be hosted on Vercel
- Backend API can still be hosted on Render
- Firebase remains the source of truth for auth, data, and admin actions

## Security Notes

- Never commit `.env` files
- Never expose Firebase Admin secrets in frontend code
- Rotate any Firebase service-account key that has been shared outside a secure environment
- Use Firestore rules and custom claims together; UI checks alone are not sufficient
