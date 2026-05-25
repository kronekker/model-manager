# Getting Started

Welcome to your new starting point! This guide will take you from a fresh clone to running the full-stack boilerplate, and specifically show you how to effortlessly extend it using AI coding agents.

## 1. Local Setup & Smoke Testing

This boilerplate supports two execution runtimes: standard **Node.js** or the ultra-fast **Bun** runtime.

### Clone & Install
Clone your forked repository and install the workspace dependencies using your preferred runtime.

**Standard (Node.js/npm)**
*Prerequisite: [Node.js](https://nodejs.org/) (v18+)*
```bash
git clone https://github.com/kronekker/template-project.git
cd template-project
npm install
```

**Accelerated (Bun)**
*Prerequisite: [Bun](https://bun.sh/) (v1.0+)*
```bash
git clone https://github.com/kronekker/template-project.git
cd template-project
bun install
```

### Pointing to Your Own Repository
To use this boilerplate as the foundation for your own project, you should change the git `origin` to point to your own repository so you can commit and push your changes.

```bash
# 1. Remove the existing boilerplate remote
git remote remove origin

# 2. Add your new repository as the origin
git remote add origin https://github.com/your-username/your-new-repo.git

# 3. Push the starter code to your new repository
git push -u origin main
```

## ⚡ Node.js vs Bun

This boilerplate has been engineered to run perfectly under both standard Node.js and the ultra-fast Bun runtime. 

Curious which one you should choose for your team's architecture? Read our detailed breakdown:
[**Architectural Analysis: Node.js vs Bun**](./bun-or-node.md)

### Smoke Test (Development Mode)
Launch the development environment to verify everything is working. This runs both the Express backend and the Angular frontend in hot-reload mode concurrently.

**Standard (Node.js)**
```bash
npm run dev
```

**Accelerated (Bun)**
*(Bun's native `--watch` flag is used for the backend for zero-latency restarts)*
```bash
bun run dev:bun
```

IMPORTANT NOTE: If the default server port 3000 is in use, you can modify this with the following version of the run commands:

**Standard (Node.js)**
```bash
PORT=3001 npm run dev
PORT=3001 bun run dev:bun
````

Navigate to `http://localhost:4200`. You should see the Home page. Click "View Server Telemetry" to verify the backend API is connected and streaming data to the frontend.

### Smoke Test (Production Build)
To ensure there are no TypeScript interface mismatches or Angular budget errors, compile the entire project and run the unified server:

**Standard (Node.js)**
```bash
npm run build
npm run start
```

**Accelerated (Bun)**
*(Bun skips backend TypeScript compilation entirely and executes the raw `.ts` files directly in production)*
```bash
bun run build:bun
bun run start:bun
# OR
PORT=3001 bun run start:bun
```

Navigate to `http://localhost:3000 (or the port specified)`. The Express server is now serving both your static Angular assets and the API endpoints out of a single process on the same port!


### repeatable dev and build process
There are two files that can be used to create a repeatable dev and build process:
```bash
run_dev
build_start
```

both have default values for port and host:
```bash
PORT=${PORT:-3000}
RUNTIME=${RUNTIME:-node}
```

You can run as is, or pass your own PORT or runtime to use.
```bash
#example
run_dev --port 3001 --bun
```
Alternatively, you can just modify the defaults to your preference and just run `run_dev` and `build_start`.

## 2. Directing Your AI Coding Agent

This boilerplate is uniquely designed to be easily extensible by AI coding assistants (like Gemini, GitHub Copilot, or Cursor). 

Instead of fighting the AI over styling choices or architecture decisions, we've provided explicit instruction files located in the `skills/` directory.

### The Skills Library
Take a quick look at these files; they serve as a manual for human developers and as explicit system prompts for AI agents:
- **`skills/01-architecture.md`**: Enforces the use of the shared monorepo types and standalone components.
- **`skills/02-ui-styling.md`**: Dictates the use of the global `kbp-` glassmorphic CSS classes (so the AI doesn't generate inline styles or rogue CSS).
- **`skills/03-complex-components.md`**: Mandates the use of AG Grid and Apache ECharts for data presentation, complete with theming requirements.
- **`skills/04-creating-components.md`**: Defines the standard procedure for generating new components, routing, and updating the navigation bar.

### How to Use Them with AI Agents
Because different AI harnesses (like Cursor, GitHub Copilot, or Gemini) consume context differently, the best way to ensure the AI follows the project's standards is to explicitly tell it to read the `skills/` directory before writing any code.

#### The "Copy & Paste" Universal Prefix
For major features, or if you aren't sure which specific files apply, simply prepend this prefix to your request:

> *"Before you begin this task, please read all the markdown files in the `skills/` directory to understand the strict architectural constraints, styling guidelines, and component generation procedures for this repository. Once you have ingested these rules, please complete the following task: [YOUR REQUEST HERE]"*

#### Specific Use-Case Examples
If you prefer to be targeted, you can point the agent to specific skill files based on what you need.

**Example 1: Creating a Full-Stack Feature**
> *"I need a new page for managing User Accounts. Please read `skills/01-architecture.md` and `skills/04-creating-components.md`. Define a `User` interface in the shared workspace, create a backend endpoint to return mock users, and generate the new page in the frontend (including updating the router and navigation bar)."*

**Example 2: Adding a Complex Data Table**
> *"I need to display server logs in a grid on the status page. Please read `skills/02-ui-styling.md` and `skills/03-complex-components.md` before starting. Ensure you use AG Grid with the `ag-theme-quartz-dark` theme, and style the container using the global `kbp-` classes."*

By providing these simple file constraints within your prompt, the AI will should the boilerplate's premium aesthetic and strict type-safe architecturem across your applications based on this template repo.
