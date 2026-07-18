import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../services/asistencia.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full flex-1">
      <!-- Header Actions -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">Registro de Asistencia</h1>
        </div>
        <div class="flex gap-sm">
          <button class="px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center gap-xs"
                  (click)="guardar()" [disabled]="isSaving" id="saveBtn">
            @if (!isSaving) {
              <span class="material-symbols-outlined text-[18px]" data-icon="save">save</span>
            } @else {
              <span class="material-symbols-outlined text-[18px] animate-spin" data-icon="sync">sync</span>
            }
            {{ isSaving ? 'Guardando...' : 'Guardar Asistencia' }}
          </button>
        </div>
      </div>

      <!-- Configuration -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 p-md mb-md flex flex-col md:flex-row gap-md flex-wrap" id="selection-area">
        <div class="w-full mb-xs">
          <h2 class="font-label-md text-label-md text-primary uppercase tracking-wider">Configuración de Clase</h2>
        </div>
        <div class="flex-1">
          <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Seleccionar Curso</label>
          <div class="relative">
            <select [ngModel]="service.curso()" (ngModelChange)="service.actualizarCurso($event)"
                    class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-bright">
              @for (c of service.cursos; track c) { <option [value]="c">{{ c }}</option> }
            </select>
            <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>
        <div class="w-full md:w-48">
          <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Seleccionar Grupo</label>
          <div class="relative">
            <select [ngModel]="service.grupo()" (ngModelChange)="service.actualizarGrupo($event)"
                    class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-bright">
              @for (g of service.grupos; track g) { <option [value]="g">{{ g }}</option> }
            </select>
            <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 overflow-hidden" id="attendance-sheet">
        <!-- Search -->
        <div class="p-md border-b border-outline-variant/10 flex flex-col sm:flex-row gap-md justify-between bg-surface-bright">
          <div class="relative max-w-md w-full">
            <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
            <input type="text" [(ngModel)]="searchQuery"
                   class="w-full pl-xl pr-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                   placeholder="Buscar estudiante por nombre o ID..." id="searchInput" />
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto scroll-hide">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container border-b border-outline-variant/20">
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Estudiante</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">ID Académico</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Presente</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Ausente</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Notas</th>
              </tr>
            </thead>
            <tbody id="studentList">
              @for (est of paginated(); track est.id) {
                <tr class="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors group">
                  <td class="px-md py-sm">
                    <div class="flex items-center gap-md">
                      <img src="placeholder" class="w-12 h-12 rounded-full object-cover shadow-sm">
                      <span class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{{ est.nombre }}</span>
                    </div>
                  </td>
                  <td class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant font-mono">
                    {{ est.id }}
                  </td>
                  <td class="px-md py-sm text-center">
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="radio" [name]="'attendance-' + $index" value="present"
                             [checked]="est.presente"
                             (change)="service.marcarEstudiante(est.id, true)"
                             class="attendance-radio w-5 h-5 text-tertiary focus:ring-tertiary border-outline" />
                    </label>
                  </td>
                  <td class="px-md py-sm text-center">
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="radio" [name]="'attendance-' + $index" value="absent"
                             [checked]="!est.presente"
                             (change)="service.marcarEstudiante(est.id, false)"
                             class="attendance-radio w-5 h-5 text-error focus:ring-error border-outline" />
                    </label>
                  </td>
                  <td class="px-md py-sm">
                    <input type="text" placeholder="Agregar nota..."
                           [ngModel]="est.nota"
                           (ngModelChange)="service.actualizarNota(est.id, $event)"
                           class="bg-transparent border-b border-transparent focus:border-primary outline-none text-body-sm py-1 w-full italic opacity-60 focus:opacity-100 transition-all">
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center py-xl text-on-surface-variant font-body-md text-body-md">
                    No se encontraron estudiantes
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attendance-radio { cursor: pointer; }
    .scroll-hide::-webkit-scrollbar { display: none; }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `],
})
export class AsistenciaComponent {
  protected service = inject(AsistenciaService);

  searchQuery = '';
  isSaving = false;

  readonly filtered = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.service.estudiantes();
    if (!q) return list;
    return list.filter(
      (e) => e.nombre.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
    );
  });

  readonly paginated = computed(() => this.filtered());

  async guardar(): Promise<void> {
    this.isSaving = true;
    try {
      await this.service.guardar();
    } catch {
      console.error('Error al guardar la asistencia');
    } finally {
      this.isSaving = false;
    }
  }
}
