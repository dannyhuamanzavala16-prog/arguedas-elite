import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardEstudianteService } from '../services/dashboard.service';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [RouterLink],
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
            <p class="font-body-md text-body-md opacity-90">Tu resumen de estudio en la academia.</p>
          </div>
          <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-tertiary-fixed/20 rounded-full blur-3xl"></div>
        </section>

        @if (perfilCompletado() < 100) {
          <a routerLink="/estudiante/perfil"
            class="block bg-amber-50 border border-amber-200 rounded-xl p-md hover:bg-amber-100 transition-colors">
            <p class="font-label-md text-label-md text-amber-900">
              Completa tu perfil ({{ perfilCompletado() }}%)
            </p>
            <p class="font-body-sm text-body-sm text-amber-800">Toca aquí para revisar tus datos.</p>
          </a>
        }

        <!-- ── STATISTICS GRID ────────────────────────────────── -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-md">
          <!-- ASISTENCIA -->
          <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-primary">
            <div class="flex justify-between items-start mb-sm">
              <div class="p-base bg-primary/5 rounded-lg">
                <span class="material-symbols-outlined text-primary">check_circle</span>
              </div>
            </div>
            <h4 class="font-label-md text-label-md text-secondary uppercase mb-xs">Tu asistencia este mes</h4>
            @if (data().asistencia.total > 0) {
              <div class="flex items-baseline gap-xs flex-wrap">
                <span class="font-headline-lg text-headline-lg text-primary">{{ data().asistencia.porcentaje }}%</span>
                <span class="font-label-sm text-label-sm text-secondary">
                  ({{ data().asistencia.presente }} de {{ data().asistencia.total }} clases)
                </span>
              </div>
              @if (data().asistencia.porcentaje < 80) {
                <p class="mt-sm font-label-sm text-label-sm text-red-700">Atento: tu asistencia está baja.</p>
              }
            } @else {
              <p class="font-body-md text-body-md text-on-surface-variant">Aún no hay registro este mes.</p>
            }
            <a routerLink="/estudiante/asistencia" class="inline-block mt-sm text-primary font-label-md text-label-md hover:underline">
              Ver mis asistencias →
            </a>
          </div>

          <!-- MATERIALES -->
          <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-tertiary-container">
            <div class="flex justify-between items-start mb-sm">
              <div class="p-base bg-tertiary-fixed/10 rounded-lg">
                <span class="material-symbols-outlined text-tertiary">folder_open</span>
              </div>
            </div>
            <h4 class="font-label-md text-label-md text-secondary uppercase mb-xs">Materiales para estudiar</h4>
            <p class="font-body-md text-body-md text-on-surface">
              Tienes <span class="font-bold text-primary">{{ data().materiales }}</span> material(es) disponible(s).
            </p>
            <a routerLink="/estudiante/materiales" class="inline-block mt-sm text-primary font-label-md text-label-md hover:underline">
              Ver materiales →
            </a>
          </div>
        </section>

        <!-- Acciones rápidas -->
        <section class="flex flex-wrap gap-sm">
          <a routerLink="/estudiante/asistencia"
            class="px-md py-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors">
            Ver mis asistencias
          </a>
          <a routerLink="/estudiante/materiales"
            class="px-md py-sm rounded-lg border border-primary/30 text-primary font-label-md text-label-md hover:bg-primary/5 transition-colors">
            Ver materiales
          </a>
        </section>

        <!-- ── NOVEDADES (materiales recientes) ─────────────────── -->
        @if (novedades().length > 0) {
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="p-md border-b border-outline-variant">
              <h3 class="text-headline-sm text-on-surface font-bold">Novedades</h3>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Últimos materiales disponibles.</p>
            </div>
            <div class="divide-y divide-outline-variant">
              @for (mat of novedades(); track mat.id) {
                <div class="p-md flex items-start gap-md">
                  <div class="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-50">
                    <span class="material-symbols-outlined text-blue-600" style="font-size: 18px;">{{ mat.icono || 'description' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-body-md text-on-surface font-semibold truncate">{{ mat.nombre }}</p>
                    <p class="text-label-sm text-on-surface-variant">{{ mat.curso || 'General' }}{{ mat.fecha ? ' • ' + mat.fecha : '' }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="p-md border-b border-outline-variant">
              <h3 class="text-headline-sm text-on-surface font-bold">Novedades</h3>
            </div>
            <div class="p-lg text-center text-on-surface-variant">
              <span class="material-symbols-outlined text-4xl mb-sm block">inventory_2</span>
              <p class="font-body-md">Aún no hay materiales disponibles.</p>
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
  readonly perfilCompletado = this.dashboard.perfilCompletado;

  /** Nombre a mostrar: del estudiante en Firestore, o fallback al de auth */
  readonly nombreEstudiante = computed(() => {
    const est = this.estudiante();
    if (est?.nombre) return est.nombre.split(' ')[0];
    const usuario = this.auth.getUsuario();
    return usuario?.nombre?.split(' ')[0] ?? 'Estudiante';
  });

  readonly novedades = computed(() => {
    const mats = this.dashboard.materiales();
    return [...mats]
      .sort((a, b) => (b.createdAt ?? b.fecha ?? '').localeCompare(a.createdAt ?? a.fecha ?? ''))
      .slice(0, 3);
  });

  /** Data plana para el template */
  readonly data = computed(() => ({
    asistencia: this.asistenciaEsteMes(),
    materiales: this.totalMateriales(),
  }));
}
