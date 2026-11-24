import { Injectable, inject, computed, signal, OnDestroy } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Material } from '../../shared/models/material.model';

// ─── Interfaces ───────────────────────────────────────────────────────

export interface MaterialEstudiante {
  id: string;
  titulo: string;
  curso: string;
  tipo: string;
  tamano: string;
  fecha: string;
  icono: string;
  iconBg: string;
  iconColor: string;
  esVideo?: boolean;
  duracion?: string;
  badgeColor?: string;
  url?: string;
  storagePath?: string;
}

// Mapa de tipo → colores para iconos
const TIPO_COLORS: Record<string, { bg: string; color: string; badge: string }> = {
  PDF:  { bg: 'bg-error-container/20', color: 'text-error', badge: '#dc2626' },
  DOCX: { bg: 'bg-primary-fixed/20',   color: 'text-primary', badge: '#1a237e' },
  MP4:  { bg: 'bg-tertiary-container/20', color: 'text-tertiary', badge: '#ea580c' },
  PPTX: { bg: 'bg-tertiary-container/20', color: 'text-tertiary', badge: '#9333ea' },
  ZIP:  { bg: 'bg-secondary-container/20', color: 'text-secondary', badge: '#16a34a' },
};

const DEFAULT_COLOR = { bg: 'bg-surface-container/30', color: 'text-on-surface-variant', badge: '#737373' };

// ─── Servicio ─────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MaterialesEstudianteService implements OnDestroy {
  private readonly firestore = inject(Firestore);

  // ── Materiales desde Firestore (tiempo real) ─────────────────────
  private readonly materialesRaw$ = collectionData(
    query(collection(this.firestore, 'materiales'), orderBy('__name__')),
    { idField: 'id' },
  ) as Observable<Material[]>;

  private readonly materialesRaw = toSignal(this.materialesRaw$, { initialValue: [] as Material[] });

  // ── Mapeo a MaterialEstudiante ───────────────────────────────────
  readonly materiales = computed<MaterialEstudiante[]>(() =>
    this.materialesRaw().map(m => this.mapToViewModel(m)),
  );

  /** Total de materiales */
  readonly total = computed(() => this.materiales().length);

  /** Tipos únicos disponibles (para filtros, incluye 'VIDEO' como alias de MP4) */
  readonly tiposDisponibles = computed<string[]>(() => {
    const tipos = new Set(this.materiales().map(m => m.tipo));
    if (tipos.has('MP4')) tipos.add('VIDEO');
    return ['all', ...tipos];
  });

  // ── Loading ──────────────────────────────────────────────────────
  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();
  private initSub?: Subscription;

  constructor() {
    this.initSub = this.materialesRaw$.pipe(take(1)).subscribe({
      next: () => this._loaded.set(true),
      error: () => this._loaded.set(true),
    });
  }

  ngOnDestroy(): void {
    this.initSub?.unsubscribe();
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private mapToViewModel(m: Material): MaterialEstudiante {
    const colors = TIPO_COLORS[m.tipo] ?? DEFAULT_COLOR;
    const esVideo = m.tipo === 'MP4';

    return {
      id: m.id ?? '',
      titulo: m.nombre,
      curso: m.curso,
      tipo: m.tipo,
      tamano: m.tamano,
      fecha: this.formatDate(m.fecha || m.createdAt),
      icono: this.getIcon(m),
      iconBg: colors.bg,
      iconColor: colors.color,
      esVideo,
      duracion: esVideo ? this.extractDuracion(m) : undefined,
      badgeColor: colors.badge,
      url: m.url,
      storagePath: m.storagePath,
    };
  }

  private getIcon(m: Material): string {
    if (m.icono) return m.icono;
    const map: Record<string, string> = {
      PDF: 'picture_as_pdf',
      DOCX: 'description',
      PPTX: 'present_to_all',
      ZIP: 'folder_zip',
      MP4: 'play_circle',
    };
    return map[m.tipo] ?? 'description';
  }

  private formatDate(fecha?: string): string {
    if (!fecha) return '';
    // Si es YYYY-MM-DD, convertir a formato legible
    const match = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mes = meses[parseInt(match[2], 10) - 1];
      return `${parseInt(match[3], 10)} ${mes} ${match[1]}`;
    }
    return fecha;
  }

  private extractDuracion(m: Material): string | undefined {
    const durMatch = m.nombre.match(/(\d+)\s*min/i);
    if (durMatch) return `${durMatch[1]} min`;
    return undefined;
  }
}
