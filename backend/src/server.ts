import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { exec, execFile } from 'child_process';
import util from 'util';
import {
  LogMessage,
  SystemMetrics,
  ApiResponse,
  CachedModel,
  HFSearchModel,
  ModelInspectData,
  CurrentConfigData,
  PreviewConfigData,
  ApplyConfigResult
} from 'shared';

const execPromise = util.promisify(exec);
const execFilePromise = util.promisify(execFile);

const app = express();
const PORT = process.env.PORT || 3000;
const SCRIPT_PATH = '/home/danielbellard/.local/bin/start-llama-cpp.sh';

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

// Helper to run python script
async function runHfHelper(action: string, arg?: string): Promise<any> {
  const scriptPath = path.resolve(__dirname, 'hf_helper.py');
  const args = [scriptPath, action];
  if (arg !== undefined) {
    args.push(arg);
  }
  log('info', `Executing python3 ${args.join(' ')}`);
  try {
    const { stdout } = await execFilePromise('python3', args, { maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch (err: any) {
    log('error', `Failed running hf_helper: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// --- API ROUTES ---

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

// GET /api/cache
app.get('/api/cache', async (req: Request, res: Response<ApiResponse<CachedModel[]>>) => {
  const result = await runHfHelper('cache');
  if (result.success) {
    res.json({ success: true, data: result.data });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// GET /api/search
app.get('/api/search', async (req: Request, res: Response<ApiResponse<HFSearchModel[]>>) => {
  const q = req.query.q as string;
  if (!q || q.length < 3) {
    return res.status(400).json({ success: false, error: 'Query string "q" is required and must be at least 3 characters' });
  }
  const result = await runHfHelper('search', q);
  if (result.success) {
    res.json({ success: true, data: result.data });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// GET /api/inspect
app.get('/api/inspect', async (req: Request, res: Response<ApiResponse<ModelInspectData>>) => {
  const repoId = req.query.repo_id as string;
  if (!repoId) {
    return res.status(400).json({ success: false, error: 'Query parameter "repo_id" is required' });
  }
  const result = await runHfHelper('inspect', repoId);
  if (result.success) {
    res.json({ success: true, data: result.data });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// GET /api/current_config
app.get('/api/current_config', (req: Request, res: Response<ApiResponse<CurrentConfigData>>) => {
  try {
    if (!fs.existsSync(SCRIPT_PATH)) {
      return res.status(404).json({ success: false, error: `Startup script not found at ${SCRIPT_PATH}` });
    }
    const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');

    const nameMatch = content.match(/^MODEL_NAME="(.*?)"/m);
    const quantMatch = content.match(/^MODEL_QUANT="(.*?)"/m);
    const ctxMatch = content.match(/^MODEL_CTX="(.*?)"/m);

    const modelName = nameMatch ? nameMatch[1] : 'N/A';
    const modelQuant = quantMatch ? quantMatch[1] : 'N/A';
    const modelCtx = ctxMatch ? ctxMatch[1] : 'N/A';

    const modelParams = `MODEL_NAME="${modelName}"\nMODEL_QUANT="${modelQuant}"\nMODEL_CTX="${modelCtx}"`;

    res.json({
      success: true,
      data: { content, modelParams }
    });
  } catch (err: any) {
    log('error', `Failed reading current config: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/preview_config
app.get('/api/preview_config', (req: Request, res: Response<ApiResponse<PreviewConfigData>>) => {
  const { repo_id, quant, file_name, blob_path, ctx } = req.query as {
    repo_id?: string;
    quant?: string;
    file_name?: string;
    blob_path?: string;
    ctx?: string;
  };

  try {
    if (!fs.existsSync(SCRIPT_PATH)) {
      return res.status(404).json({ success: false, error: `Startup script not found at ${SCRIPT_PATH}` });
    }
    const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
    let newContent = content;

    const actualQuant = quant || file_name;

    if (repo_id) {
      newContent = newContent.replace(/^MODEL_NAME=".*?"/m, `MODEL_NAME="${repo_id}"`);
    }
    if (actualQuant !== undefined) {
      newContent = newContent.replace(/^MODEL_QUANT=".*?"/m, `MODEL_QUANT="${actualQuant}"`);
    }
    if (ctx) {
      newContent = newContent.replace(/^MODEL_CTX=".*?"/m, `MODEL_CTX="${ctx}"`);
    }
    if (blob_path) {
      newContent = newContent.replace(/^MODEL_NAME=".*?"/m, `MODEL_NAME="${blob_path}"`);
      newContent = newContent.replace(/^MODEL_QUANT=".*?"/m, `MODEL_QUANT=""`);
    }

    res.json({
      success: true,
      data: { oldContent: content, newContent }
    });
  } catch (err: any) {
    log('error', `Failed generating preview: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/apply_config
app.post('/api/apply_config', async (req: Request, res: Response<ApiResponse<ApplyConfigResult>>) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, error: 'Configuration content is required' });
  }

  try {
    log('info', `Updating startup script at ${SCRIPT_PATH}...`);
    fs.writeFileSync(SCRIPT_PATH, content, 'utf-8');

    log('info', 'Executing systemctl --user daemon-reload...');
    await execPromise('systemctl --user daemon-reload');

    log('info', 'Executing systemctl --user restart kron-llama-server.service...');
    await execPromise('systemctl --user restart kron-llama-server.service');

    log('info', 'Service restarted successfully!');
    res.json({
      success: true,
      data: { status: 'success', message: 'Script updated and service restarted' }
    });
  } catch (err: any) {
    log('error', `Failed applying config: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
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

