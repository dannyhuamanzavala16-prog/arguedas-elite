import { Component, computed, inject } from '@angular/core';
import { EstudiantesService } from '../../admin/services/estudiantes.service';
import { MaterialesDocenteService } from '../services/materiales.service';
import { AsistenciaService } from '../services/asistencia.service';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  template: `
    <div class="p-md md:p-lg space-y-lg max-w-container-max mx-auto w-full">
      <!-- Statistics Grid -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div class="bg-white p-md rounded-xl custom-shadow border-l-4 border-primary group hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-base">
            <span class="text-on-surface-variant font-label-md uppercase tracking-wider">Total de Alumnos</span>
            <div class="bg-primary/10 p-xs rounded-lg text-primary">
              <span class="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div class="flex items-baseline gap-xs">
            <span class="font-headline-lg text-headline-lg text-primary">{{ totalAlumnos() }}</span>
          </div>
        </div>

        <div class="bg-white p-md rounded-xl custom-shadow border-l-4 border-tertiary group hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-base">
            <span class="text-on-surface-variant font-label-md uppercase tracking-wider">Promedio de Asistencia</span>
            <div class="bg-tertiary/10 p-xs rounded-lg text-tertiary">
              <span class="material-symbols-outlined">verified</span>
            </div>
          </div>
          <div class="flex items-baseline gap-xs">
            <span class="font-headline-lg text-headline-lg text-primary">{{ promedioAsistencia() }}%</span>
          </div>
        </div>

        <div class="bg-white p-md rounded-xl custom-shadow border-l-4 border-secondary group hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-base">
            <span class="text-on-surface-variant font-label-md uppercase tracking-wider">Materiales Subidos</span>
            <div class="bg-secondary/10 p-xs rounded-lg text-secondary">
              <span class="material-symbols-outlined">cloud_upload</span>
            </div>
          </div>
          <div class="flex items-baseline gap-xs">
            <span class="font-headline-lg text-headline-lg text-primary">{{ materialesSubidos() }}</span>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class DocenteDashboardComponent {
  private readonly estudiantesService = inject(EstudiantesService);
  private readonly materialesService = inject(MaterialesDocenteService);
  private readonly asistenciaService = inject(AsistenciaService);

  readonly totalAlumnos = computed(() => this.estudiantesService.estudiantes().length);
  readonly promedioAsistencia = computed(() => this.asistenciaService.getStats().porcentaje);
  readonly materialesSubidos = computed(() => this.materialesService.materiales().length);
}

