import { Component, EventEmitter, Input, Output, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4"
        (click)="onBackdrop($event)"
      >
        <div
          class="bg-surface-container-lowest w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-2xl sm:max-w-lg"
          (click)="$event.stopPropagation()"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }
  }

  onBackdrop(event: MouseEvent): void {
    this.close.emit();
  }
}
