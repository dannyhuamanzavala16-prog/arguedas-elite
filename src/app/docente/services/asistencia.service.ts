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

/** Espera antes de escribir, para no guardar en cada tecla. */
const SAVE_DEBOUNCE_MS = 700;

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

  /** true si ya existe un documento de asistencia guardado para hoy. */
  private readonly _registrada = signal(false);
  readonly registrada = this._registrada.asReadonly();

  // Estado de sincronización en tiempo real
  private readonly _syncStatus = signal<'sincronizando' | 'guardado' | 'error'>('guardado');
  readonly syncStatus = this._syncStatus.asReadonly();

  /** Cambios locales pendientes. Mientras sea > 0 se ignora el eco de Firestore. */
  private localRevision = 0;
  private debounceTimer?: ReturnType<typeof setTimeout>;
  /** Serializa las escrituras para que nunca lleguen fuera de orden. */
  private writeChain: Promise<boolean> = Promise.resolve(true);

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
            const registrada = !!(data && data.estudiantes);
            const lista = registrada
              ? (data.estudiantes as EstudianteAsistencia[])
              : allEsts.map((e) => ({
                  id: e.codigo,
                  nombre: e.nombre,
                  presente: true, // Default a presente para facilitar el marcado
                  nota: '',
                }));
            return { lista, registrada };
          })
        );
      })
    ).subscribe({
      next: ({ lista, registrada }) => {
        // No pisar cambios locales que todavía no se persistieron
        if (this.localRevision === 0) {
          this._estudiantes.set(lista);
        }
        this._registrada.set(registrada);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error loading attendance data:', err);
        this._loading.set(false);
      }
    });
  }

  get cursos(): string[] {
    return [...ASISTENCIA_CURSOS];
  }
  get grupos(): string[] {
    return [...ASISTENCIA_GRUPOS];
  }

  async actualizarCurso(curso: string): Promise<void> {
    await this.flush();
    this._curso.set(curso);
  }

  async actualizarGrupo(grupo: string): Promise<void> {
    await this.flush();
    this._grupo.set(grupo);
  }

  marcarEstudiante(id: string, presente: boolean): void {
    this.aplicarCambio((list) => list.map((e) => (e.id === id ? { ...e, presente } : e)));
  }

  actualizarNota(id: string, nota: string): void {
    this.aplicarCambio((list) => list.map((e) => (e.id === id ? { ...e, nota } : e)));
  }

  marcarTodos(presente: boolean): Promise<boolean> {
    this._estudiantes.update((list) => list.map((e) => ({ ...e, presente })));
    this.localRevision++;
    return this.flush();
  }

  getStats(): { presentes: number; ausentes: number; porcentaje: number; total: number } {
    const list = this._estudiantes();
    const total = list.length;
    const presentes = list.filter((e) => e.presente).length;
    const ausentes = total - presentes;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
    return { presentes, ausentes, porcentaje, total };
  }

  /** Guardado explícito (botón). Devuelve false si falló. */
  guardar(): Promise<boolean> {
    return this.flush();
  }

  private aplicarCambio(mutator: (list: EstudianteAsistencia[]) => EstudianteAsistencia[]): void {
    this._estudiantes.update(mutator);
    this.localRevision++;
    this.programarGuardado();
  }

  private programarGuardado(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.flush(), SAVE_DEBOUNCE_MS);
  }

  private flush(): Promise<boolean> {
    clearTimeout(this.debounceTimer);

    if (this.localRevision === 0) {
      return Promise.resolve(true);
    }

    const revision = this.localRevision;
    const snapshot = this._estudiantes();
    this._syncStatus.set('sincronizando');

    this.writeChain = this.writeChain.then(async () => {
      try {
        await this.guardarLista(snapshot);
        if (this.localRevision === revision) {
          this.localRevision = 0;
          this._syncStatus.set('guardado');
        }
        return true;
      } catch (e) {
        console.error('Error auto-guardando asistencia:', e);
        this._syncStatus.set('error');
        return false;
      }
    });

    return this.writeChain;
  }

  private async guardarLista(list: EstudianteAsistencia[]): Promise<void> {
    const today = getTodayString();
    const curso = this._curso();
    const grupo = this._grupo();
    const docRef = doc(this.firestore, 'asistencias', getDocId(today, curso, grupo));

    await setDoc(docRef, {
      fecha: today,
      curso,
      grupo,
      estudiantes: list,
      updatedAt: new Date().toISOString(),
    });
  }
}
