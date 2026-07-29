import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CarImagesService {
  baseUrl = environment.baseUrl || '/';
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  private buildUrl(path: string): string {
    const normalizedBase = this.baseUrl.replace(/\/?$/, '/');
    return `${normalizedBase}${path.replace(/^\/+/, '')}`;
  }

  getCarImages(): Observable<any> {
    return this._http.get(this.buildUrl('api/car-images'), { headers: this.headers });
  }

  getRandomCarImages(): Observable<any> {
    return this._http.get(this.buildUrl('api/car-images/random'), { headers: this.headers });
  }

  uploadCarImage(data: any): Observable<any> {
    return this._http.post(this.buildUrl('api/car-images'), data, { headers: this.headers });
  }

  updateCarImage(file: string, id: number): Observable<any> {
    return this._http.put(this.buildUrl(`api/car-images/${id}`), { data: file }, { headers: this.headers });
  }
}