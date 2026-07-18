import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../services/asistencia.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full flex-1">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">Registro de Asistencia</h1>
        </div>
        <div class="flex gap-sm">
          <button class="px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center gap-xs"
                  (click)="guardar()" [disabled]="isSaving">
            @if (!isSaving) {
              <span class="material-symbols-outlined text-[18px]">save</span>
            } @else {
              <span class="material-symbols-outlined text-[18px] animate-spin">sync</span>
            }
            {{ isSaving ? 'Guardando...' : 'Guardar Asistencia' }}
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      @if (stats(); as s) {
        <div class="grid grid-cols-3 gap-gutter mb-lg">
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-md text-center">
            <span class="material-symbols-outlined text-tertiary block mb-1">check_circle</span>
            <p class="font-headline-lg text-headline-lg text-tertiary">{{ s.presentes }}</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">Presentes</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-md text-center">
            <span class="material-symbols-outlined text-error block mb-1">cancel</span>
            <p class="font-headline-lg text-headline-lg text-error">{{ s.ausentes }}</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">Ausentes</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-md text-center">
            <span class="material-symbols-outlined text-primary block mb-1">trending_up</span>
            <p class="font-headline-lg text-headline-lg text-primary">{{ s.porcentaje }}%</p>
            <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">Asistencia</p>
          </div>
        </div>
      }

      <!-- Configuration -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 p-md mb-md flex flex-col md:flex-row gap-md">
        <div class="w-full mb-xs">
          <h2 class="font-label-md text-label-md text-primary uppercase tracking-wider">Configuración de Clase</h2>
        </div>
        <div class="flex-1">
          <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Curso</label>
          <div class="relative">
            <select [ngModel]="service.curso()" (ngModelChange)="service.actualizarCurso($event)"
                    class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-bright">
              @for (c of service.cursos; track c) { <option [value]="c">{{ c }}</option> }
            </select>
            <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>
        <div class="w-full md:w-48">
          <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Grupo</label>
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
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 overflow-hidden">
        <!-- Search & Actions -->
        <div class="p-md border-b border-outline-variant/10 flex flex-col sm:flex-row gap-md justify-between bg-surface-bright">
          <div class="relative max-w-md w-full">
            <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="currentPage.set(1)"
                   class="w-full pl-xl pr-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                   placeholder="Buscar estudiante por nombre o ID..." />
          </div>
          <div class="flex gap-sm">
            <button class="px-sm py-sm rounded-lg border border-outline text-body-sm font-label-sm text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-xs"
                    (click)="service.marcarTodos(true)">
              <span class="material-symbols-outlined text-[18px] text-tertiary">how_to_reg</span>
              Marcar todos
            </button>
            <button class="px-sm py-sm rounded-lg border border-outline text-body-sm font-label-sm text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-xs"
                    (click)="service.marcarTodos(false)">
              <span class="material-symbols-outlined text-[18px] text-error">person_remove</span>
              Desmarcar todos
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto scroll-hide">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container border-b border-outline-variant/20">
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Estudiante</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">ID</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Presente</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Ausente</th>
                <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Notas</th>
              </tr>
            </thead>
            <tbody>
              @for (est of paginated(); track est.id) {
                <tr class="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors group">
                  <td class="px-md py-sm">
                    <div class="flex items-center gap-md">
                      <div class="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center text-on-primary-container text-label-md font-bold shadow-sm">
                        {{ getInitials(est.nombre) }}
                      </div>
                      <span class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{{ est.nombre }}</span>
                    </div>
                  </td>
                  <td class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant font-mono">{{ est.id }}</td>
                  <td class="px-md py-sm text-center">
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="radio" [name]="'att-' + est.id" value="present"
                             [checked]="est.presente"
                             (change)="service.marcarEstudiante(est.id, true)"
                             class="attendance-radio w-5 h-5 text-tertiary focus:ring-tertiary border-outline" />
                    </label>
                  </td>
                  <td class="px-md py-sm text-center">
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="radio" [name]="'att-' + est.id" value="absent"
                             [checked]="!est.presente"
                             (change)="service.marcarEstudiante(est.id, false)"
                             class="attendance-radio w-5 h-5 text-error focus:ring-error border-outline" />
                    </label>
                  </td>
                  <td class="px-md py-sm">
                    <button type="button" (click)="openNoteModal(est)"
                            [class.text-primary]="est.nota"
                            [class.font-medium]="est.nota"
                            [class.text-on-surface-variant]="!est.nota"
                            [class.italic]="!est.nota"
                            class="flex items-center gap-xs text-body-sm hover:text-primary transition-all">
                      <span class="material-symbols-outlined text-[18px]">{{ est.nota ? 'note' : 'edit_note' }}</span>
                      {{ est.nota ? (est.nota.length > 20 ? est.nota.substring(0, 20) + '...' : est.nota) : 'Agregar nota' }}
                    </button>
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

    <!-- Note Modal -->
    <app-modal [isOpen]="showNoteModal" (close)="closeNoteModal()">
      <div class="p-md">
        <h3 class="font-headline-md text-headline-md text-on-surface mb-xs">Nota del Estudiante</h3>
        <p class="font-label-md text-label-md text-on-surface-variant mb-md">{{ noteStudentName }}</p>
        <textarea [(ngModel)]="noteText"
                  class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                  rows="4" placeholder="Escribir nota..."></textarea>
        <div class="flex justify-end gap-sm mt-md">
          <button class="px-md py-sm rounded-lg border border-outline text-body-sm font-medium text-on-surface hover:bg-surface-container-low transition-all"
                  (click)="closeNoteModal()">Cancelar</button>
          <button class="px-md py-sm bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center gap-xs"
                  (click)="confirmNote()">
            <span class="material-symbols-outlined text-[18px]">check</span> Confirmar
          </button>
        </div>
      </div>
    </app-modal>
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
  private readonly toast = inject(ToastService);

  searchQuery = '';
  currentPage = signal(1);
  isSaving = false;

  // Note modal
  showNoteModal = false;
  noteStudentId: string | null = null;
  noteStudentName = '';
  noteText = '';

  readonly filtered = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.service.estudiantes();
    if (!q) return list;
    return list.filter(
      (e) => e.nombre.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
    );
  });

  readonly ROWS_PER_PAGE = 8;

  readonly paginated = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.ROWS_PER_PAGE;
    return this.filtered().slice(start, start + this.ROWS_PER_PAGE);
  });

  readonly stats = computed(() => this.service.getStats());

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  openNoteModal(est: { id: string; nombre: string; nota: string }): void {
    this.noteStudentId = est.id;
    this.noteStudentName = `${est.nombre} — ${est.id}`;
    this.noteText = est.nota || '';
    this.showNoteModal = true;
  }

  closeNoteModal(): void {
    this.showNoteModal = false;
    this.noteStudentId = null;
    this.noteText = '';
  }

  confirmNote(): void {
    if (this.noteStudentId) {
      this.service.actualizarNota(this.noteStudentId, this.noteText.trim());
    }
    this.closeNoteModal();
  }

  async guardar(): Promise<void> {
    this.isSaving = true;
    try {
      await this.service.guardar();
      this.toast.show('Asistencia guardada correctamente', 'success');
    } catch {
      this.toast.show('Error al guardar la asistencia', 'error');
    } finally {
      this.isSaving = false;
    }
  }
}
