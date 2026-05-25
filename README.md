# Kronekker TypeScript Boilerplate

Welcome to the Kronekker TypeScript Boilerplate! This project is designed as the ultimate starting point for rapidly building and deploying modern, full-stack web applications. 

Our goal is to eliminate setup friction by providing a **unified frontend and backend architecture** that shares everything from TypeScript definitions to automated build commands, all while enforcing a gorgeous, standardized design system right out of the box.

---

## 🎯 Project Goals & Architecture

This boilerplate utilizes an npm workspace (monorepo) structure containing three integrated layers:

1. **Frontend**: An Angular Single Page Application (SPA) using modern Standalone Components and Signals.
2. **Backend**: A Node.js Express API server written entirely in TypeScript.
3. **Shared**: A dedicated package for TypeScript models and interfaces shared directly between the frontend and backend.

By unifying these environments, a developer can define an interface in the `shared` package (e.g., `ServerMetrics`), implement the API endpoint returning that type in the `backend`, and safely consume it in the `frontend`—knowing that any breaking change will instantly trigger compilation errors across the entire stack.

This shared boundary establishes a strict, verifiable contract across the stack. For developers, it eliminates integration guesswork by surfacing payload mismatches as compile-time errors rather than runtime bugs. For AI coding agents, these centralized definitions provide reliable, cross-stack context, allowing them to confidently orchestrate and verify full-stack features automatically. For smaller projects, this overhead might seem unnecessary, but for larger projects with a team of developers, it can save a lot of time and effort, and makes inspecting code and seeing type definitions easier through intelligent IDEs. Furthermore, the use of an npm workspace allows for seamless management of dependencies across the entire stack.    

---

## ✨ Standardized Features out of the Box

Instead of building from absolute zero, this boilerplate comes pre-configured with industry-standard tooling and a premium design aesthetic.

### 1. The `kbp-` Design System
To ensure strict CSS isolation and visual consistency, this boilerplate implements a global UI kit utilizing the **Kronekker Boilerplate Prefix (`kbp-`)**. 
- All fundamental components (buttons, input fields, badges, cards, and banners) are universally styled using `kbp-*` classes. 
- You can preview the entire design system by navigating to the **UI Kit (`/style`)** route in the running application.

### 2. Complex Data Grids (AG Grid)
We have fully integrated and themed **AG Grid** (`ag-grid-community`, `ag-grid-angular`) using a modern dark-mode quartz theme. The boilerplate includes a working example of a complex grid featuring custom Angular cell renderers, value formatters, and dynamic CSS styling logic based on cell values.

### 3. Interactive Charting (Apache ECharts)
For robust data visualization, **ngx-echarts** is pre-configured. A working example of a smooth, responsive, gradient-filled area chart is provided on the Features page, specifically styled to match the dark glassmorphic design system.

### 4. Live Server Telemetry Dashboard
A pre-built Status Dashboard is included which polls the backend API for real-time telemetry (CPU usage, Memory load, active HTTP requests, and server uptime) using Angular Signals and RxJS intervals, displaying the data through custom CSS gauges and a simulated terminal stream.

### 5. Runtime Branding Configuration
App titles, subtitles, and logo image usage can be toggled without recompiling the application by simply editing the `public/config.json` file. 

---

## 🚀 Development & Build Commands

See [getting-started.md](./getting-started.md). 


