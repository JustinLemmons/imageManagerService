import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.css',
})
export class ConfirmDeleteModalComponent {
  @Input() selectedImageUrl: string | null = null;
  @Input() isModalVisible: boolean = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  onDeleteConfirm() {
    this.onConfirm.emit();
  }

  onDeleteCancel() {
    this.onCancel.emit();
  }
}
