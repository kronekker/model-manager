import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { ApiService } from '../api.service';
import { 
  CachedModel, 
  HFSearchModel, 
  ModelInspectData, 
  ModelFileMeta 
} from 'shared';

ModuleRegistry.registerModules([AllCommunityModule]);

// --- CUSTOM CELL RENDERERS ---

@Component({
  selector: 'app-cache-file-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span style="display: inline-flex; align-items: center; gap: 8px;">
      <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ value }}</span>
      <span *ngIf="params?.data?.mmproj_path" class="kbp-badge kbp-badge-inprogress" style="font-size: 9px; padding: 1px 4px; border-radius: 4px; line-height: 1.2;">MM</span>
    </span>
  `
})
export class CacheFileCellRenderer {
  value: string = '';
  params: any;
  agInit(params: any): void {
    this.value = params.value;
    this.params = params;
  }
  refresh(params: any): boolean {
    this.value = params.value;
    this.params = params;
    return true;
  }
}

@Component({
  selector: 'app-cached-badge-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="value" class="kbp-badge kbp-badge-done" style="font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px;">✓ Local</span>
  `
})
export class CachedBadgeCellRenderer {
  value: boolean = false;
  agInit(params: any): void {
    this.value = params.value;
  }
  refresh(params: any): boolean {
    this.value = params.value;
    return true;
  }
}

