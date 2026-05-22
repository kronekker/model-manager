import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { 
  Item, 
  ItemCreateRequest, 
  ItemUpdateRequest, 
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

// In-Memory Database (Boilerplate Sample Data)
let items: Item[] = [
  {
    id: '1',
    name: 'Shared Workspace Package',
    description: 'Shared TypeScript model definitions located under the shared/ directory.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: '2',
    name: 'Express API Server',
    description: 'Node.js Express application in backend/ hosting REST endpoints and serving static files.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    name: 'Angular SPA Client',
    description: 'Single Page Application in frontend/ built with standalone components and Signals routing.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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

// GET /api/items
app.get('/api/items', (req: Request, res: Response<ApiResponse<Item[]>>) => {
  res.json({ success: true, data: items });
});

// POST /api/items
app.post('/api/items', (req: Request, res: Response<ApiResponse<Item>>) => {
  const body = req.body as ItemCreateRequest;
  
  if (!body.name || !body.description) {
    log('warn', 'Failed item creation: Missing name or description.');
    return res.status(400).json({ 
      success: false, 
      error: 'Name and description are required.' 
    });
  }

  const newItem: Item = {
    id: Math.random().toString(36).substring(2, 9),
    name: body.name,
    description: body.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  items.push(newItem);
  log('info', `Item created: "${newItem.name}" (ID: ${newItem.id})`);
  res.status(201).json({ success: true, data: newItem });
});

// PUT /api/items/:id
app.put('/api/items/:id', (req: Request, res: Response<ApiResponse<Item>>) => {
  const { id } = req.params;
  const body = req.body as ItemUpdateRequest;
  const itemIndex = items.findIndex(i => i.id === id);

  if (itemIndex === -1) {
    log('warn', `Failed item update: Item with ID ${id} not found.`);
    return res.status(404).json({ success: false, error: 'Item not found.' });
  }

  const updatedItem: Item = {
    ...items[itemIndex],
    ...body,
    updatedAt: new Date().toISOString()
  };

  items[itemIndex] = updatedItem;
  log('info', `Item updated: "${updatedItem.name}" (ID: ${id})`);
  res.json({ success: true, data: updatedItem });
});

// DELETE /api/items/:id
app.delete('/api/items/:id', (req: Request, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;
  const itemIndex = items.findIndex(i => i.id === id);

  if (itemIndex === -1) {
    log('warn', `Failed item deletion: Item with ID ${id} not found.`);
    return res.status(404).json({ success: false, error: 'Item not found.' });
  }

  const deletedItem = items.splice(itemIndex, 1)[0];
  log('info', `Item deleted: "${deletedItem.name}" (ID: ${id})`);
  res.json({ success: true });
});

// GET /api/metrics
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
