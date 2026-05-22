export interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCreateRequest {
  name: string;
  description: string;
}

export interface ItemUpdateRequest {
  name?: string;
  description?: string;
}

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
