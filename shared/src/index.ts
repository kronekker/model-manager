

export interface LogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface SystemMetrics {
  cpuUsage: number;         // percentage (0-100)
  memoryUsage: number;      // percentage (0-100)
  freeMemory: string;       // human readable (e.g. "8.5 GB")
  totalMemory: string;      // human readable (e.g. "16.0 GB")
  uptime: number;           // seconds
  requestCount: number;     // total api requests handled
  serverTime: string;       // ISO string
  port: number;             // active server port
  logs: LogMessage[];       // recent server logs
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CachedModel {
  repo_id: string;
  file_name: string;
  real_name: string;
  size: string;
  path: string;
  mmproj_path: string | null;
  last_modified: string;
}

export interface HFSearchModel {
  id: string;
  downloads: number;
  trending_score: number;
  params: number | null;
  active_params: number | null;
  context: string | number;
  is_cached: boolean;
  raw: any;
}

export interface ModelFileMeta {
  path: string;
  quant: string;
  size_gb: number | null;
  size: number | null;
  is_gguf: boolean;
  total_params: number | null;
  active_params: number | null;
  is_mmproj: boolean;
  is_split: boolean;
  is_cached: boolean;
  logs: string[];
}

export interface ModelInspectData {
  repo_id: string;
  quants: ModelFileMeta[];
  mmproj: ModelFileMeta[];
  other: ModelFileMeta[];
  error: string;
  cached_files: string[];
}

export interface CurrentConfigData {
  content: string;
  modelParams: string;
}

export interface PreviewConfigData {
  oldContent: string;
  newContent: string;
}

export interface ApplyConfigResult {
  status: string;
  message: string;
}

