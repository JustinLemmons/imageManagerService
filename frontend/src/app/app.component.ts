import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageService } from './services/image.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
  healthMessage = '';

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

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

  // Step 1: User selects file from machine
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    console.log(file.type, file);

    if (!file) return;

    this.selectedFile = file;

    // Step 2: Create browser preview URL
    this.previewUrl = URL.createObjectURL(this.selectedFile);
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.imageService
      .uploadImage(this.selectedFile)
      .subscribe((response: string) => {
        console.log(response);
      });
  }
}
