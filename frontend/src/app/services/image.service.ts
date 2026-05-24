import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PagedResponse {
  ids: string[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

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

  uploadImage(file: Blob): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.baseImage + '/upload', formData, {
      responseType: 'text',
    });
  }

  loadAllImages(page: number = 0, size: number = 10): Observable<PagedResponse> {
    return this.http.get<PagedResponse>(`${this.baseImage}/images?page=${page}&size=${size}`);
  }

  getImage(id: string): Observable<string> {
    return this.http.get(`${this.baseImage}/images/${id}`, {
      responseType: 'text',
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
