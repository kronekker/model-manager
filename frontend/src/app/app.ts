import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from './api.service';
import { SystemMetrics } from 'shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  
  metrics = signal<SystemMetrics | null>(null);
  serverConnected = signal<boolean>(false);
  
  private metricsIntervalId: any;

  ngOnInit() {
    this.loadMetrics();
    
    // Poll metrics every 5 seconds to keep the header connection status alive
    this.metricsIntervalId = setInterval(() => {
      this.loadMetrics();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.metricsIntervalId) {
      clearInterval(this.metricsIntervalId);
    }
  }

  loadMetrics() {
    this.apiService.getMetrics().subscribe({
      next: (metricsData) => {
        this.metrics.set(metricsData);
        this.serverConnected.set(true);
      },
      error: (err) => {
        console.error('Header telemetry connection check failed:', err);
        this.serverConnected.set(false);
      }
    });
  }
}

