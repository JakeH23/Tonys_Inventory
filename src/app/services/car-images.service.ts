import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CarImage } from '../components/carousel/carousel.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CarImagesService {
  baseUrl = environment.baseUrl;
  headers = { 'Access-Control-Allow-Origin': '*'};

  constructor(private _http: HttpClient) { }

  getRandomCarImages(): Observable<CarImage[]> {
    return this._http.get<CarImage[]>(`${this.baseUrl}/api/CarImages`, { headers: this.headers });
  }

  uploadCarImage(data: FormData): Observable<CarImage> {
    return this._http.post<CarImage>(`${this.baseUrl}/api/CarImages`, data, { headers: this.headers });
  }

  updateCarImage(data: FormData, id: number): Observable<CarImage> {
    return this._http.put<CarImage>(`${this.baseUrl}/api/CarImages/${id}`, data, { headers: this.headers });
  }
}
