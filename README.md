# Local Model Manager

Local Model Manager is a unified, high-performance monorepo application designed to organize and configure local LLM engines running in `llama.cpp`. 

It enables developers to seamlessly scan cached GGUF quantization weights, query the Hugging Face Hub for popular trending repositories, inspect quantization files (including multimodal model setups), and dynamically modify system runtime execution parameters through local shell script updates and `systemd` service restarts.

---

## 🎯 Architecture

The project is structured as an npm workspaces monorepo:

1. **Shared Package (`shared`)**: Defined in `shared/`. Holds common TypeScript interfaces (`CachedModel`, `HFSearchModel`, `ModelInspectData`, `SystemMetrics`) enforcing strict API contracts between frontend and backend.
2. **Backend Server (`backend`)**: Defined in `backend/`. An Express API server (supporting Node.js or Bun) that coordinates system commands and reads/writes the runner script. Hugging Face search and cache scans are delegated to a self-contained child-process Python helper `hf_helper.py` using the native `huggingface_hub` Python package.
3. **Frontend Client (`frontend`)**: Defined in `frontend/`. A premium dark glassmorphic single-page dashboard designed in Angular using standalone components, Signals state management, and highly optimized AG Grid tables.

---

## ⚡ Prerequisite Installation

Before running the application, make sure your workspace dependencies are fully installed:

```bash
# Using standard Node.js/npm
npm install

# Or using the ultra-fast Bun runtime
bun install
```

---

## 🚀 Execution & Development Commands

This monorepo supports concurrent hot reloading for zero-latency development.

### 1. Running in Development Mode
Launches the Express API server (defaulting to port `3000`) and the Angular development server (port `4200` with hot module replacement) concurrently.

* **Standard (Node.js)**
  ```bash
  npm run dev
  ```
* **Accelerated (Bun)**
  ```bash
  npm run dev:bun
  ```

*To specify a custom port for the API server, prepend the `PORT` variable:*
```bash
PORT=3001 npm run dev
PORT=3001 npm run dev:bun
```

### 2. Building the Project
Compiles the shared types package, builds the Angular production bundle, and compiles the Express TypeScript files into production JavaScript.

* **Standard (Node.js)**
  ```bash
  npm run build
  ```
* **Accelerated (Bun)**
  ```bash
  npm run build:bun
  ```

### 3. Running in Production
Serves the unified, compiled backend API endpoints and static frontend SPA assets out of a single process.

* **Standard (Node.js)**
  ```bash
  npm run start
  ```
* **Accelerated (Bun)**
  ```bash
  npm run start:bun
  ```

---

## 📂 Core Monorepo Map

* `shared/src/index.ts` - Shared TS Interfaces.
* `backend/src/server.ts` - Express router handling cache, searches, previews, and systemd reloads.
* `backend/src/hf_helper.py` - Low-level Python script calling `scan_cache_dir` and `HfApi`.
* `frontend/src/app/home/` - Dashboard HTML layout and Angular controller logic.
* `frontend/src/app/api.service.ts` - API HttpClient streams.
* `getting-started.md` - Technical setup walkthrough guide.
* `skills/` - Architectural guidelines for monorepo styling, grids, and UI kit elements.
