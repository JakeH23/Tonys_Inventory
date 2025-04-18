import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CarImagesService {
  baseUrl = environment.baseUrl || "";
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  getRandomCarImages(): Observable<any> {
    return this._http.get(`${this.baseUrl}api/car-images`, { headers: this.headers });
  }

  uploadCarImage(file: string): Observable<any> {
    return this._http.post(`${this.baseUrl}api/car-images`, { data: file }, { headers: this.headers });
  }

  updateCarImage(file: string, id: number): Observable<any> {
    return this._http.put(`${this.baseUrl}api/car-images/${id}`, { data: file }, { headers: this.headers });
  }
}