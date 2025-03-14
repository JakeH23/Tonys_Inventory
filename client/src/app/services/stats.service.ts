import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  baseUrl = environment.baseUrl;
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  getAllStatistics(): Observable<any> {
    return this._http.get(`${this.baseUrl}/api/statistics`, { headers: this.headers });
  }
}
