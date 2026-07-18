import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      @for (toast of toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm min-w-[280px] toast-slide-up"
          [class.bg-error-container]="toast.type === 'error'"
          [class.bg-green-50]="toast.type === 'success'"
        >
          <span
            class="material-symbols-outlined"
            [class.text-error]="toast.type === 'error'"
            [class.text-green-400]="toast.type === 'success'"
          >
            {{ toast.type === 'error' ? 'error' : 'check_circle' }}
          </span>
          <span class="font-label-md text-label-md">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.currentToasts;
}
