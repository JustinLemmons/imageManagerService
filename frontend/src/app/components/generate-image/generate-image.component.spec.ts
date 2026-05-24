import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GenerateImageComponent } from './generate-image.component';
import { ImageService } from '../../services/image.service';
import { of, throwError } from 'rxjs';

describe('GenerateImageComponent', () => {
  let component: GenerateImageComponent;
  let fixture: ComponentFixture<GenerateImageComponent>;
  let imageServiceSpy: jasmine.SpyObj<ImageService>;

  beforeEach(async () => {
    imageServiceSpy = jasmine.createSpyObj('ImageService', ['generateImage', 'uploadImage']);
    imageServiceSpy.generateImage.and.returnValue(of(new Blob(['img'], { type: 'image/png' })));
    imageServiceSpy.uploadImage.and.returnValue(of('saved-id'));

    await TestBed.configureTestingModule({
      imports: [GenerateImageComponent],
      providers: [{ provide: ImageService, useValue: imageServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function makeTextarea(value: string): HTMLTextAreaElement {
    const el = document.createElement('textarea');
    el.value = value;
    return el;
  }

  describe('sendPrompt', () => {
    it('should set promptError and return early when the prompt is empty', fakeAsync(() => {
      component.sendPrompt(makeTextarea('   '));
      expect(component.promptError).toBeTrue();
      expect(imageServiceSpy.generateImage).not.toHaveBeenCalled();
      tick(2000);
      expect(component.promptError).toBeFalse();
    }));

    it('should call generateImage and set promptImage on success', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:generated');
      component.sendPrompt(makeTextarea('a cat'));
      expect(imageServiceSpy.generateImage).toHaveBeenCalledWith('a cat');
      expect(component.promptImage).toBe('blob:generated');
      expect(component.isGenerating).toBeFalse();
    });

    it('should clear the textarea value after the image is generated', () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:generated');
      const textarea = makeTextarea('a cat');
      component.sendPrompt(textarea);
      expect(textarea.value).toBe('');
    });

    it('should set isGenerating to false on error', () => {
      spyOn(console, 'error');
      imageServiceSpy.generateImage.and.returnValue(throwError(() => new Error('fail')));
      component.sendPrompt(makeTextarea('a cat'));
      expect(component.isGenerating).toBeFalse();
    });
  });

  describe('saveGeneratedImage', () => {
    it('should do nothing if generatedBlob is null', () => {
      component.generatedBlob = null;
      component.saveGeneratedImage();
      expect(imageServiceSpy.uploadImage).not.toHaveBeenCalled();
    });

    it('should clear promptImage and generatedBlob immediately on save', () => {
      spyOn(URL, 'revokeObjectURL');
      component.promptImage = 'blob:img';
      component.generatedBlob = new Blob(['img']);
      component.saveGeneratedImage();
      expect(component.promptImage).toBeNull();
      expect(component.generatedBlob).toBeNull();
    });

    it('should show saveSuccess for 2 seconds then emit imageSaved', fakeAsync(() => {
      spyOn(component.imageSaved, 'emit');
      component.generatedBlob = new Blob(['img']);
      component.saveGeneratedImage();
      expect(component.saveSuccess).toBeTrue();
      tick(2000);
      expect(component.saveSuccess).toBeFalse();
      expect(component.imageSaved.emit).toHaveBeenCalled();
    }));
  });

  describe('ngOnDestroy', () => {
    it('should revoke the promptImage blob on destroy', () => {
      spyOn(URL, 'revokeObjectURL');
      component.promptImage = 'blob:img';
      component.ngOnDestroy();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:img');
    });

    it('should not call revokeObjectURL when promptImage is null', () => {
      spyOn(URL, 'revokeObjectURL');
      component.promptImage = null;
      component.ngOnDestroy();
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });
});
