import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import {
  LogMessage,
  SystemMetrics,
  ApiResponse
} from 'shared';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON payloads
app.use(express.json());


let requestCount = 0;
const logs: LogMessage[] = [];

// Helper Logger
function log(level: 'info' | 'warn' | 'error', message: string) {
  const timestamp = new Date().toISOString();
  const id = Math.random().toString(36).substring(2, 9);
  const logMsg: LogMessage = { id, timestamp, level, message };

  logs.unshift(logMsg);
  if (logs.length > 50) {
    logs.pop();
  }

  const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
  console.log(`${color}[${timestamp}] [${level.toUpperCase()}] ${message}\x1b[0m`);
}

// Initial server log
log('info', `Server initialized. Mode: ${process.env.NODE_ENV || 'development'}`);

// Middleware to track metrics
app.use((req: Request, res: Response, next: NextFunction) => {
  requestCount++;
  if (!req.path.startsWith('/api/metrics')) {
    log('info', `HTTP ${req.method} ${req.path}`);
  }
  next();
});

// --- API ROUTES ---

// GET /api/metrics
// This endpoint exists to provide sample telemetry data (hence the 'mockCpu' below). 
// It demonstrates backend visibility and live data streaming to the Status component on the frontend.
app.get('/api/metrics', (req: Request, res: Response<ApiResponse<SystemMetrics>>) => {
  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;

  const memoryUsage = Math.round((usedMemBytes / totalMemBytes) * 100);

  // CPU Usage mock fluctuation
  const seconds = new Date().getSeconds();
  const mockCpu = Math.round(15 + Math.sin(seconds / 5) * 10 + Math.random() * 5);

  const formatGb = (bytes: number) => `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;

  const metrics: SystemMetrics = {
    cpuUsage: Math.min(100, Math.max(0, mockCpu)),
    memoryUsage,
    freeMemory: formatGb(freeMemBytes),
    totalMemory: formatGb(totalMemBytes),
    uptime: Math.round(process.uptime()),
    requestCount,
    serverTime: new Date().toISOString(),
    port: Number(PORT),
    logs
  };

  res.json({ success: true, data: metrics });
});

// --- STATIC FRONTEND SERVING (PRODUCTION ONLY) ---

const frontendDistPath = path.resolve(__dirname, '../../frontend/dist/frontend/browser');

app.use(express.static(frontendDistPath));

app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }

  const indexHtmlFile = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexHtmlFile, (err: any) => {
    if (err) {
      res.status(404).send('Web UI assets not compiled yet. Please run in development mode or build frontend.');
    }
  });
});

// Start listening
app.listen(PORT, () => {
  log('info', `Server running on http://localhost:${PORT}`);
});
