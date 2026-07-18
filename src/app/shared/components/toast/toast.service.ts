import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  readonly currentToasts = this.toasts.asReadonly();

  show(message: string, type: 'success' | 'error' = 'success'): void {
    const id = this.nextId++;
    this.toasts.update((t) => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), 2500);
  }

  remove(id: number): void {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
