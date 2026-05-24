import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDeleteModalComponent } from './confirm-delete-modal.component';

describe('ConfirmDeleteModalComponent', () => {
  let component: ConfirmDeleteModalComponent;
  let fixture: ComponentFixture<ConfirmDeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.selectedImageUrl).toBeNull();
    expect(component.selectedCount).toBe(0);
    expect(component.isModalVisible).toBeFalse();
  });

  describe('onDeleteConfirm', () => {
    it('should emit onConfirm', () => {
      spyOn(component.onConfirm, 'emit');
      component.onDeleteConfirm();
      expect(component.onConfirm.emit).toHaveBeenCalled();
    });
  });

  describe('onDeleteCancel', () => {
    it('should emit onCancel', () => {
      spyOn(component.onCancel, 'emit');
      component.onDeleteCancel();
      expect(component.onCancel.emit).toHaveBeenCalled();
    });
  });

  describe('@Input bindings', () => {
    it('should reflect selectedImageUrl input', () => {
      component.selectedImageUrl = 'https://s3.example.com/img.jpg';
      expect(component.selectedImageUrl).toBe('https://s3.example.com/img.jpg');
    });

    it('should reflect selectedCount input', () => {
      component.selectedCount = 3;
      expect(component.selectedCount).toBe(3);
    });

    it('should reflect isModalVisible input', () => {
      component.isModalVisible = true;
      expect(component.isModalVisible).toBeTrue();
    });
  });
});
