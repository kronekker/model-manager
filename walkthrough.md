# Implementation Walkthrough: Unified Angular & Node.js Codebase

We have successfully set up a unified, type-safe Angular frontend and Node.js Express backend project in TypeScript. Both projects operate as workspaces inside a single npm monorepo, sharing API models and deploying as a single process.

---

## What Was Built

### 1. Workspace Configuration & Shared Module
- **[package.json](file:///home/danielbellard/kronekker/template-project/package.json)**: Declares workspace paths (`shared`, `backend`, `frontend`) and orchestrates scripts.
- **[tsconfig.json](file:///home/danielbellard/kronekker/template-project/tsconfig.json)**: Extends compilation settings globally.
- **[shared/src/index.ts](file:///home/danielbellard/kronekker/template-project/shared/src/index.ts)**: Contains TypeScript models (`Task`, `SystemMetrics`, `LogMessage`) which serve as the unified API contracts. Altering these will break compilation on both backend and frontend if they are out of sync, preventing runtime integration bugs.

### 2. Node.js Backend Server
- **[backend/src/server.ts](file:///home/danielbellard/kronekker/template-project/backend/src/server.ts)**: 
  - Standard Express API server hosting task endpoints (`/api/tasks`) and metrics telemetry (`/api/metrics`).
  - Implements an in-memory datastore for tasks and recent console logs.
  - In production mode, serves the compiled Angular client bundle static files from `frontend/dist/frontend/browser` and delegates single-page routing redirects to `index.html`.

### 3. Angular Frontend Dashboard
- **[frontend/src/app/app.ts](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.ts)**: Leverages **Angular Signals** to manage list states, status moves, new forms, loading, and connection metrics. Activates a 2-second polling loop to retrieve server metrics telemetry.
- **[frontend/src/app/app.html](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.html)**: Glassmorphic Developer Dashboard showing live CPU & memory usage meters, server uptime, API request counters, a real-time retro server log stream, and a full-featured Kanban board.
- **[frontend/src/app/app.css](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.css)**: Implements custom animations, glowing badges, pulsing online indicators, and modal slide-ins.
- **[frontend/proxy.conf.js](file:///home/danielbellard/kronekker/template-project/frontend/proxy.conf.js)**: Configures the Angular dev server dynamically to proxy any `/api` endpoints to the backend port matching the `PORT` environment variable (defaulting to 3000) during active coding.

---

## Verification & Build Integrity

We verified the codebase components using the following commands:
1. **Compilation test**: Running `npm run build` succeeds across all workspaces:
   - Shared typings compiles.
   - Angular builds the frontend bundle outputting to `frontend/dist/frontend/browser`.
   - Express server compiles to `backend/dist/server.js`.
2. **Unified API Serving**: Run backend using `npm run start` and query endpoints:
   - `http://localhost:3000/api/tasks` returns seeded JSON task arrays.
   - `http://localhost:3000/api/metrics` displays active CPU/memory metrics and logging history.
   - Root URL `http://localhost:3000/` successfully renders the compiled Angular frontend client code.

---

## How to Run the Project

### A. Development Mode (Concurrent Hot-Reloading)
Run the following command at the root directory:
```bash
npm run dev
```
This runs the backend using `tsx watch` (watching backend/src for changes) and the frontend using `ng serve` with HMR and proxy configs. You can edit backend or frontend code files, and see edits hot-reload in real-time.

### B. Production Mode (Single Artifact Run)
To build and run the application as a unified package:
```bash
# 1. Compile both the Angular UI and Node Express compiler
npm run build

# 2. Spin up the unified node service (which serves API and static files)
npm run start
```
By default, the server runs on port `3000` (or uses the environment variable `PORT`).
