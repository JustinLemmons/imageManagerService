import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(private http: HttpClient) {}

  private baseImage = 'http://localhost:8080';

  getHealth(): Observable<string> {
    return this.http.get(this.baseImage + '/health', {
      responseType: 'text',
    });
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.baseImage + '/upload', formData, {
      responseType: 'text',
    });
  }
}
