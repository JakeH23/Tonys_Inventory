import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  baseUrl = environment.baseUrl || '/';
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  private buildUrl(path: string): string {
    const normalizedBase = this.baseUrl.replace(/\/?$/, '/');
    return `${normalizedBase}${path.replace(/^\/+/, '')}`;
  }

  getAllStatistics(): Observable<any> {
    return this._http.get(this.buildUrl('api/statistics'), { headers: this.headers });
  }

  getCarCount(): Observable<any> {
    return this._http.get(this.buildUrl('api/statistics/count'), { headers: this.headers });
  }

  getDashboardReport(): Observable<any> {
    return this._http.get(this.buildUrl('api/statistics/report'), { headers: this.headers });
  }

  exportInventory(): Observable<Blob> {
    return this._http.get(this.buildUrl('api/statistics/export'), { headers: this.headers, responseType: 'blob' });
  }
}