@Component({
  selector: 'app-json-action-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="kbp-btn kbp-btn-secondary" style="font-size: 9px; padding: 2px 6px; height: auto; min-height: auto; border-radius: 4px; line-height: 1;">JSON</button>
  `
})
export class JsonActionCellRenderer {
  agInit(params: any): void {}
  refresh(params: any): boolean { return true; }
}

// --- MAIN HOME COMPONENT ---

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);

  themeClass = 'ag-theme-quartz-dark';

  // Signals
  cacheData = signal<CachedModel[]>([]);
  searchQuery = signal<string>('');
  searchData = signal<HFSearchModel[]>([]);
  isSearching = signal<boolean>(false);

  selectedModel = signal<HFSearchModel | null>(null);
  inspectData = signal<ModelInspectData | null>(null);
  isInspecting = signal<boolean>(false);
  selectedFile = signal<ModelFileMeta | null>(null);

  currentParams = signal<string>('Loading...');
  currentContent = signal<string>('');
  previewContent = signal<string>('');

  showModal = signal<boolean>(false);
  modalTitle = signal<string>('');
  modalJson = signal<string>('');

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Column Definitions
  cacheColDefs: ColDef[] = [
    { field: 'repo_id', headerName: 'Repo', flex: 3 },
    { 
      field: 'file_name', 
      headerName: 'File', 
      flex: 3, 
      cellRenderer: CacheFileCellRenderer 
    },
    { field: 'size', headerName: 'Size', flex: 1.5, filter: 'agTextColumnFilter' }
  ];

  searchColDefs: ColDef[] = [
    { field: 'id', headerName: 'Model ID', flex: 3.5, filter: 'agTextColumnFilter' },
    { 
      field: 'params', 
      headerName: 'Total (B)', 
      width: 95,
      valueFormatter: params => params.value ? params.value + 'B' : 'N/A' 
    },
    { 
      field: 'active_params', 
      headerName: 'Active (B)', 
      width: 105,
      valueFormatter: params => params.value ? params.value + 'B' : 'N/A' 
    },
    { field: 'context', headerName: 'Ctx', width: 90 },
    { 
      field: 'downloads', 
      headerName: 'DLs', 
      width: 100, 
      filter: 'agNumberColumnFilter',
      valueFormatter: params => params.value ? params.value.toLocaleString() : '0'
    },
    { 
      field: 'trending_score', 
      headerName: 'Trend', 
      width: 80, 
      filter: 'agNumberColumnFilter' 
    },
    { 
      field: 'is_cached', 
      headerName: 'Local', 
      width: 95, 
      cellRenderer: CachedBadgeCellRenderer 
    },
    { 
      field: 'raw', 
      headerName: 'Raw', 
      width: 75, 
      cellRenderer: JsonActionCellRenderer 
    }
  ];

  inspectColDefs: ColDef[] = [
    { field: 'path', headerName: 'File Path', flex: 4, filter: 'agTextColumnFilter' },
    { field: 'quant', headerName: 'Quant', flex: 1.5 },
    { 
      field: 'size_gb', 
      headerName: 'GB', 
      flex: 1.5,
      valueFormatter: params => params.value ? params.value.toFixed(2) + ' GB' : 'N/A'
    },
    { 
      field: 'active_params', 
      headerName: 'Active (B)', 
      flex: 1.5,
      valueFormatter: params => params.value ? params.value + 'B' : 'N/A'
    },
    { 
      field: 'is_cached', 
      headerName: 'Local Cache', 
      flex: 1.5, 
      cellRenderer: CachedBadgeCellRenderer 
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  ngOnInit(): void {
    this.loadCache();
    this.loadCurrentConfig();
  }

  loadCache() {
    this.apiService.getCache().subscribe({
      next: (data) => this.cacheData.set(data),
      error: (err) => this.setBannerError(`Failed to load local cache: ${err.message}`)
    });
  }

  loadCurrentConfig() {
    this.apiService.getCurrentConfig().subscribe({
      next: (data) => {
        this.currentContent.set(data.content);
        this.currentParams.set(data.modelParams);
      },
      error: (err) => this.setBannerError(`Failed to fetch runner config: ${err.message}`)
    });
  }

  onSearch() {
    const q = this.searchQuery().trim();
    if (!q || q.length < 3) {
      this.setBannerError('Search query must be at least 3 characters long.');
      return;
    }

    this.isSearching.set(true);
    this.searchData.set([]);
    this.apiService.searchModels(q).subscribe({
      next: (data) => {
        this.searchData.set(data);
        this.isSearching.set(false);
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.setBannerError(`Hugging Face search request failed: ${err.message}`);
        this.isSearching.set(false);
      }
    });
  }

  onCacheRowClicked(event: any) {
    if (!event.data) return;
    const cached = event.data as CachedModel;

    // Reset inspection view for a clean local focus
    this.selectedModel.set(null);
    this.inspectData.set(null);
    this.isInspecting.set(false);
    this.selectedFile.set(null);

    this.apiService.getPreviewConfig({ blob_path: cached.path }).subscribe({
      next: (preview) => {
        this.previewContent.set(preview.newContent);
        this.setBannerSuccess(`Loaded config preview for local cached file: ${cached.file_name}`);
      },
      error: (err) => this.setBannerError(`Failed to preview local model config: ${err.message}`)
    });
  }

  onSearchCellClicked(event: any) {
    if (!event.data) return;
    const model = event.data as HFSearchModel;

    if (event.colDef && event.colDef.field === 'raw') {
      this.viewRawMetadata(model);
    } else {
      this.inspectModel(model);
    }
  }

  viewRawMetadata(model: HFSearchModel) {
    this.modalTitle.set(`Model Metadata: ${model.id}`);
    this.modalJson.set(JSON.stringify(model.raw, null, 2));
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  inspectModel(model: HFSearchModel) {
    this.selectedModel.set(model);
    this.isInspecting.set(true);
    this.inspectData.set(null);
    this.selectedFile.set(null);

    this.apiService.inspectModel(model.id).subscribe({
      next: (data) => {
        // Pre-fill computed attributes for layout mapping
        const quants = data.quants || [];
        this.inspectData.set({
          ...data,
          quants
        });
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.setBannerError(`Failed to inspect repository ${model.id}: ${err.message}`);
        this.isInspecting.set(false);
      }
    });
  }

  onInspectRowClicked(event: any) {
    if (!event.data) return;
    const file = event.data as ModelFileMeta;
    const model = this.selectedModel();
    if (!model || !file.quant) return;

    this.selectedFile.set(file);

    this.apiService.getPreviewConfig({
      repo_id: model.id,
      quant: file.quant,
      ctx: String(model.context !== 'N/A' ? model.context : '2048')
    }).subscribe({
      next: (preview) => {
        this.previewContent.set(preview.newContent);
        this.setBannerSuccess(`Previewing new configuration for ${model.id} [${file.quant}]`);
      },
      error: (err) => this.setBannerError(`Failed to generate preview for ${file.quant}: ${err.message}`)
    });
  }

  applyConfig() {
    const preview = this.previewContent();
    if (!preview) return;

    if (!confirm('Warning: This will overwrite your LLM runner script and restart the active systemd service. Proceed?')) {
      return;
    }

    this.apiService.applyConfig(preview).subscribe({
      next: (res) => {
        this.setBannerSuccess(`Successfully applied configuration! ${res.message}`);
        this.previewContent.set('');
        this.loadCurrentConfig();
      },
      error: (err) => this.setBannerError(`Failed to apply configuration and restart service: ${err.message}`)
    });
  }

  // Banner Helpers
  setBannerSuccess(msg: string) {
    this.successMessage.set(msg);
    this.errorMessage.set(null);
    setTimeout(() => this.successMessage.set(null), 8000);
  }

  setBannerError(msg: string) {
    this.errorMessage.set(msg);
    this.successMessage.set(null);
    setTimeout(() => this.errorMessage.set(null), 8000);
  }
}
