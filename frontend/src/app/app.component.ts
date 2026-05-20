import { Component, ElementRef, ViewChild } from '@angular/core';
import { ImageService } from './services/image.service';
import { CommonModule } from '@angular/common';
import { ConfirmDeleteModalComponent } from './components/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ConfirmDeleteModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
  healthMessage = '';

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  imageUrl: string | undefined;
  imageUrls: { id: string; url: string }[] = [];
  isImageVisible: boolean = false;
  selectedImageUrl: string | null = null;
  isModalVisible: boolean = false;
  selectedImageId: string | null = null;
  isUploading: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private imageService: ImageService) {}

  getHealth(): void {
    if (this.healthMessage) {
      this.healthMessage = '';
      return;
    }

    this.imageService.getHealth().subscribe((response: string) => {
      this.healthMessage = response;
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    console.log(file.type, file);

    if (!file) return;

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(this.selectedFile);
    this.isUploading = true;
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.imageService
      .uploadImage(this.selectedFile)
      .subscribe((response: string) => {
        console.log(response);
      });
  }

  loadAllImages() {
    this.imageUrls = [];
    this.isImageVisible = true;
    this.imageService.loadAllImages().subscribe((ids) => {
      ids.forEach((id) => {
        this.imageService.getImage(id).subscribe((blob) => {
          this.imageUrls.push({
            id: id,
            url: URL.createObjectURL(blob),
          });
        });
      });
    });
  }

  getImage(id: string) {
    this.imageService.getImage(id).subscribe((blob) => {
      this.imageUrl = URL.createObjectURL(blob);
    });
  }

  clearImages() {
    this.isImageVisible = false;
  }

  removeUploadedImage(fileInput: HTMLInputElement) {
    fileInput.value = '';
    this.previewUrl = null;
    this.selectedFile = null;
    this.isUploading = false;
  }

  selectImage(item: { id: string; url: string }) {
    this.selectedImageId = item.id;
    this.selectedImageUrl = item.url;
    this.isModalVisible = true;
  }

  onDeleteConfirm() {
    if (!this.selectedImageId) return;

    this.imageService.removeImage(this.selectedImageId).subscribe(() => {
      // remove from local array so UI updates immediately
      this.imageUrls = this.imageUrls.filter(
        (item) => item.id !== this.selectedImageId
      );
      this.isModalVisible = false;
      this.selectedImageId = null;
      this.selectedImageUrl = null;
    });
  }

  onDeleteCancel() {
    this.isModalVisible = false;
    this.selectedImageUrl = '';
  }

  triggerUpload() {
    this.fileInput.nativeElement.click();
  }
}
