# Unified TypeScript Workspace: Angular + Node.js Boilerplate

A unified, strictly typed development template combining an **Angular SPA** (frontend) and a **Node.js Express API** (backend), linked via a **Shared TypeScript Models** package in an npm monorepo workspace.

## Key Features

- **End-to-End Type Safety**: Share TypeScript contracts (`shared`) between client and server. Modifying an interface immediately flags compilations errors on both sides if out of sync.
- **Concurrent Development**: Single command (`npm run dev`) launches both Express backend (with `tsx` hot reloading) and the Angular dev server (with HMR and proxy configurations).
- **Environment Synced Port**: Run both backend and frontend proxy on a custom port using a single command: `PORT=3005 npm run dev`.
- **Single-Artifact Deployments**: Compile the Angular client into static assets and compile Express into vanilla JS. Run the entire fullstack app via a single Node.js process (`node dist/server.js`), serving both static files and API endpoints.

---

## Folder Architecture

```text
├── package.json                 # Monorepo configuration and orchestrator scripts
├── tsconfig.json                # Root base TypeScript configurations
├── shared/                      # TypeScript models/interfaces shared across client/server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts             # Shared data definitions
├── backend/                     # Node.js + Express + TypeScript API server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── server.ts            # Entrypoint (serves API & static frontend assets)
└── frontend/                    # Angular Standalone SPA client
    ├── package.json
    ├── angular.json
    ├── proxy.conf.js            # Dynamic API proxy mapping ports automatically
    └── src/
        └── app/
            ├── app.routes.ts    # Application routing definitions
            ├── home/            # Standalone Home page component
            └── status/          # Standalone Telemetry/Status page component
```

---

## Quickstart

### 1. Installation
Install workspace dependencies at the root directory:
```bash
npm install
```

### 2. Run Local Development Server
Run the local dev server (default port `3000`):
```bash
npm run dev
```
To run on a custom port (e.g. `3005`):
```bash
PORT=3005 npm run dev
```
- Frontend dev server runs at: `http://localhost:4200`
- Backend API server runs at: `http://localhost:3000` (or your custom port)
- *All client requests to `/api` are automatically proxied to the backend port.*

### 3. Production Build and Launch
Compile everything and run the unified single-process application:
```bash
# Compile shared models, frontend client, and backend Express app
npm run build

# Start the unified web server
npm run start
```
Go to `http://localhost:3000` (or `PORT`) to view the application.

---

## How to Extend the Boilerplate

### A. Extending Data Models (Shared Types)
1. Open [shared/src/index.ts](file:///home/danielbellard/kronekker/template-project/shared/src/index.ts) and add/update your interfaces.
2. Compile the shared workspace package to generate declaration files:
   ```bash
   npm run build -w shared
   ```

### B. Adding Backend API Endpoints
1. Open [backend/src/server.ts](file:///home/danielbellard/kronekker/template-project/backend/src/server.ts).
2. Create/modify your Express endpoints (e.g. `app.get('/api/your-endpoint', ...)`).
3. Import the shared types from `'shared'` to ensure request/response compliance.

### C. Adding Angular Pages & Routing
1. Generate a new standalone component using Angular CLI:
   ```bash
   npx ng generate component your-page --project=frontend
   ```
2. Register the route in [frontend/src/app/app.routes.ts](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.routes.ts):
   ```typescript
   import { YourPageComponent } from './your-page/your-page.component';
   
   export const routes: Routes = [
     // ...
     { path: 'your-page', component: YourPageComponent }
   ];
   ```
3. Use `<a routerLink="/your-page">` inside template files for client-side routing.
