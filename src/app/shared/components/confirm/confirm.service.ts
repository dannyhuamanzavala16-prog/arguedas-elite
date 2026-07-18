import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  desc: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _options = signal<ConfirmOptions | null>(null);
  private _resolve: ((value: boolean) => void) | null = null;

  readonly options = this._options.asReadonly();

  confirm(options: ConfirmOptions): Observable<boolean> {
    this._options.set(options);

    return new Observable<boolean>((observer) => {
      this._resolve = (result: boolean) => {
        observer.next(result);
        observer.complete();
        this._options.set(null);
        this._resolve = null;
      };
    });
  }

  confirmAction(): void {
    this._resolve?.(true);
  }

  cancel(): void {
    this._resolve?.(false);
  }
}
