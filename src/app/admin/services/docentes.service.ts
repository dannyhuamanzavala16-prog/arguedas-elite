import { Injectable, signal } from '@angular/core';
import { Docente } from '../../shared/models/docente.model';

const MOCK: Docente[] = [
  { codigo: '#DOC-2025-001', nombre: 'Ana Rojas', email: 'ana.rojas@elite.edu', especialidad: 'Matemáticas', cursos: ['Álgebra', 'Trigonometría'], estado: 'Activo' },
  { codigo: '#DOC-2025-002', nombre: 'Carlos López', email: 'carlos.lopez@elite.edu', especialidad: 'Física', cursos: ['Física General', 'Física Avanzada'], estado: 'Activo' },
  { codigo: '#DOC-2025-003', nombre: 'María García', email: 'maria.garcia@elite.edu', especialidad: 'Lenguaje', cursos: ['Lenguaje I', 'Literatura'], estado: 'Activo' },
  { codigo: '#DOC-2025-004', nombre: 'José Martínez', email: 'jose.martinez@elite.edu', especialidad: 'Historia', cursos: ['Historia Universal', 'Historia del Perú'], estado: 'Pendiente' },
  { codigo: '#DOC-2025-005', nombre: 'Rosa Huamán', email: 'rosa.h@elite.edu', especialidad: 'Biología', cursos: ['Biología General', 'Anatomía'], estado: 'Activo' },
  { codigo: '#DOC-2025-006', nombre: 'Pedro Sánchez', email: 'pedro.sanchez@elite.edu', especialidad: 'Química', cursos: ['Química General', 'Química Orgánica'], estado: 'Activo' },
];

@Injectable({ providedIn: 'root' })
export class DocentesService {
  private readonly data = signal<Docente[]>([...MOCK]);
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
