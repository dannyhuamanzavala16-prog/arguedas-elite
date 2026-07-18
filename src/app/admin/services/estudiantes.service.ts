import { Injectable, inject, signal } from '@angular/core';
import { Estudiante } from '../../shared/models/estudiante.model';
import { MockDataService } from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class EstudiantesService {
  private readonly mockData = inject(MockDataService);
  private readonly data = signal<Estudiante[]>(this.mockData.estudiantes);
  readonly estudiantes = this.data.asReadonly();
  private nextNum = 300;

  private getNextCodigo(): string {
    this.nextNum++;
    return `#EA-2025-${this.nextNum}`;
  }

  crear(est: Omit<Estudiante, 'codigo'>): void {
    this.data.update((list) => [...list, { ...est, codigo: this.getNextCodigo() }]);
  }

  actualizar(codigo: string, cambios: Partial<Estudiante>): void {
    this.data.update((list) =>
      list.map((e) => (e.codigo === codigo ? { ...e, ...cambios } : e))
    );
  }

  eliminar(codigo: string): void {
    this.data.update((list) => list.filter((e) => e.codigo !== codigo));
  }

  getByCodigo(codigo: string): Estudiante | undefined {
    return this.data().find((e) => e.codigo === codigo);
  }

  getCarreras(): string[] {
    return [...new Set(this.data().map((e) => e.carrera))];
  }
}
