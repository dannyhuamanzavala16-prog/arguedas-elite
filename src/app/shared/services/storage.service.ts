import { Injectable } from '@angular/core';

/**
 * Abstraction over localStorage para facilitar:
 * 1. Testing (puede mockearse)
 * 2. Futura migración a backend (cambiar implementación, misma interfaz)
 * 3. Manejo centralizado de claves
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'arguedas_';

  private prefixed(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T = string>(key: string): T | null {
    const raw = localStorage.getItem(this.prefixed(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  set(key: string, value: unknown): void {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(this.prefixed(key), data);
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefixed(key));
  }

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefixed('')))
      .forEach((k) => localStorage.removeItem(k));
  }
}
