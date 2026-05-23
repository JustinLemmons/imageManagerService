import { Component, HostListener } from '@angular/core';
import { ImageService } from './services/image.service';
import { CommonModule } from '@angular/common';
import { ConfirmDeleteModalComponent } from './components/confirm-delete-modal/confirm-delete-modal.component';
import { UploadImageComponent } from './components/upload-image/upload-image.component';
import { GenerateImageComponent } from './components/generate-image/generate-image.component';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ConfirmDeleteModalComponent, UploadImageComponent, GenerateImageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';

  imageUrls: { id: string; url: string }[] = [];
  isImageVisible: boolean = false;
  selectedImageUrl: string | null = null;
  isModalVisible: boolean = false;
  selectedImageIds: Set<string> = new Set();
  isImagesInMemory: boolean = false;

  activeView: 'upload' | 'generate' | null = null;

  constructor(private imageService: ImageService) {}

  setActiveView(view: 'upload' | 'generate'): void {
    this.activeView = this.activeView === view ? null : view;
  }

  loadAllImages(): void {
    this.imageService
      .loadAllImages()
      .pipe(
        switchMap((ids) => {
          if (!ids.length) return of([]);

          return forkJoin(
            ids.map((id) =>
              this.imageService.getImage(id).pipe(
                map((blob) => ({ id, url: URL.createObjectURL(blob) })),
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

  clearImages(): void {
    this.isImageVisible = false;
  }

  selectImage(item: { id: string; url: string }): void {
    if (this.selectedImageIds.has(item.id)) {
      this.selectedImageIds.delete(item.id);
    } else {
      this.selectedImageIds.add(item.id);
    }
  }

  openDeleteModal(): void {
    if (this.selectedImageIds.size === 0) return;
    if (this.selectedImageIds.size === 1) {
      const id = [...this.selectedImageIds][0];
      this.selectedImageUrl = this.imageUrls.find((img) => img.id === id)?.url ?? null;
    }
    this.isModalVisible = true;
  }

  onDeleteConfirm(): void {
    if (this.selectedImageIds.size === 0) return;

    forkJoin(
      [...this.selectedImageIds].map((id) => this.imageService.removeImage(id))
    ).subscribe(() => {
      this.imageUrls = this.imageUrls.filter(
        (item) => !this.selectedImageIds.has(item.id)
      );
      this.selectedImageIds.clear();
      this.selectedImageUrl = null;
      this.isModalVisible = false;
    });
  }

  onDeleteCancel(): void {
    this.isModalVisible = false;
  }

  @HostListener('document:click')
  clearSelection(): void {
    this.selectedImageIds.clear();
  }
}
