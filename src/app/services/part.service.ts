import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { Part } from '../models/part.model';
import { InventoryQuery, PaginatedResponse } from '../models/inventory-query.model';

@Injectable({
  providedIn: 'root',
})
export class PartService {
  baseUrl = environment.baseUrl || '/';
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  private buildUrl(path: string): string {
    const normalizedBase = this.baseUrl.replace(/\/?$/, '/');
    return `${normalizedBase}${path.replace(/^\/+/, '')}`;
  }

  addPart(data: Part): Observable<any> {
    return this._http.post<any>(this.buildUrl('api/parts'), data, { headers: this.headers });
  }

  updatePart(id: number, data: Part): Observable<any> {
    return this._http.put(this.buildUrl(`api/parts/${id}`), data, { headers: this.headers });
  }

  getPartList(query?: InventoryQuery): Observable<PaginatedResponse<Part>> {
    const params = this.buildQueryParams(query);
    return this._http.get<PaginatedResponse<Part>>(this.buildUrl('api/parts'), { headers: this.headers, params });
  }

  deletePart(id: number): Observable<any> {
   return this._http.delete(this.buildUrl(`api/parts/${id}`), { headers: this.headers });
  }

  getPartById(id: number): Observable<Part> {
    return this._http.get<Part>(this.buildUrl(`api/parts/${id}`), { headers: this.headers });
  }

  private buildQueryParams(query?: InventoryQuery) {
    const params: Record<string, string> = {};
    if (!query) {
      return params;
    }
    if (query.page) params['page'] = String(query.page);
    if (query.pageSize) params['pageSize'] = String(query.pageSize);
    if (query.sortBy) params['sortBy'] = query.sortBy;
    if (query.sortDirection) params['sortDirection'] = query.sortDirection;
    if (query.search) params['search'] = query.search;
    if (query.filter) params['filter'] = query.filter;
    return params;
  }
}