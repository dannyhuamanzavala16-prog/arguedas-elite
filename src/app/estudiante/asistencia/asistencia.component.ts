import { Component, computed, inject } from '@angular/core';
import { AsistenciaEstudianteService } from '../services/asistencia.service';

@Component({
  selector: 'app-asistencia-estudiante',
  standalone: true,
  template: `
    <div class="flex-1 p-md md:p-lg space-y-lg">
      <div>
        <h1 class="font-headline-lg text-headline-lg text-primary">Asistencia</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Resumen por curso</p>
      </div>

      @if (loading()) {
        <div class="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/10 animate-pulse">
          <div class="h-5 w-40 bg-surface-container rounded mb-4"></div>
          <div class="h-40 bg-surface-container rounded"></div>
        </div>
      } @else {
        <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div class="px-lg py-md border-b border-surface-container bg-surface-container-low">
            <h2 class="font-headline-sm text-headline-sm text-primary">Listado de Asistencias por Curso</h2>
          </div>
          @if (resumenPorCurso().length === 0) {
            <div class="p-xl text-center">
              <div class="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-md">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant">event_busy</span>
              </div>
              <p class="font-headline-sm text-headline-sm text-on-surface mb-xs">Sin registros aún</p>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                Aún no hay registros de asistencia. Aparecerán aquí cuando el docente los registre.
              </p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-low">
                    <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Curso</th>
                    <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Dictadas</th>
                    <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Asistidas</th>
                    <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Faltas</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/30">
                  @for (r of resumenPorCurso(); track r.curso) {
                    <tr class="hover:bg-surface-container-low/60 transition-colors">
                      <td class="px-lg py-md font-body-md text-body-md text-on-surface">{{ r.curso }}</td>
                      <td class="px-lg py-md font-body-md text-body-md text-on-surface text-center">{{ r.dictadas }}</td>
                      <td class="px-lg py-md text-center">
                        <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold text-sm">{{ r.asistidas }}</span>
                      </td>
                      <td class="px-lg py-md text-center">
                        @if (r.faltas > 0) {
                          <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold text-sm">{{ r.faltas }}</span>
                        } @else {
                          <span class="text-on-surface-variant">0</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="px-lg py-sm bg-surface-container-low border-t border-surface-container">
              <span class="text-xs text-on-surface-variant">{{ resumenPorCurso().length }} curso(s) con registro</span>
            </div>
          }
        </div>

        @if (data().totalSesiones > 0) {
          <p class="font-body-sm text-body-sm text-on-surface-variant">
            Total general: {{ data().presente }} asistencias de {{ data().totalSesiones }} sesiones ({{ data().porcentaje }}% asistencia).
          </p>
        }
      }
    </div>
  `,
})
export class AsistenciaComponent {
  private readonly service = inject(AsistenciaEstudianteService);

  readonly loading = computed(() => !this.service.loaded());
  readonly data = this.service.asistenciaData;

  readonly resumenPorCurso = computed(() => {
    const hist = this.data().historial;
    const map = new Map<string, { curso: string; dictadas: number; asistidas: number; faltas: number }>();
    for (const h of hist) {
      const cur = h.curso || 'Sin curso';
      if (!map.has(cur)) map.set(cur, { curso: cur, dictadas: 0, asistidas: 0, faltas: 0 });
      const r = map.get(cur)!;
      r.dictadas++;
      if (h.estado === 'Presente') r.asistidas++;
      else r.faltas++;
    }
    return Array.from(map.values()).sort((a, b) => a.curso.localeCompare(b.curso));
  });
}
