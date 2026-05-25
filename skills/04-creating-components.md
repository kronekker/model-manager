# Skill: Creating Frontend Components

## Constraint Context
This boilerplate utilizes Angular Standalone Components to keep the architecture clean and module-free. Creating a new page or feature requires a standard three-step process to ensure it is correctly integrated into the routing and navigation systems.

## Instructions for AI Agents
When a user asks to create a new page, view, or complex component in the frontend, always follow these three steps:

### 1. Generate the Component
Always use the Angular CLI within the `frontend` workspace to generate the component files. This ensures the standalone architecture, selector prefix, and file structures match the boilerplate standards. You can use `npx ng` or the npm scripts:

```bash
# Execute from the project root
cd frontend
npx ng generate component <component-name>
# or using bun
bunx ng generate component <component-name>
```

### 2. Update Application Routing
For the component to be accessible via a URL, you MUST register it in the application's route configuration.
Open `frontend/src/app/app.routes.ts`:
1. Import your newly generated component.
2. Add a new object to the `routes` array mapping a `path` string to your `component`.

```typescript
import { MyNewComponent } from './my-new/my-new.component';

export const routes: Routes = [
  // ... existing routes
  { path: 'my-new-route', component: MyNewComponent },
  { path: '**', redirectTo: '' } // always keep wildcard at the bottom
];
```

### 3. Update the Navigation Bar
Once the route exists, you MUST add a navigation link so the user can easily reach it from the UI.
Open `frontend/src/app/app.component.html` and locate the `<nav>` section containing the `routerLink` elements.
Add your new route using the `routerLink` and `routerLinkActive` directives:

```html
<a routerLink="/my-new-route" routerLinkActive="active" class="nav-item">
  My New Page
</a>
```

By completing all three steps, you guarantee that the new feature is completely integrated, routed, and easily accessible from the application header.
