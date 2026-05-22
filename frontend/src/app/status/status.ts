import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { SystemMetrics } from 'shared';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class StatusComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);

  metrics = signal<SystemMetrics | null>(null);
  serverConnected = signal<boolean>(false);
  
  private metricsIntervalId: any;

  ngOnInit() {
    this.loadMetrics();
    
    // Poll telemetry data every 2 seconds
    this.metricsIntervalId = setInterval(() => {
      this.loadMetrics();
    }, 2000);
  }

  ngOnDestroy() {
    if (this.metricsIntervalId) {
      clearInterval(this.metricsIntervalId);
    }
  }

  loadMetrics() {
    this.apiService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.serverConnected.set(true);
      },
      error: (err) => {
        console.error('Failed to load metrics:', err);
        this.serverConnected.set(false);
        this.metrics.set(null);
      }
    });
  }

  getLogLevelClass(level: string) {
    switch (level) {
      case 'error': return 'log-error';
      case 'warn': return 'log-warn';
      default: return 'log-info';
    }
  }
}
