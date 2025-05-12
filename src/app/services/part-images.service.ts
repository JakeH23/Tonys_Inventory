import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PartImagesService {
  baseUrl = environment.baseUrl || "";
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  getRandomPartImages(): Observable<any> {
    return this._http.get(`${this.baseUrl}api/part-images`, { headers: this.headers });
  }

  uploadPartImage(file: string): Observable<any> {
    return this._http.post(`${this.baseUrl}api/part-images`, { data: file }, { headers: this.headers });
  }

  updatePartImage(file: string, catalogNumber: string): Observable<any> {
    return this._http.put(`${this.baseUrl}api/part-images/${catalogNumber}`, { data: file }, { headers: this.headers });
  }
}