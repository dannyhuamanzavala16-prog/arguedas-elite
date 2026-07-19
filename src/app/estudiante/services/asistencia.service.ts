import { Injectable, inject, computed, signal, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { AuthService } from '../../auth/services/auth.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { Observable, map, switchMap, filter, distinctUntilChanged, shareReplay, combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Estudiante } from '../../shared/models/estudiante.model';

// ─── Interfaces ───────────────────────────────────────────────────────

export interface HistorialEntry {
  fecha: string;
  curso: string;
  estado: 'Presente' | 'Ausente' | 'Tardanza';
}

export interface AsistenciaData {
  totalSesiones: number;
  presente: number;
  ausente: number;
  porcentaje: number;
  historial: HistorialEntry[];
}

// ─── Servicio ─────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AsistenciaEstudianteService implements OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);
  private readonly authState = this.auth.authState;

  // ── 1. Email del usuario logueado ────────────────────────────────
  private readonly email$ = toObservable(this.authState).pipe(
    map(state => state.usuario?.email),
    filter((email): email is string => !!email),
    distinctUntilChanged(),
    shareReplay(1),
  );

  // ── 2. Estudiante en Firestore filtrado por email ────────────────
  private readonly estudiante$ = this.email$.pipe(
    switchMap(email => {
      const q = query(
        collection(this.firestore, 'estudiantes'),
        where('email', '==', email),
      );
      return collectionData(q, { idField: 'id' }).pipe(
        map(list => (list.length > 0 ? list[0] : null) as Estudiante | null),
      );
    }),
    shareReplay(1),
  );

  readonly estudiante = toSignal(this.estudiante$, { initialValue: null as Estudiante | null });
  readonly codigoEstudiante = computed(() => this.estudiante()?.codigo ?? null);

  // ── 3. Asistencias (tiempo real) ─────────────────────────────────
  private readonly asistencias$ = collectionData(
    query(collection(this.firestore, 'asistencias'), orderBy('__name__')),
  ) as Observable<any[]>;

  readonly asistencias = toSignal(this.asistencias$, { initialValue: [] });

  // ── 4. Datos procesados de asistencia ────────────────────────────
  readonly asistenciaData = computed<AsistenciaData>(() => {
    const asistencias = this.asistencias();
    const codigo = this.codigoEstudiante();
    const historial: HistorialEntry[] = [];

    if (!codigo || asistencias.length === 0) {
      return { totalSesiones: 0, presente: 0, ausente: 0, porcentaje: 0, historial: [] };
    }

    let presente = 0;
    let ausente = 0;

    for (const sesion of asistencias) {
      const miRegistro = sesion.estudiantes?.find((e: any) => e.id === codigo);
      if (miRegistro) {
        if (miRegistro.presente) {
          presente++;
          historial.push({
            fecha: sesion.fecha ?? '',
            curso: sesion.curso ?? '',
            estado: 'Presente',
          });
        } else {
          ausente++;
          historial.push({
            fecha: sesion.fecha ?? '',
            curso: sesion.curso ?? '',
            estado: 'Ausente',
          });
        }
      }
    }

    const total = presente + ausente;

    // Ordenar por fecha descendente
    historial.sort((a, b) => b.fecha.localeCompare(a.fecha));

    return {
      totalSesiones: total,
      presente,
      ausente,
      porcentaje: total > 0 ? Math.round((presente / total) * 100) : 0,
      historial,
    };
  });

  // ── 5. Loading state (primera emisión de colecciones) ────────────
  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();
  private initSub?: Subscription;

  constructor() {
    this.auth.isInitialized.then(() => {
      this.initSub = this.asistencias$.pipe(take(1)).subscribe({
        next: () => this._loaded.set(true),
        error: () => this._loaded.set(true),
      });
    });
  }

  ngOnDestroy(): void {
    this.initSub?.unsubscribe();
  }
}
