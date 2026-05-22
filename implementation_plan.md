# Refactoring to a Generic Developer Boilerplate

This plan details refactoring our unified project into a clean, reusable boilerplate template. Developers will be able to fork this project to start any unified TypeScript application, with a clear separation of routing, views, and examples.

## Proposed Changes

### 1. Root Documentation & Structure

#### [NEW] [README.md](file:///home/danielbellard/kronekker/template-project/README.md)
- Write developer instructions covering:
  - Repository structure and workspace layout.
  - Quickstart steps (installation, running local dev server, production builds).
  - How to expand the data model (shared types).
  - How to add new backend Express routes.
  - How to create and route new Angular standalone components.

---

### 2. Angular Navigation & Routing

We will split the application into a core shell layout and two page-level components:
- **Home View (`/`)**: A sleek, generic template landing page detailing the stack, showing how shared types work, and providing navigation links.
- **Status View (`/status`)**: Houses the telemetry dials (CPU/Memory gauges), uptime counter, request counts, and retro log terminal.

#### [MODIFY] [app.routes.ts](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.routes.ts)
- Configure routes:
  - `{ path: '', component: HomeComponent }`
  - `{ path: 'status', component: StatusComponent }`

#### [MODIFY] [app.ts](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.ts)
- Refactor the root component into a shell.
- Includes the persistent navigation header, logo, and the global API connection status dot.
- Uses `<router-outlet>` to render active route states.

#### [MODIFY] [app.html](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.html)
- Clean out the Kanban board layout.
- Renders the header logo, dynamic connection status indicator, top navigation buttons (`Home` and `Telemetry`), and the `<router-outlet>`.

#### [MODIFY] [app.css](file:///home/danielbellard/kronekker/template-project/frontend/src/app/app.css)
- Refactor style sheet to scope header, layout wrapper, and generic buttons. Move component-specific styling into separate component folders.

---

### 3. Component Implementations

#### [NEW] [Home Component](file:///home/danielbellard/kronekker/template-project/frontend/src/app/home)
- Files: `home.ts`, `home.html`, `home.css`.
- Represents the generic welcome page.
- Displays glassmorphism cards explaining the project structure and how the frontend and backend communicate using shared TypeScript types.

#### [NEW] [Status Component](file:///home/danielbellard/kronekker/template-project/frontend/src/app/status)
- Files: `status.ts`, `status.html`, `status.css`.
- Hosts all telemetry widgets: CPU usage, RAM utilization, requests counter, uptime clock, and the scrollable live logs feed.
- Moves the polling metrics interval loop into this component's lifecycle (`ngOnInit` and `ngOnDestroy`), keeping the root component light.

---

### 4. Backend Refinement

We will retain a clean, minimal, boilerplate-friendly CRUD API as a reference.

#### [MODIFY] [server.ts](file:///home/danielbellard/kronekker/template-project/backend/src/server.ts)
- Rename `/api/tasks` references to a more generic reference API: `/api/items`.
- Retain the `/api/metrics` route for feeding the `/status` route telemetry dashboard.
- Keep the database in memory for demonstrative purposes, allowing developers to see create/delete examples out of the box.

---

## Verification Plan

### Automated Build Verification
1. Run `npm run build` from root. Ensure zero TypeScript or Angular compiler failures.

### Manual Verification
1. Open the application.
2. Confirm the root page `/` shows the generic developer dashboard template.
3. Click "Telemetry Status" in the header to navigate to `/status`. Verify that:
   - The route transitions without page refreshes.
   - The CPU and Memory gauges update dynamically every 2 seconds.
   - The logs terminal lists active API server logs.
4. Refresh the page on `/status` directly to verify that the Express fallback routing handles deep links correctly without rendering a 404 error.
