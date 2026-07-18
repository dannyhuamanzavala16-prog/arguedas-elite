import { Component, inject, HostListener } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (options(); as opts) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="backdrop()">
        <div
          class="bg-surface-container-lowest rounded-xl shadow-2xl max-w-sm w-full p-md"
          (click)="$event.stopPropagation()"
        >
          <div class="text-center">
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-sm"
              [class]="opts.iconBg || 'bg-error-container'"
            >
              <span
                class="material-symbols-outlined"
                [class]="opts.iconColor || 'text-error'"
              >
                {{ opts.icon || 'delete' }}
              </span>
            </div>

            <h3 class="text-headline-sm font-bold mb-xs">{{ opts.title }}</h3>
            <p class="text-body-sm text-on-surface-variant mb-lg">{{ opts.desc }}</p>

            <div class="flex gap-3 justify-center">
              <button
                class="px-lg py-2.5 rounded-lg font-label-md text-label-md border border-outline-variant hover:bg-surface-container-high transition-colors"
                (click)="cancel()"
              >
                {{ opts.cancelText || 'Cancelar' }}
              </button>

              <button
                class="flex items-center gap-2 px-lg py-2.5 rounded-lg font-label-md text-label-md transition-colors"
                [class]="opts.confirmClass || 'bg-error text-on-error hover:bg-error/90'"
                (click)="confirm()"
              >
                <span class="material-symbols-outlined">{{ opts.icon || 'delete' }}</span>
                {{ opts.confirmText || 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  private readonly confirmService = inject(ConfirmService);
  protected readonly options = this.confirmService.options;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.options()) {
      this.cancel();
    }
  }

  confirm(): void {
    this.confirmService.confirmAction();
  }

  cancel(): void {
    this.confirmService.cancel();
  }

  backdrop(): void {
    this.cancel();
  }
}
