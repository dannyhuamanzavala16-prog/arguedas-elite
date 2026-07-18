import { Injectable, signal } from '@angular/core';

export interface EstudianteAsistencia {
  id: string;
  nombre: string;
  presente: boolean;
  nota: string;
}

export interface AsistenciaEstado {
  curso: string;
  grupo: string;
  fecha: string;
  estudiantes: EstudianteAsistencia[];
}

const MOCK_ESTUDIANTES: EstudianteAsistencia[] = [
  { id: 'MAT-001', nombre: 'Alfonso Herrera Ruiz', presente: false, nota: '' },
  { id: 'MAT-002', nombre: 'Beatriz Mendoza Vega', presente: false, nota: '' },
  { id: 'MAT-003', nombre: 'Carlos Santillán Diaz', presente: false, nota: '' },
  { id: 'MAT-004', nombre: 'Diana Lujan Quispe', presente: false, nota: '' },
  { id: 'MAT-005', nombre: 'Eduardo Ortiz Mora', presente: false, nota: '' },
  { id: 'MAT-006', nombre: 'Flavia Torres Benites', presente: false, nota: '' },
  { id: 'MAT-007', nombre: 'Gabriel Rojas Castro', presente: false, nota: '' },
  { id: 'MAT-008', nombre: 'Helena Vargas Silva', presente: false, nota: '' },
];

const CURSOS = ['Cálculo Diferencial e Integral', 'Álgebra Lineal', 'Física Mecánica', 'Química General'];
const GRUPOS = ['Grupo A', 'Grupo B'];

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly _estudiantes = signal<EstudianteAsistencia[]>(
    MOCK_ESTUDIANTES.map((e) => ({ ...e }))
  );
  readonly estudiantes = this._estudiantes.asReadonly();

  private readonly _curso = signal(CURSOS[0]);
  private readonly _grupo = signal(GRUPOS[1]);
  readonly curso = this._curso.asReadonly();
  readonly grupo = this._grupo.asReadonly();

  get cursos(): string[] {
    return [...CURSOS];
  }
  get grupos(): string[] {
    return [...GRUPOS];
  }

  actualizarCurso(curso: string): void {
    this._curso.set(curso);
  }

  actualizarGrupo(grupo: string): void {
    this._grupo.set(grupo);
  }

  marcarTodos(presente: boolean): void {
    this._estudiantes.update((list) =>
      list.map((e) => ({ ...e, presente }))
    );
  }

  marcarEstudiante(id: string, presente: boolean): void {
    this._estudiantes.update((list) =>
      list.map((e) => (e.id === id ? { ...e, presente } : e))
    );
  }

  actualizarNota(id: string, nota: string): void {
    this._estudiantes.update((list) =>
      list.map((e) => (e.id === id ? { ...e, nota } : e))
    );
  }

  getStats(): { presentes: number; ausentes: number; porcentaje: number; total: number } {
    const list = this._estudiantes();
    const total = list.length;
    const presentes = list.filter((e) => e.presente).length;
    const ausentes = total - presentes;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
    return { presentes, ausentes, porcentaje, total };
  }

  guardar(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: en el futuro esto persistirá en Firestore
        resolve();
      }, 1200);
    });
  }
}
