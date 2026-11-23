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
  presente: boolean | null;
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
  const clean = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  return `${fecha}_${clean(curso)}_${clean(grupo)}`;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly firestore = inject(Firestore);
  private readonly estudiantesService = inject(EstudiantesService);

  private readonly _estudiantes = signal<EstudianteAsistencia[]>([]);
  readonly estudiantes = this._estudiantes.asReadonly();

  private readonly _fecha = signal(getTodayString());
  readonly fecha = this._fecha.asReadonly();

  private readonly _curso = signal(ASISTENCIA_CURSOS[0]);
  private readonly _grupo = signal(ASISTENCIA_GRUPOS[1]);
  readonly curso = this._curso.asReadonly();
  readonly grupo = this._grupo.asReadonly();

  private readonly _loading = signal(true);
  readonly loading = this._loading.asReadonly();

  /** true si ya existe un documento de asistencia guardado para esta fecha/curso/grupo. */
  private readonly _registrada = signal(false);
  readonly registrada = this._registrada.asReadonly();

  /** Estado de sincronización para la UI */
  private readonly _syncStatus = signal<'sin cambios' | 'pendiente' | 'guardando' | 'guardado' | 'error'>('sin cambios');
  readonly syncStatus = this._syncStatus.asReadonly();

  /** Cambios locales pendientes de guardar */
  private localRevision = 0;

  constructor() {
    combineLatest([
      toObservable(this._fecha),
      toObservable(this._curso),
      toObservable(this._grupo),
      toObservable(this.estudiantesService.estudiantes),
    ])
      .pipe(
        tap(() => this._loading.set(true)),
        switchMap(([fecha, curso, grupo, allEsts]) => {
          const docId = getDocId(fecha, curso, grupo);
          const docRef = doc(this.firestore, 'asistencias', docId);

          return docData(docRef).pipe(
            map((data: any) => {
              const registrada = !!(data && data.estudiantes);
              const lista: EstudianteAsistencia[] = registrada
                ? (data.estudiantes as any[]).map((e) => ({
                    id: e.id,
                    nombre: e.nombre,
                    presente: e.presente === true ? true : e.presente === false ? false : null,
                    nota: e.nota ?? '',
                  }))
                : allEsts.map((e) => ({
                    id: e.codigo,
                    nombre: e.nombre,
                    presente: null,
                    nota: '',
                  }));
              return { lista, registrada };
            })
          );
        })
      )
      .subscribe({
        next: ({ lista, registrada }) => {
          if (this.localRevision === 0) {
            this._estudiantes.set(lista);
          }
          this._registrada.set(registrada);
          this._loading.set(false);
        },
        error: (err) => {
          console.error('Error loading attendance data:', err);
          this._loading.set(false);
        },
      });
  }

  get cursos(): string[] {
    return [...ASISTENCIA_CURSOS];
  }
  get grupos(): string[] {
    return [...ASISTENCIA_GRUPOS];
  }

  async actualizarFecha(fecha: string): Promise<void> {
    if (fecha === this._fecha()) return;
    if (this.localRevision > 0) {
      await this.guardar();
    }
    this.localRevision = 0;
    this._fecha.set(fecha);
    this._syncStatus.set('sin cambios');
  }

  async actualizarCurso(curso: string): Promise<void> {
    if (curso === this._curso()) return;
    if (this.localRevision > 0) {
      await this.guardar();
    }
    this.localRevision = 0;
    this._curso.set(curso);
    this._syncStatus.set('sin cambios');
  }

  async actualizarGrupo(grupo: string): Promise<void> {
    if (grupo === this._grupo()) return;
    if (this.localRevision > 0) {
      await this.guardar();
    }
    this.localRevision = 0;
    this._grupo.set(grupo);
    this._syncStatus.set('sin cambios');
  }

  marcarEstudiante(id: string, presente: boolean | null): void {
    this._estudiantes.update((list) =>
      list.map((e) => (e.id === id ? { ...e, presente } : e))
    );
    this.localRevision++;
    this._syncStatus.set('pendiente');
  }

  actualizarNota(id: string, nota: string): void {
    this._estudiantes.update((list) =>
      list.map((e) => (e.id === id ? { ...e, nota } : e))
    );
    this.localRevision++;
    this._syncStatus.set('pendiente');
  }

  getStats(): { presentes: number; ausentes: number; sinMarcar: number; porcentaje: number; total: number } {
    const list = this._estudiantes();
    const total = list.length;
    const presentes = list.filter((e) => e.presente === true).length;
    const ausentes = list.filter((e) => e.presente === false).length;
    const sinMarcar = total - presentes - ausentes;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
    return { presentes, ausentes, sinMarcar, porcentaje, total };
  }

  async guardar(): Promise<boolean> {
    if (this.localRevision === 0 && this._registrada()) {
      this._syncStatus.set('guardado');
      return true;
    }
    this._syncStatus.set('guardando');
    try {
      await this.guardarLista(this._estudiantes());
      this.localRevision = 0;
      this._registrada.set(true);
      this._syncStatus.set('guardado');
      return true;
    } catch (e) {
      console.error('Error guardando asistencia:', e);
      this._syncStatus.set('error');
      return false;
    }
  }

  private async guardarLista(list: EstudianteAsistencia[]): Promise<void> {
    const docRef = doc(this.firestore, 'asistencias', getDocId(this._fecha(), this._curso(), this._grupo()));
    await setDoc(docRef, {
      fecha: this._fecha(),
      curso: this._curso(),
      grupo: this._grupo(),
      estudiantes: list,
      updatedAt: new Date().toISOString(),
    });
  }
}
