import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ImageService, PagedResponse } from './image.service';

describe('ImageService', () => {
  let service: ImageService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ImageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadImage', () => {
    it('should POST to /upload with FormData', () => {
      const blob = new Blob(['data'], { type: 'image/png' });
      service.uploadImage(blob).subscribe((res) => expect(res).toBe('image-id'));
      const req = httpMock.expectOne(`${base}/upload`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush('image-id');
    });
  });

  describe('loadAllImages', () => {
    it('should GET /images with default page and size', () => {
      const mockResponse: PagedResponse = { ids: ['1', '2'], totalElements: 2, totalPages: 1, currentPage: 0 };
      service.loadAllImages().subscribe((res) => expect(res).toEqual(mockResponse));
      const req = httpMock.expectOne(`${base}/images?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET /images with a given page', () => {
      const mockResponse: PagedResponse = { ids: [], totalElements: 0, totalPages: 2, currentPage: 1 };
      service.loadAllImages(1, 10).subscribe();
      const req = httpMock.expectOne(`${base}/images?page=1&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getImage', () => {
    it('should GET /images/:id and return a presigned URL string', () => {
      service.getImage('abc').subscribe((url) => expect(url).toBe('https://s3.example.com/img.jpg'));
      const req = httpMock.expectOne(`${base}/images/abc`);
      expect(req.request.method).toBe('GET');
      req.flush('https://s3.example.com/img.jpg');
    });
  });

  describe('removeImage', () => {
    it('should DELETE /images/:id', () => {
      service.removeImage('abc').subscribe();
      const req = httpMock.expectOne(`${base}/images/abc`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('generateImage', () => {
    it('should POST to /generate-image with the prompt', () => {
      const mockBlob = new Blob(['img'], { type: 'image/png' });
      service.generateImage('a cat').subscribe((blob) => expect(blob).toBe(mockBlob));
      const req = httpMock.expectOne(`${base}/generate-image`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ prompt: 'a cat' });
      req.flush(mockBlob);
    });
  });
});
