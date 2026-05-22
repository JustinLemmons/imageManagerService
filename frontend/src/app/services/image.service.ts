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

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.baseImage + '/upload', formData, {
      responseType: 'text',
    });
  }

  loadAllImages(): Observable<string[]> {
    return this.http.get<string[]>(this.baseImage + '/images');
  }

  getImage(id: string): Observable<Blob> {
    return this.http.get(`${this.baseImage}/images/${id}`, {
      responseType: 'blob',
    });
  }

  removeImage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseImage}/images/${id}`);
  }

  generateImage(prompt: string): Observable<Blob> {
    return this.http.post(
      `${this.baseImage}/generate-image`,
      { prompt: prompt },
      { responseType: 'blob' }
    );
  }
}
