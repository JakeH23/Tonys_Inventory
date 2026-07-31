import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { Car } from '../models/car.model';
import { InventoryQuery, PaginatedResponse } from '../models/inventory-query.model';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  baseUrl = environment.baseUrl || '/';
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  private buildUrl(path: string): string {
    const normalizedBase = this.baseUrl.replace(/\/?$/, '/');
    return `${normalizedBase}${path.replace(/^\/+/, '')}`;
  }

  addCar(data: Car): Observable<any> {
    return this._http.post<any>(this.buildUrl('api/cars'), data, { headers: this.headers });
  }

  updateCar(id: number, data: Car): Observable<any> {
    return this._http.put(this.buildUrl(`api/cars/${id}`), data, { headers: this.headers });
  }

  bulkUpdateEstimatedValues(
    updates: Array<{ Id: number; EstimatedCost: number; DateChanged?: string }>,
    skipIfSame = true
  ): Observable<any> {
    return this._http.post(
      this.buildUrl('api/cars/bulk-estimated-values'),
      { updates, skipIfSame },
      { headers: this.headers }
    );
  }

  getCarList(query?: InventoryQuery): Observable<PaginatedResponse<Car> | Car[]> {
    const params = this.buildQueryParams(query);
    return this._http.get<PaginatedResponse<Car> | Car[]>(this.buildUrl('api/cars'), { headers: this.headers, params });
  }

  deleteCar(id: number): Observable<any> {
   return this._http.delete(this.buildUrl(`api/cars/${id}`), { headers: this.headers });
  }

  getCarById(id: number): Observable<Car> {
    return this._http.get<Car>(this.buildUrl(`api/cars/${id}`), { headers: this.headers });
  }

  private buildQueryParams(query?: InventoryQuery) {
    const params: Record<string, string> = {};
    if (!query) {
      return params;
    }
    if (query.page !== undefined) params['page'] = String(query.page);
    if (query.pageSize !== undefined) params['pageSize'] = String(query.pageSize);
    if (query.sortBy) params['sortBy'] = query.sortBy;
    if (query.sortDirection) params['sortDirection'] = query.sortDirection;
    if (query.search) params['search'] = query.search;
    if (query.filter) params['filter'] = query.filter;
    return params;
  }
}