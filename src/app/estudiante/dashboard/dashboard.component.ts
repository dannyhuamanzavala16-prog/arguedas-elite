import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardEstudianteService } from '../services/dashboard.service';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  template: `
    <div class="max-w-container-max mx-auto space-y-lg">
      <!-- ── LOADING ──────────────────────────────────────────── -->
      @if (loading()) {
        <section class="relative overflow-hidden rounded-xl bg-primary-container p-xl text-on-primary shadow-xl">
          <div class="relative z-10 flex flex-col gap-base">
            <div class="h-8 w-64 bg-white/30 rounded animate-pulse"></div>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-md">
          @for (_ of [1,2]; track _) {
            <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-primary">
              <div class="h-12 w-24 bg-surface-container rounded animate-pulse mb-sm"></div>
              <div class="h-4 w-20 bg-surface-container rounded animate-pulse mb-xs"></div>
              <div class="h-6 w-16 bg-surface-container rounded animate-pulse"></div>
            </div>
          }
        </section>
      } @else {
        <!-- ── WELCOME ────────────────────────────────────────── -->
        <section class="relative overflow-hidden rounded-xl bg-primary-container p-xl text-on-primary shadow-xl">
          <div class="relative z-10 flex flex-col gap-base">
            <h3 class="font-headline-xl text-headline-xl leading-tight">
              ¡Hola de nuevo, {{ nombreEstudiante() }}!
            </h3>
          </div>
          <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-tertiary-fixed/20 rounded-full blur-3xl"></div>
        </section>

        <!-- ── STATISTICS GRID ────────────────────────────────── -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <!-- ASISTENCIA -->
          <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-primary">
            <div class="flex justify-between items-start mb-sm">
              <div class="p-base bg-primary/5 rounded-lg">
                <span class="material-symbols-outlined text-primary">check_circle</span>
              </div>
            </div>
            <h4 class="font-label-md text-label-md text-secondary uppercase mb-xs">Asistencia Total</h4>
            <div class="flex items-baseline gap-xs">
              <span class="font-headline-lg text-headline-lg text-primary">
                {{ data().asistencia.porcentaje > 0 ? data().asistencia.porcentaje + '%' : '—' }}
              </span>
              <span class="font-label-sm text-label-sm text-secondary">este mes</span>
            </div>
          </div>

          <!-- MATERIALES -->
          <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-tertiary-container">
            <div class="flex justify-between items-start mb-sm">
              <div class="p-base bg-tertiary-fixed/10 rounded-lg">
                <span class="material-symbols-outlined text-tertiary">folder_open</span>
              </div>
            </div>
            <h4 class="font-label-md text-label-md text-secondary uppercase mb-xs">Materiales Disponibles</h4>
            <div class="flex items-baseline gap-xs">
              <span class="font-headline-lg text-headline-lg text-primary">
                {{ data().materiales }}
              </span>
              <span class="font-label-sm text-label-sm text-secondary">archivos</span>
            </div>
          </div>

        </section>

        <!-- ── RECENT ACTIVITY ────────────────────────────────── -->
        @if (data().actividades.length > 0) {
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="p-md border-b border-outline-variant">
              <h3 class="text-headline-sm text-on-surface font-bold">Actividad Reciente</h3>
            </div>
            <div class="divide-y divide-outline-variant max-h-80 overflow-y-auto">
              @for (item of data().actividades; track item.title) {
                <div class="p-md flex items-start gap-md hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div class="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center"
                       [style]="{ backgroundColor: item.bgColor }">
                    <span class="material-symbols-outlined" [style]="{ color: item.iconColor, fontSize: '18px' }">{{ item.icon }}</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-body-md text-on-surface font-semibold">{{ item.title }}</p>
                    <p class="text-label-sm text-on-surface-variant">{{ item.subtitle }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="p-md border-b border-outline-variant">
              <h3 class="text-headline-sm text-on-surface font-bold">Actividad Reciente</h3>
            </div>
            <div class="p-lg text-center text-on-surface-variant">
              <span class="material-symbols-outlined text-4xl mb-sm block">history</span>
              <p class="font-body-md">Aún no hay actividad registrada.</p>
              <p class="font-label-sm">Los datos aparecerán cuando tengas asistencias y materiales en el sistema.</p>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class EstudianteDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly dashboard = inject(DashboardEstudianteService);

  /** Signals del servicio */
  readonly loading = computed(() => !this.dashboard.loaded());
  readonly estudiante = this.dashboard.estudiante;
  readonly asistenciaEsteMes = this.dashboard.asistenciaEsteMes;
  readonly totalMateriales = this.dashboard.totalMateriales;
  readonly actividadReciente = this.dashboard.actividadReciente;

  /** Nombre a mostrar: del estudiante en Firestore, o fallback al de auth */
  readonly nombreEstudiante = computed(() => {
    const est = this.estudiante();
    if (est?.nombre) return est.nombre.split(' ')[0];
    const usuario = this.auth.getUsuario();
    return usuario?.nombre?.split(' ')[0] ?? 'Estudiante';
  });

  /** Data plana para el template */
  readonly data = computed(() => ({
    asistencia: this.asistenciaEsteMes(),
    materiales: this.totalMateriales(),
    actividades: this.actividadReciente(),
  }));
}
