import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Item, 
  ItemCreateRequest, 
  ItemUpdateRequest, 
  SystemMetrics, 
  ApiResponse 
} from 'shared';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  getItems(): Observable<Item[]> {
    return this.http.get<ApiResponse<Item[]>>(`${this.baseUrl}/items`).pipe(
      map(response => response.data || [])
    );
  }

  createItem(request: ItemCreateRequest): Observable<Item> {
    return this.http.post<ApiResponse<Item>>(`${this.baseUrl}/items`, request).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to create item');
        }
        return response.data;
      })
    );
  }

  updateItem(id: string, request: ItemUpdateRequest): Observable<Item> {
    return this.http.put<ApiResponse<Item>>(`${this.baseUrl}/items/${id}`, request).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to update item');
        }
        return response.data;
      })
    );
  }

  deleteItem(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/items/${id}`).pipe(
      map(response => response.success)
    );
  }

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
}
