import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  SystemMetrics, 
  ApiResponse,
  CachedModel,
  HFSearchModel,
  ModelInspectData,
  CurrentConfigData,
  PreviewConfigData,
  ApplyConfigResult
} from 'shared';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  getMetrics(): Observable<SystemMetrics> {
    return this.http.get<ApiResponse<SystemMetrics>>(`${this.baseUrl}/metrics`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch metrics');
        }
        return response.data;
      })
    );
  }

  getCache(): Observable<CachedModel[]> {
    return this.http.get<ApiResponse<CachedModel[]>>(`${this.baseUrl}/cache`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch cache');
        }
        return response.data;
      })
    );
  }

  searchModels(q: string): Observable<HFSearchModel[]> {
    return this.http.get<ApiResponse<HFSearchModel[]>>(`${this.baseUrl}/search?q=${encodeURIComponent(q)}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Search failed');
        }
        return response.data;
      })
    );
  }

  inspectModel(repoId: string): Observable<ModelInspectData> {
    return this.http.get<ApiResponse<ModelInspectData>>(`${this.baseUrl}/inspect?repo_id=${encodeURIComponent(repoId)}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Inspection failed');
        }
        return response.data;
      })
    );
  }

  getCurrentConfig(): Observable<CurrentConfigData> {
    return this.http.get<ApiResponse<CurrentConfigData>>(`${this.baseUrl}/current_config`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load current config');
        }
        return response.data;
      })
    );
  }

  getPreviewConfig(params: { repo_id?: string; quant?: string; file_name?: string; blob_path?: string; ctx?: string }): Observable<PreviewConfigData> {
    let url = `${this.baseUrl}/preview_config?`;
    if (params.repo_id) url += `repo_id=${encodeURIComponent(params.repo_id)}&`;
    if (params.quant) url += `quant=${encodeURIComponent(params.quant)}&`;
    if (params.file_name) url += `file_name=${encodeURIComponent(params.file_name)}&`;
    if (params.blob_path) url += `blob_path=${encodeURIComponent(params.blob_path)}&`;
    if (params.ctx) url += `ctx=${encodeURIComponent(params.ctx)}&`;

    return this.http.get<ApiResponse<PreviewConfigData>>(url).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load preview');
        }
        return response.data;
      })
    );
  }

  applyConfig(content: string): Observable<ApplyConfigResult> {
    return this.http.post<ApiResponse<ApplyConfigResult>>(`${this.baseUrl}/apply_config`, { content }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to apply configuration');
        }
        return response.data;
      })
    );
  }
}

