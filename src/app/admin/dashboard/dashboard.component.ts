import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { EstudiantesService } from '../services/estudiantes.service';
import { DocentesService } from '../services/docentes.service';
import { MaterialesService } from '../services/materiales.service';

function timeAgo(isoOrDate: string): string {
  const date = new Date(isoOrDate);
  if (isNaN(date.getTime())) return isoOrDate;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} minuto${mins > 1 ? 's' : ''}`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="p-md md:p-xl space-y-xl">
      <div>
        <h2 class="text-headline-md font-bold text-on-surface mb-xs">Resumen General</h2>
        <p class="text-body-sm text-on-surface-variant">Bienvenido de nuevo al panel de administración.</p>
      </div>

      <!-- Statistics Cards -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm h-32 flex flex-col justify-between">
              <div class="w-10 h-10 rounded-lg bg-on-surface/10"></div>
              <div class="space-y-2">
                <div class="h-3.5 bg-on-surface/10 rounded w-2/3"></div>
                <div class="h-5 bg-on-surface/10 rounded w-1/3"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary mb-sm">
              <span class="material-symbols-outlined">school</span>
            </div>
            <h3 class="text-on-surface-variant text-label-md mb-xs">Total Estudiantes</h3>
            <p class="text-headline-sm font-bold text-on-surface">{{ totalEstudiantes() }}</p>
          </div>

          <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary mb-sm">
              <span class="material-symbols-outlined">group</span>
            </div>
            <h3 class="text-on-surface-variant text-label-md mb-xs">Total Docentes</h3>
            <p class="text-headline-sm font-bold text-on-surface">{{ totalDocentes() }}</p>
          </div>

          <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-error-container/20 flex items-center justify-center text-error mb-sm">
              <span class="material-symbols-outlined">description</span>
            </div>
            <h3 class="text-on-surface-variant text-label-md mb-xs">Materiales Subidos</h3>
            <p class="text-headline-sm font-bold text-on-surface">{{ totalMateriales() }}</p>
          </div>
        </div>
      }

      <!-- Recent Activity -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div class="p-md border-b border-outline-variant">
          <h3 class="text-headline-sm">Actividad Reciente</h3>
        </div>
        
        @if (loading()) {
          <div class="divide-y divide-outline-variant p-md space-y-md animate-pulse">
            @for (i of [1, 2, 3]; track i) {
              <div class="flex items-start gap-md py-sm">
                <div class="w-8 h-8 rounded-full bg-on-surface/10 shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-on-surface/10 rounded w-2/3"></div>
                  <div class="h-3 bg-on-surface/10 rounded w-1/4"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="divide-y divide-outline-variant max-h-96 overflow-y-auto">
            @if (recentActivity().length === 0) {
              <div class="p-xl text-center text-on-surface-variant text-body-md">
                No hay actividad registrada aún.
              </div>
            }
            @for (item of recentActivity(); track item.key) {
              <div class="p-md flex items-start gap-md">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                     [class.bg-primary-container]="item.color === 'primary'"
                     [class.bg-tertiary-container]="item.color === 'tertiary'"
                     [class.bg-secondary-container]="item.color === 'secondary'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">{{ item.icon }}</span>
                </div>
                <div>
                  <p class="text-body-md text-on-surface" [innerHTML]="item.title"></p>
                  <p class="text-label-sm text-on-surface-variant">{{ item.time }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnDestroy {
  private readonly estudiantesService = inject(EstudiantesService);
  private readonly docentesService = inject(DocentesService);
  private readonly materialesService = inject(MaterialesService);

  protected readonly totalEstudiantes = computed(() => this.estudiantesService.estudiantes().length);
  protected readonly totalDocentes = computed(() => this.docentesService.docentes().length);
  protected readonly totalMateriales = computed(() => this.materialesService.materiales().length);

  protected readonly loading = signal(true);
  private readonly initSub: Subscription;

  constructor() {
    this.initSub = combineLatest([
      this.estudiantesService.getAll(),
      this.docentesService.getAll(),
      this.materialesService.getAll()
    ]).pipe(take(1)).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.initSub.unsubscribe();
  }

  protected readonly recentActivity = computed(() => {
    const items = [
      ...this.estudiantesService.estudiantes()
        .filter((e) => e.createdAt)
        .map((e) => ({
          key: `est-${e.codigo}`,
          icon: 'person_add',
          color: 'primary',
          title: `Nuevo estudiante registrado: <span class="font-bold">${e.nombre}</span>`,
          createdAt: e.createdAt!,
        })),
      ...this.docentesService.docentes()
        .filter((d) => d.createdAt)
        .map((d) => ({
          key: `doc-${d.codigo}`,
          icon: 'school',
          color: 'secondary',
          title: `Nuevo docente registrado: <span class="font-bold">${d.nombre}</span>`,
          createdAt: d.createdAt!,
        })),
      ...this.materialesService.materiales()
        .filter((m) => m.createdAt)
        .map((m) => ({
          key: `mat-${m.id ?? m.nombre}`,
          icon: 'upload_file',
          color: 'tertiary',
          title: `Material subido: <span class="font-bold">${m.nombre}</span>`,
          createdAt: m.createdAt!,
        })),
    ];

    return items
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map((i) => ({ ...i, time: timeAgo(i.createdAt) }));
  });
}
