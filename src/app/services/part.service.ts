import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PartService {
  baseUrl = environment.baseUrl || "";
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  addPart(data: any): Observable<any> {
    return this._http.post<any>(`${this.baseUrl}api/parts`, data, { headers: this.headers });
  }

  updatePart(id: number, data: any): Observable<any> {
    return this._http.put(`${this.baseUrl}api/parts/${id}`, data, { headers: this.headers });
  }

  getPartList(): Observable<any> {
    return this._http.get(`${this.baseUrl}api/parts`, { headers: this.headers });
  }

  deletePart(id: number): Observable<any> {
   return this._http.delete(`${this.baseUrl}api/parts/${id}`, { headers: this.headers });
  }

  getPartById(id: number): Observable<any> {
    return this._http.get(`${this.baseUrl}api/parts/${id}`, { headers: this.headers });
  }
}