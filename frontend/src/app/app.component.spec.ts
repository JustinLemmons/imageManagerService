import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ImageService, PagedResponse } from './services/image.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let imageServiceSpy: jasmine.SpyObj<ImageService>;

  const mockPagedResponse: PagedResponse = {
    ids: ['id1', 'id2'],
    totalElements: 2,
    totalPages: 1,
    currentPage: 0,
  };

  beforeEach(async () => {
    imageServiceSpy = jasmine.createSpyObj('ImageService', [
      'loadAllImages',
      'getImage',
      'removeImage',
    ]);
    imageServiceSpy.loadAllImages.and.returnValue(of(mockPagedResponse));
    imageServiceSpy.getImage.and.callFake((id: string) =>
      of(`https://s3.example.com/${id}.jpg`)
    );
    imageServiceSpy.removeImage.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: ImageService, useValue: imageServiceSpy }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setActiveView', () => {
    it('should set the active view', () => {
      component.setActiveView('upload');
      expect(component.activeView).toBe('upload');
    });

    it('should toggle off the same view when clicked again', () => {
      component.setActiveView('upload');
      component.setActiveView('upload');
      expect(component.activeView).toBeNull();
    });

    it('should switch to a different view', () => {
      component.setActiveView('upload');
      component.setActiveView('generate');
      expect(component.activeView).toBe('generate');
    });
  });

  describe('loadAllImages', () => {
    it('should populate imageUrls and set isImageVisible', () => {
      component.loadAllImages();
      expect(component.imageUrls.length).toBe(2);
      expect(component.isImageVisible).toBeTrue();
    });

    it('should update pagination state from the response', () => {
      imageServiceSpy.loadAllImages.and.returnValue(
        of({ ids: [], totalElements: 20, totalPages: 3, currentPage: 1 })
      );
      component.loadAllImages(1);
      expect(component.currentPage).toBe(1);
      expect(component.totalPages).toBe(3);
      expect(component.totalElements).toBe(20);
    });

    it('should set isImageVisible true with empty imageUrls when no ids are returned', () => {
      imageServiceSpy.loadAllImages.and.returnValue(
        of({ ids: [], totalElements: 0, totalPages: 0, currentPage: 0 })
      );
      component.loadAllImages();
      expect(component.isImageVisible).toBeTrue();
      expect(component.imageUrls.length).toBe(0);
    });
  });

  describe('clearImages', () => {
    it('should hide the image gallery', () => {
      component.isImageVisible = true;
      component.clearImages();
      expect(component.isImageVisible).toBeFalse();
    });
  });

  describe('selectImage', () => {
    it('should add an image id to selectedImageIds', () => {
      component.selectImage({ id: 'id1', url: 'url1' });
      expect(component.selectedImageIds.has('id1')).toBeTrue();
    });

    it('should remove an image id if already selected', () => {
      component.selectImage({ id: 'id1', url: 'url1' });
      component.selectImage({ id: 'id1', url: 'url1' });
      expect(component.selectedImageIds.has('id1')).toBeFalse();
    });
  });

  describe('openDeleteModal', () => {
    it('should set isModalVisible to true', () => {
      component.selectedImageIds.add('id1');
      component.imageUrls = [{ id: 'id1', url: 'url1' }];
      component.openDeleteModal();
      expect(component.isModalVisible).toBeTrue();
    });

    it('should set selectedImageUrl for a single selected image', () => {
      component.selectedImageIds.add('id1');
      component.imageUrls = [{ id: 'id1', url: 'url1' }];
      component.openDeleteModal();
      expect(component.selectedImageUrl).toBe('url1');
    });

    it('should not set selectedImageUrl when multiple images are selected', () => {
      component.selectedImageIds.add('id1');
      component.selectedImageIds.add('id2');
      component.imageUrls = [
        { id: 'id1', url: 'url1' },
        { id: 'id2', url: 'url2' },
      ];
      component.openDeleteModal();
      expect(component.selectedImageUrl).toBeNull();
    });

    it('should do nothing if no images are selected', () => {
      component.openDeleteModal();
      expect(component.isModalVisible).toBeFalse();
    });
  });

  describe('onDeleteCancel', () => {
    it('should hide the modal', () => {
      component.isModalVisible = true;
      component.onDeleteCancel();
      expect(component.isModalVisible).toBeFalse();
    });
  });

  describe('onDeleteConfirm', () => {
    it('should call removeImage for each selected id', () => {
      component.selectedImageIds.add('id1');
      component.selectedImageIds.add('id2');
      component.imageUrls = [
        { id: 'id1', url: 'url1' },
        { id: 'id2', url: 'url2' },
      ];
      component.onDeleteConfirm();
      expect(imageServiceSpy.removeImage).toHaveBeenCalledTimes(2);
    });

    it('should remove deleted images from imageUrls', () => {
      component.selectedImageIds.add('id1');
      component.imageUrls = [
        { id: 'id1', url: 'url1' },
        { id: 'id2', url: 'url2' },
      ];
      component.onDeleteConfirm();
      expect(component.imageUrls.length).toBe(1);
      expect(component.imageUrls[0].id).toBe('id2');
    });

    it('should clear selectedImageIds and close the modal after deletion', () => {
      component.selectedImageIds.add('id1');
      component.imageUrls = [{ id: 'id1', url: 'url1' }];
      component.onDeleteConfirm();
      expect(component.selectedImageIds.size).toBe(0);
      expect(component.isModalVisible).toBeFalse();
    });
  });

  describe('clearSelection', () => {
    it('should clear all selected image ids', () => {
      component.selectedImageIds.add('id1');
      component.selectedImageIds.add('id2');
      component.clearSelection();
      expect(component.selectedImageIds.size).toBe(0);
    });
  });

  describe('nextPage', () => {
    it('should load the next page when not on the last page', () => {
      component.currentPage = 0;
      component.totalPages = 3;
      component.nextPage();
      expect(imageServiceSpy.loadAllImages).toHaveBeenCalledWith(1);
    });

    it('should not load next page when already on the last page', () => {
      component.currentPage = 2;
      component.totalPages = 3;
      component.nextPage();
      expect(imageServiceSpy.loadAllImages).not.toHaveBeenCalled();
    });
  });

  describe('prevPage', () => {
    it('should load the previous page when not on the first page', () => {
      component.currentPage = 2;
      component.prevPage();
      expect(imageServiceSpy.loadAllImages).toHaveBeenCalledWith(1);
    });

    it('should not load previous page when already on the first page', () => {
      component.currentPage = 0;
      component.prevPage();
      expect(imageServiceSpy.loadAllImages).not.toHaveBeenCalled();
    });
  });
});
