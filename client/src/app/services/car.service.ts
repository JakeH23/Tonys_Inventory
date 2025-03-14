import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  baseUrl = environment.baseUrl;
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  addCar(data: any): Observable<any> {
    return this._http.post<any>(`${this.baseUrl}/api/cars`, data, { headers: this.headers });
  }

  updateCar(id: number, data: any): Observable<any> {
    return this._http.put(`${this.baseUrl}/api/cars/${id}`, data, { headers: this.headers });
  }

  getCarList(): Observable<any> {
    return this._http.get(`${this.baseUrl}/api/cars`, { headers: this.headers });
  }

  deleteCar(id: number): Observable<any> {
    return this._http.delete(`${this.baseUrl}/api/cars/${id}`, { headers: this.headers });
  }

  getCarById(id: number): Observable<any> {
    return this._http.get(`${this.baseUrl}/api/cars/${id}`, { headers: this.headers });
  }
}