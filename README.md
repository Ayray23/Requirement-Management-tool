# REMT

REMT is a smart requirement elicitation and management platform built for a final year project. The app combines a bold React frontend, a Node.js/Express API, and Firebase-ready integrations for authentication and cloud data.

## Stack

- React 18 + Vite
- React Router
- Express + CORS + Helmet
- Firebase client and admin SDK integration points
- Recharts for analytics

## Product Modules

- Workspace sign-in and onboarding
- Executive dashboard with project health insights
- Requirements table and kanban views
- Requirement detail and AI-assisted workbench
- Collaboration feed
- Sprint analytics and reporting
- Profile and notification settings

## Project Structure

```text
client/   React frontend
server/   Express backend
```

## Setup

1. Install dependencies from the project root with `npm install`.
2. Copy `client/.env.example` to `client/.env`.
3. Copy `server/.env.example` to `server/.env`.
4. Add your Firebase web and admin credentials.
5. Start the frontend with `npm run dev:client`.
6. Start the backend with `npm run dev:server`.

## Firebase Notes

The project already includes:

- frontend Firebase app bootstrap
- backend Firebase admin bootstrap
- safe fallbacks to demo mode when credentials are missing

That means you can demo the project immediately with seeded mock data, then switch to real Firebase later without rewriting the app structure.
