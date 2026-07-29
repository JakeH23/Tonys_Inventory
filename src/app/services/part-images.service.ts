import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PartImagesService {
  baseUrl = environment.baseUrl || '/';
  headers = { 'Content-Type': 'application/json' };

  constructor(private _http: HttpClient) { }

  private buildUrl(path: string): string {
    const normalizedBase = this.baseUrl.replace(/\/?$/, '/');
    return `${normalizedBase}${path.replace(/^\/+/, '')}`;
  }

  getPartImages(): Observable<any> {
    return this._http.get(this.buildUrl('api/part-images'), { headers: this.headers });
  }

  uploadPartImage(data: any): Observable<any> {
    return this._http.post(this.buildUrl('api/part-images'), data, { headers: this.headers });
  }

  updatePartImage(file: string, catalogNumber: string, imageCount: number): Observable<any> {
    return this._http.put(this.buildUrl(`api/part-images/${catalogNumber}/${imageCount}`), { data: file }, { headers: this.headers });
  }
}