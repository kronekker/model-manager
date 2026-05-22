export type TaskStatus = 'todo' | 'inprogress' | 'done';
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
}
export interface TaskCreateRequest {
    title: string;
    description: string;
    status?: TaskStatus;
}
export interface TaskUpdateRequest {
    title?: string;
    description?: string;
    status?: TaskStatus;
}
export interface LogMessage {
    id: string;
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
}
export interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: number;
    freeMemory: string;
    totalMemory: string;
    uptime: number;
    requestCount: number;
    serverTime: string;
    logs: LogMessage[];
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
