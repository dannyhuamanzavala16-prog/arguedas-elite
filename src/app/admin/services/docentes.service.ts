import { Injectable, inject, signal } from '@angular/core';
import { Docente } from '../../shared/models/docente.model';
import { MockDataService } from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class DocentesService {
  private readonly mockData = inject(MockDataService);
  private readonly data = signal<Docente[]>(this.mockData.docentes);
  readonly docentes = this.data.asReadonly();

  private nextNum = 100;

  private getNextCodigo(): string {
    this.nextNum++;
    return `#DOC-2025-${this.nextNum}`;
  }

  crear(doc: Omit<Docente, 'codigo'>): void {
    this.data.update((list) => [...list, { ...doc, codigo: this.getNextCodigo() }]);
  }

  actualizar(codigo: string, cambios: Partial<Docente>): void {
    this.data.update((list) =>
      list.map((d) => (d.codigo === codigo ? { ...d, ...cambios } : d))
    );
  }

  eliminar(codigo: string): void {
    this.data.update((list) => list.filter((d) => d.codigo !== codigo));
  }

  getEspecialidades(): string[] {
    return [...new Set(this.data().map((d) => d.especialidad))];
  }
}
