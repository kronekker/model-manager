import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ICellRendererParams, ValueFormatterParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="kbp-badge" [ngClass]="getBadgeClass()">{{ value }}</span>`,
})
export class StatusBadgeCellRenderer {
  value: string = '';
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
  getBadgeClass() {
    if (this.value === 'Active') return 'kbp-badge-done';
    if (this.value === 'Warning') return 'kbp-badge-inprogress';
    return 'kbp-badge-todo';
  }
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, AgGridAngular, NgxEchartsDirective],
  providers: [
    provideEchartsCore({ echarts: () => import('echarts') })
  ],
  templateUrl: './features.html',
  styleUrl: './features.css'
})
export class FeaturesComponent {
  themeClass = 'ag-theme-quartz-dark';

  chartOptions: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
      axisLabel: { color: '#9ca3af' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.08)' } },
      axisLabel: { color: '#9ca3af' }
    },
    series: [
      {
        name: 'CPU Load',
        type: 'line',
        smooth: true,
        data: [45, 52, 48, 82, 60, 30, 20],
        itemStyle: { color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ]
          }
        }
      }
    ]
  };

  rowData = signal([
    { id: 'srv-001', name: 'Database Primary', status: 'Active', load: 45, lastSeen: '2026-05-23T10:00:00Z' },
    { id: 'srv-002', name: 'Cache Layer', status: 'Warning', load: 82, lastSeen: '2026-05-23T10:15:00Z' },
    { id: 'srv-003', name: 'Worker Node A', status: 'Active', load: 20, lastSeen: '2026-05-23T10:30:00Z' },
    { id: 'srv-004', name: 'Worker Node B', status: 'Offline', load: 0, lastSeen: '2026-05-22T20:00:00Z' },
    { id: 'srv-005', name: 'Load Balancer', status: 'Active', load: 60, lastSeen: '2026-05-23T11:00:00Z' },
  ]);

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'Node ID', width: 120, filter: 'agTextColumnFilter' },
    { field: 'name', headerName: 'Node Name', flex: 1, filter: 'agTextColumnFilter' },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: StatusBadgeCellRenderer,
      width: 150,
      filter: true
    },
    {
      field: 'load',
      headerName: 'CPU Load (%)',
      width: 150,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: ValueFormatterParams) => params.value + '%',
      cellStyle: (params) => {
        if (params.value > 80) {
          return { color: 'var(--danger)', fontWeight: 'bold' };
        }
        return null;
      }
    },
    {
      field: 'lastSeen',
      headerName: 'Last Seen',
      width: 200,
      filter: 'agDateColumnFilter',
      valueFormatter: (params: ValueFormatterParams) => new Date(params.value).toLocaleString()
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
  };
}
