import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-upload-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.css',
})
export class UploadImageComponent implements OnDestroy {
  @Output() imageSaved = new EventEmitter<void>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading: boolean = false;
  uploadSuccess: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private imageService: ImageService) {}

  triggerUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.revokeBlobUrl(this.previewUrl);
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(this.selectedFile);
    this.isUploading = true;
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    const file = this.selectedFile;
    this.selectedFile = null;
    this.revokeBlobUrl(this.previewUrl);
    this.previewUrl = null;
    this.saveImage(file);
  }

  removeUploadedImage(): void {
    this.fileInput.nativeElement.value = '';
    this.revokeBlobUrl(this.previewUrl);
    this.previewUrl = null;
    this.selectedFile = null;
    this.isUploading = false;
    this.uploadSuccess = false;
  }

  private saveImage(blob: Blob): void {
    this.imageService.uploadImage(blob).subscribe({
      next: () => {
        this.uploadSuccess = true;
        setTimeout(() => (this.uploadSuccess = false), 2000);
        this.imageSaved.emit();
      },
      error: (error) => {
        console.error(error);
        this.uploadSuccess = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl(this.previewUrl);
  }

  private revokeBlobUrl(url: string | null): void {
    if (url) URL.revokeObjectURL(url);
  }
}
