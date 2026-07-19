import { Injectable, inject, computed, signal, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { AuthService } from '../../auth/services/auth.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { Observable, map, switchMap, filter, distinctUntilChanged, shareReplay, combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Estudiante } from '../../shared/models/estudiante.model';
import { Material } from '../../shared/models/material.model';

// ─── Interfaces públicas ──────────────────────────────────────────────

export interface AsistenciaMes {
  presente: number;
  total: number;
  porcentaje: number;
}

export interface ActividadReciente {
  icon: string;
  bgColor: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

// ─── Servicio ─────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DashboardEstudianteService implements OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);
  private readonly authState = this.auth.authState;

  // ── Loading state (primeras emisiones de colecciones) ──────────
  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();
  private initSub?: Subscription;

  constructor() {
    this.auth.isInitialized.then(() => {
      this.initSub = combineLatest([
        this.materiales$.pipe(take(1)),
        this.asistencias$.pipe(take(1)),
      ]).subscribe({
        next: () => this._loaded.set(true),
        error: () => this._loaded.set(true),
      });
    });
  }

  ngOnDestroy(): void {
    this.initSub?.unsubscribe();
  }

  // ── 1. Email del usuario logueado (reactivo) ──────────────────────
  private readonly email$ = toObservable(this.authState).pipe(
    map(state => state.usuario?.email),
    filter((email): email is string => !!email),
    distinctUntilChanged(),
    shareReplay(1),
  );

  // ── 2. Estudiante en Firestore filtrado por email (tiempo real) ───
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

  /** Documento del estudiante logueado (null si no existe en la colección) */
  readonly estudiante = toSignal(this.estudiante$, { initialValue: null as Estudiante | null });

  /** Código del estudiante (ej: #EA-2025-249) */
  readonly codigoEstudiante = computed(() => this.estudiante()?.codigo ?? null);

  // ── 3. Materiales (tiempo real) ───────────────────────────────────
  private readonly materiales$ = collectionData(
    query(collection(this.firestore, 'materiales'), orderBy('__name__')),
  ) as Observable<Material[]>;

  readonly materiales = toSignal(this.materiales$, { initialValue: [] as Material[] });

  /** Total de materiales disponibles */
  readonly totalMateriales = computed(() => this.materiales().length);

  // ── 4. Asistencias (tiempo real) ──────────────────────────────────
  private readonly asistencias$ = collectionData(
    query(collection(this.firestore, 'asistencias'), orderBy('__name__')),
  ) as Observable<any[]>;

  readonly asistencias = toSignal(this.asistencias$, { initialValue: [] });

  // ── 5. Asistencia del MES ACTUAL ──────────────────────────────────
  readonly asistenciaEsteMes = computed<AsistenciaMes>(() => {
    const asistencias = this.asistencias();
    const codigo = this.codigoEstudiante();
    if (!codigo || asistencias.length === 0) {
      return { presente: 0, total: 0, porcentaje: 0 };
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const sesionesEsteMes = asistencias.filter(
      (a: any) => a.fecha && String(a.fecha).startsWith(yearMonth),
    );

    if (sesionesEsteMes.length === 0) return { presente: 0, total: 0, porcentaje: 0 };

    let presente = 0;
    let total = 0;

    for (const sesion of sesionesEsteMes) {
      const miRegistro = sesion.estudiantes?.find((e: any) => e.id === codigo);
      if (miRegistro) {
        total++;
        if (miRegistro.presente) presente++;
      }
    }

    return {
      presente,
      total,
      porcentaje: total > 0 ? Math.round((presente / total) * 100) : 0,
    };
  });

  // ── 6. Perfil completado (%) ──────────────────────────────────────
  readonly perfilCompletado = computed(() => {
    const est = this.estudiante();
    if (!est) return 0;
    const campos: (keyof Estudiante)[] = ['nombre', 'email', 'salon', 'carrera'];
    const llenos = campos.filter(c => {
      const v = est[c];
      return v !== undefined && v !== null && String(v).trim() !== '';
    });
    return Math.round((llenos.length / campos.length) * 100);
  });

  // ── 7. Actividad reciente (combinada de asistencias + materiales) ─
  readonly actividadReciente = computed<ActividadReciente[]>(() => {
    const items: ActividadReciente[] = [];
    const codigo = this.codigoEstudiante();
    const asistencias = this.asistencias();
    const materiales = this.materiales();

    // Actividades de asistencia
    if (codigo) {
      for (const sesion of asistencias.slice(0, 15)) {
        const miAsistencia = sesion.estudiantes?.find((e: any) => e.id === codigo);
        if (miAsistencia) {
          const fecha = sesion.fecha ?? '';
          const estado = miAsistencia.presente ? 'Asistencia registrada' : 'Ausencia registrada';
          items.push({
            icon: miAsistencia.presente ? 'meeting_room' : 'block',
            bgColor: miAsistencia.presente ? '#fefce8' : '#fef2f2',
            iconColor: miAsistencia.presente ? '#ca8a04' : '#dc2626',
            title: `${estado}: ${sesion.curso || 'Curso'}`,
            subtitle: `${fecha}${sesion.grupo ? ` • ${sesion.grupo}` : ''}`,
          });
        }
      }
    }

    // Actividades de materiales
    for (const mat of materiales.slice(0, 8)) {
      const icon = mat.icono || 'picture_as_pdf';
      items.push({
        icon,
        bgColor: '#eff6ff',
        iconColor: '#2563eb',
        title: `Material disponible: ${mat.nombre}`,
        subtitle: `${mat.curso || ''}${mat.fecha ? ` • ${mat.fecha}` : ''}`,
      });
    }

    // Ordenar por fecha descendente (extraer YYYY-MM-DD del subtitle)
    items.sort((a, b) => {
      const getDate = (s: string) => s.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '';
      const da = getDate(a.subtitle);
      const db = getDate(b.subtitle);
      if (da && db) return db.localeCompare(da);
      if (da) return -1;
      if (db) return 1;
      return 0;
    });

    return items.slice(0, 10);
  });

}
