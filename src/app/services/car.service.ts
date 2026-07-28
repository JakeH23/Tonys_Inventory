import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  baseUrl = environment.baseUrl || "";
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  addCar(data: Car): Observable<any> {
    return this._http.post<any>(`${this.baseUrl}api/cars`, data, { headers: this.headers });
  }

  updateCar(id: number, data: Car): Observable<any> {
    return this._http.put(`${this.baseUrl}api/cars/${id}`, data, { headers: this.headers });
  }

  getCarList(): Observable<Car[]> {
    return this._http.get<Car[]>(`${this.baseUrl}api/cars`, { headers: this.headers });
  }

  deleteCar(id: number): Observable<any> {
   return this._http.delete(`${this.baseUrl}api/cars/${id}`, { headers: this.headers });
  }

  getCarById(id: number): Observable<Car> {
    return this._http.get<Car>(`${this.baseUrl}api/cars/${id}`, { headers: this.headers });
  }
}