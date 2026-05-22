import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ImageService } from './services/image.service';
import { CommonModule } from '@angular/common';
import { ConfirmDeleteModalComponent } from './components/confirm-delete-modal/confirm-delete-modal.component';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ConfirmDeleteModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy {
  title = 'frontend';
  healthMessage = '';

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imageUrl: string | undefined;
  imageUrls: { id: string; url: string }[] = [];
  isImageVisible: boolean = false;
  selectedImageUrl: string | null = null;
  isModalVisible: boolean = false;
  selectedImageId: string | null = null;
  isUploading: boolean = false;
  isImagesInMemory: boolean = false;
  uploadSuccess: boolean = false;

  generatedBlob: Blob | undefined;
  promptImage: string | null = null;
  isGenerating: boolean = false;

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

    this.revokeBlobUrl(this.previewUrl);
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(this.selectedFile);
    this.isUploading = true;
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.imageService.uploadImage(this.selectedFile).subscribe({
      next: (response: string) => {
        console.log(response);
        this.uploadSuccess = true;
        this.selectedFile = null;
        this.revokeBlobUrl(this.previewUrl);
        this.previewUrl = null;
      },
      error: (error) => {
        console.error(error);
        this.uploadSuccess = false;
      },
    });
  }

  loadAllImages() {
    this.imageService
      .loadAllImages()
      .pipe(
        switchMap((ids) => {
          if (!ids.length) return of([]);

          return forkJoin(
            ids.map((id) =>
              this.imageService.getImage(id).pipe(
                map((blob) => ({
                  id,
                  url: URL.createObjectURL(blob),
                })),
                catchError(() => of({ id, url: null }))
              )
            )
          );
        })
      )
      .subscribe({
        next: (images) => {
          this.imageUrls = images.filter((img) => img.url !== null);
          this.isImageVisible = true;
          this.isImagesInMemory = this.imageUrls.length > 0;
        },
        error: (err) => console.error('Failed to load images', err),
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
    this.revokeBlobUrl(this.previewUrl);
    this.previewUrl = null;
    this.selectedFile = null;
    this.isUploading = false;
    this.uploadSuccess = false;
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

  sendPrompt(prompt: string): void {
    this.isGenerating = true;
    this.imageService.generateImage(prompt).subscribe({
      next: (img) => {
        this.revokeBlobUrl(this.promptImage);
        this.promptImage = URL.createObjectURL(img);
        this.isGenerating = false;
      },
      error: (err) => {
        console.error(err);
        this.isGenerating = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl(this.promptImage);
    this.revokeBlobUrl(this.previewUrl);
  }

  private revokeBlobUrl(url: string | null): void {
    if (url) URL.revokeObjectURL(url);
  }
}
