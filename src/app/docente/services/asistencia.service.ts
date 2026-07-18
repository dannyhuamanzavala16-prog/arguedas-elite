import { Injectable, inject, signal } from '@angular/core';
import { MockDataService, ASISTENCIA_CURSOS, ASISTENCIA_GRUPOS } from '../../shared/services/mock-data.service';

export interface EstudianteAsistencia {
  id: string;
  nombre: string;
  presente: boolean;
  nota: string;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly mockData = inject(MockDataService);

  private readonly _estudiantes = signal<EstudianteAsistencia[]>(
    this.mockData.asistenciaEstudiantes
  );
  readonly estudiantes = this._estudiantes.asReadonly();

  private readonly _curso = signal(ASISTENCIA_CURSOS[0]);
  private readonly _grupo = signal(ASISTENCIA_GRUPOS[1]);
  readonly curso = this._curso.asReadonly();
  readonly grupo = this._grupo.asReadonly();

  get cursos(): string[] {
    return [...ASISTENCIA_CURSOS];
  }
  get grupos(): string[] {
    return [...ASISTENCIA_GRUPOS];
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
        resolve();
      }, 1200);
    });
  }
}
