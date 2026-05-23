import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-generate-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generate-image.component.html',
  styleUrl: './generate-image.component.css',
})
export class GenerateImageComponent implements OnDestroy {
  @Output() imageSaved = new EventEmitter<void>();

  promptImage: string | null = null;
  generatedBlob: Blob | null = null;
  isGenerating: boolean = false;
  promptError: boolean = false;
  saveSuccess: boolean = false;

  constructor(private imageService: ImageService) {}

  sendPrompt(textarea: HTMLTextAreaElement): void {
    const prompt = textarea.value;
    if (!prompt.trim()) {
      this.promptError = true;
      setTimeout(() => (this.promptError = false), 2000);
      return;
    }
    this.promptError = false;
    this.isGenerating = true;
    this.imageService.generateImage(prompt).subscribe({
      next: (img) => {
        this.revokeBlobUrl(this.promptImage);
        this.promptImage = URL.createObjectURL(img);
        this.generatedBlob = img;
        this.isGenerating = false;
        textarea.value = '';
      },
      error: (err) => {
        console.error(err);
        this.isGenerating = false;
      },
    });
  }

  saveGeneratedImage(): void {
    if (!this.generatedBlob) return;
    const blob = this.generatedBlob;
    this.revokeBlobUrl(this.promptImage);
    this.promptImage = null;
    this.generatedBlob = null;
    this.imageService.uploadImage(blob).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => {
          this.saveSuccess = false;
          this.imageSaved.emit();
        }, 2000);
      },
      error: console.error,
    });
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl(this.promptImage);
  }

  private revokeBlobUrl(url: string | null): void {
    if (url) URL.revokeObjectURL(url);
  }
}
