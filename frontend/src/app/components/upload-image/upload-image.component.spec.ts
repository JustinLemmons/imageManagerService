import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UploadImageComponent } from './upload-image.component';
import { ImageService } from '../../services/image.service';
import { of, throwError } from 'rxjs';

describe('UploadImageComponent', () => {
  let component: UploadImageComponent;
  let fixture: ComponentFixture<UploadImageComponent>;
  let imageServiceSpy: jasmine.SpyObj<ImageService>;

  beforeEach(async () => {
    imageServiceSpy = jasmine.createSpyObj('ImageService', ['uploadImage']);
    imageServiceSpy.uploadImage.and.returnValue(of('image-id'));

    await TestBed.configureTestingModule({
      imports: [UploadImageComponent],
      providers: [{ provide: ImageService, useValue: imageServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFileSelected', () => {
    it('should set selectedFile, previewUrl, and isUploading when a file is provided', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      component.onFileSelected({ target: { files: [file] } });
      expect(component.selectedFile).toBe(file);
      expect(component.previewUrl).toBe('blob:mock-url');
      expect(component.isUploading).toBeTrue();
    });

    it('should return early if no file is provided', () => {
      component.onFileSelected({ target: { files: [] } });
      expect(component.selectedFile).toBeNull();
      expect(component.previewUrl).toBeNull();
    });
  });

  describe('uploadImage', () => {
    it('should do nothing if no file is selected', () => {
      component.uploadImage();
      expect(imageServiceSpy.uploadImage).not.toHaveBeenCalled();
    });

    it('should clear selectedFile and previewUrl then call the upload service', () => {
      spyOn(URL, 'revokeObjectURL');
      component.selectedFile = new File([''], 'img.png');
      component.previewUrl = 'blob:preview';
      component.uploadImage();
      expect(component.selectedFile).toBeNull();
      expect(component.previewUrl).toBeNull();
      expect(imageServiceSpy.uploadImage).toHaveBeenCalledTimes(1);
    });

    it('should set uploadSuccess, emit imageSaved, then clear after 2 seconds', fakeAsync(() => {
      spyOn(component.imageSaved, 'emit');
      component.selectedFile = new File([''], 'img.png');
      component.uploadImage();
      expect(component.uploadSuccess).toBeTrue();
      expect(component.imageSaved.emit).toHaveBeenCalled();
      tick(2000);
      expect(component.uploadSuccess).toBeFalse();
    }));

    it('should set uploadSuccess to false on error', () => {
      spyOn(console, 'error');
      imageServiceSpy.uploadImage.and.returnValue(throwError(() => new Error('fail')));
      component.selectedFile = new File([''], 'img.png');
      component.uploadImage();
      expect(component.uploadSuccess).toBeFalse();
    });
  });

  describe('removeUploadedImage', () => {
    it('should reset all upload state', () => {
      spyOn(URL, 'revokeObjectURL');
      component.previewUrl = 'blob:preview';
      component.selectedFile = new File([''], 'img.png');
      component.isUploading = true;
      component.uploadSuccess = true;
      component.removeUploadedImage();
      expect(component.previewUrl).toBeNull();
      expect(component.selectedFile).toBeNull();
      expect(component.isUploading).toBeFalse();
      expect(component.uploadSuccess).toBeFalse();
    });
  });

  describe('ngOnDestroy', () => {
    it('should revoke the previewUrl blob on destroy', () => {
      spyOn(URL, 'revokeObjectURL');
      component.previewUrl = 'blob:preview';
      component.ngOnDestroy();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    });

    it('should not call revokeObjectURL when previewUrl is null', () => {
      spyOn(URL, 'revokeObjectURL');
      component.previewUrl = null;
      component.ngOnDestroy();
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });
});
