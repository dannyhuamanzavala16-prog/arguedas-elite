import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { EstudiantesService } from '../../admin/services/estudiantes.service';
import { ASISTENCIA_CURSOS, ASISTENCIA_GRUPOS } from '../../shared/services/mock-data.service';

export interface EstudianteAsistencia {
  id: string;
  nombre: string;
  presente: boolean;
  nota: string;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDocId(fecha: string, curso: string, grupo: string): string {
  const clean = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  return `${fecha}_${clean(curso)}_${clean(grupo)}`;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly firestore = inject(Firestore);
  private readonly estudiantesService = inject(EstudiantesService);

  private readonly _estudiantes = signal<EstudianteAsistencia[]>([]);
  readonly estudiantes = this._estudiantes.asReadonly();

  private readonly _curso = signal(ASISTENCIA_CURSOS[0]);
  private readonly _grupo = signal(ASISTENCIA_GRUPOS[1]);
  readonly curso = this._curso.asReadonly();
  readonly grupo = this._grupo.asReadonly();

  private readonly _loading = signal(true);
  readonly loading = this._loading.asReadonly();

  // Estado de sincronización en tiempo real
  private readonly _syncStatus = signal<'sincronizando' | 'guardado' | 'error'>('guardado');
  readonly syncStatus = this._syncStatus.asReadonly();

  constructor() {
    // Escuchar de forma reactiva los cambios de curso, grupo y de la lista global de estudiantes
    combineLatest([
      toObservable(this._curso),
      toObservable(this._grupo),
      toObservable(this.estudiantesService.estudiantes)
    ]).pipe(
      tap(() => this._loading.set(true)),
      switchMap(([curso, grupo, allEsts]) => {
        const today = getTodayString();
        const docId = getDocId(today, curso, grupo);
        const docRef = doc(this.firestore, 'asistencias', docId);
        
        return docData(docRef).pipe(
          map((data: any) => {
            if (data && data.estudiantes) {
              return data.estudiantes as EstudianteAsistencia[];
            }
            // Si no existe un registro guardado para hoy, cargamos los estudiantes activos de la BD
            return allEsts.map((e) => ({
              id: e.codigo,
              nombre: e.nombre,
              presente: true, // Default a presente para facilitar el marcado
              nota: '',
            }));
          })
        );
      })
    ).subscribe({
      next: (ests) => {
        this._estudiantes.set(ests);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error loading attendance data:', err);
        this._loading.set(false);
      }
    });
  }

  get Cursos(): string[] {
    return [...ASISTENCIA_CURSOS];
  }
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

  async marcarTodos(presente: boolean): Promise<void> {
    const list = this._estudiantes().map((e) => ({ ...e, presente }));
    await this.guardarLista(list);
  }

  async marcarEstudiante(id: string, presente: boolean): Promise<void> {
    const list = this._estudiantes().map((e) => (e.id === id ? { ...e, presente } : e));
    await this.guardarLista(list);
  }

  async actualizarNota(id: string, nota: string): Promise<void> {
    const list = this._estudiantes().map((e) => (e.id === id ? { ...e, nota } : e));
    await this.guardarLista(list);
  }

  getStats(): { presentes: number; ausentes: number; porcentaje: number; total: number } {
    const list = this._estudiantes();
    const total = list.length;
    const presentes = list.filter((e) => e.presente).length;
    const ausentes = total - presentes;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
    return { presentes, ausentes, porcentaje, total };
  }

  async guardar(): Promise<void> {
    await this.guardarLista(this._estudiantes());
  }

  private async guardarLista(list: EstudianteAsistencia[]): Promise<void> {
    this._syncStatus.set('sincronizando');
    try {
      const today = getTodayString();
      const curso = this._curso();
      const grupo = this._grupo();
      const docId = getDocId(today, curso, grupo);
      const docRef = doc(this.firestore, 'asistencias', docId);

      await setDoc(docRef, {
        fecha: today,
        curso,
        grupo,
        estudiantes: list,
        updatedAt: new Date().toISOString(),
      });
      this._syncStatus.set('guardado');
    } catch (e) {
      console.error('Error auto-guardando asistencia:', e);
      this._syncStatus.set('error');
      throw e;
    }
  }
}
