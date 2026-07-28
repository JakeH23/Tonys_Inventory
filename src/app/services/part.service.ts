import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { Part } from '../models/part.model';

@Injectable({
  providedIn: 'root',
})
export class PartService {
  baseUrl = environment.baseUrl || "";
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  addPart(data: Part): Observable<any> {
    return this._http.post<any>(`${this.baseUrl}api/parts`, data, { headers: this.headers });
  }

  updatePart(id: number, data: Part): Observable<any> {
    return this._http.put(`${this.baseUrl}api/parts/${id}`, data, { headers: this.headers });
  }

  getPartList(): Observable<Part[]> {
    return this._http.get<Part[]>(`${this.baseUrl}api/parts`, { headers: this.headers });
  }

  deletePart(id: number): Observable<any> {
   return this._http.delete(`${this.baseUrl}api/parts/${id}`, { headers: this.headers });
  }

  getPartById(id: number): Observable<Part> {
    return this._http.get<Part>(`${this.baseUrl}api/parts/${id}`, { headers: this.headers });
  }
}