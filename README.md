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

## Run Locally

Open two terminals in the project root: `C:\Users\Owner\Desktop\Ray final year project`

Terminal 1:

```powershell
npm.cmd install
npm.cmd run dev:server
```

Terminal 2:

```powershell
npm.cmd run dev:client
```

Local addresses:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

If `npm install` is too heavy from the root, you can install per workspace:

```powershell
npm.cmd install --workspace client
npm.cmd install --workspace server
```

## Quality Guardrails

- Use Node `20.x` to match deployment and the checked-in [.nvmrc](C:/Users/Owner/Desktop/Ray%20final%20year%20project/.nvmrc).
- Run `npm run check` from the project root before pushing changes.
- Vercel deploys the built frontend from `client/dist` using the root [vercel.json](C:/Users/Owner/Desktop/Ray%20final%20year%20project/vercel.json).
- Client-side app routes are rewritten to `index.html`, which is required because the frontend uses React Router with browser history.

## Firebase Notes

The project already includes:

- frontend Firebase app bootstrap
- backend Firebase admin bootstrap
- safe fallbacks to demo mode when credentials are missing

That means you can demo the project immediately with seeded mock data, then switch to real Firebase later without rewriting the app structure.
