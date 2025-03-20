import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CarImage } from '../components/carousel/carousel.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CarImagesService {
  baseUrl = environment.baseUrl || "";
  headers = { 'Content-Type': 'application/json'};

  constructor(private _http: HttpClient) { }

  getRandomCarImages(): Observable<any> {
    //return this._http.get(`car-images`, { headers: this.headers });
    return this._http.get(`${this.baseUrl}car-images`, { headers: this.headers });
  }

  uploadCarImage(data: FormData): Observable<CarImage> {
    //return this._http.post<CarImage>(`car-images/car`, data, { headers: this.headers });
    return this._http.post<CarImage>(`${this.baseUrl}car-images/car`, data, { headers: this.headers });
  }

  updateCarImage(data: FormData, id: number): Observable<CarImage> {
    //return this._http.put<CarImage>(`car-images/car/${id}`, data, { headers: this.headers });
    return this._http.put<CarImage>(`${this.baseUrl}car-images/car/${id}`, data, { headers: this.headers });
  }
}
