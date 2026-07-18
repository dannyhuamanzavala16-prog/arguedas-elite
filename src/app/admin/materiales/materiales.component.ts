import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialesService } from '../services/materiales.service';
import { Material } from '../../shared/models/material.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';

const ITEMS_PER_PAGE = 6;

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [FormsModule, ModalComponent, PaginationComponent],
  template: `
    <div class="max-w-container-max mx-auto p-md md:p-lg">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 class="font-headline-xl text-headline-xl text-primary-container mb-2">Gestión de Materiales</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Sube, organiza y administra los materiales académicos.</p>
        </div>
        <button class="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                (click)="openUploadModal()">
          <span class="material-symbols-outlined">upload</span> Subir Archivo
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10 p-md mb-lg">
        <div class="flex flex-wrap items-end gap-md">
          <div class="flex-1 min-w-[200px]">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Curso</label>
            <select [(ngModel)]="filterCurso" (change)="applyFilters()"
                    class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md">
              <option value="">Todos</option>
              @for (c of cursos(); track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
          <div class="flex-1 min-w-[160px]">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Tipo</label>
            <select [(ngModel)]="filterTipo" (change)="applyFilters()"
                    class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md">
              <option value="">Todos</option>
              @for (t of tipos(); track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <button class="border border-outline/20 px-md py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                  (click)="clearFilters()">Limpiar</button>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        @for (mat of paginated(); track mat.id) {
          <div class="group bg-surface-container-lowest rounded-xl p-md border border-outline/10 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div class="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors material-symbols-outlined"
                      (click)="confirmDelete(mat.id)" title="Eliminar">delete</button>
            </div>
            <div class="w-12 h-12 rounded-lg {{ mat.colorClase }} flex items-center justify-center mb-md">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">{{ mat.icono }}</span>
            </div>
            <h4 class="font-label-md text-label-md text-on-surface truncate">{{ mat.nombre }}</h4>
            <p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">Curso: {{ mat.curso }}</p>
            <div class="mt-md flex justify-between items-center pt-md border-t border-outline/10">
              <span class="font-label-sm text-label-sm text-outline">{{ mat.tamano }}</span>
              <span class="font-label-sm text-label-sm text-outline">{{ mat.fecha }}</span>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-xl text-on-surface-variant font-body-md text-body-md">No hay materiales disponibles</div>
        }
      </div>

      <!-- Pagination -->
      <div class="mt-lg flex justify-center">
        <app-pagination [totalItems]="totalItems()" [itemsPerPage]="6" [currentPage]="currentPage()" (pageChange)="onPageChange($event)" />
      </div>

      <!-- Upload Modal -->
      <app-modal [isOpen]="showModal" (close)="closeModal()">
        <div class="p-md border-b border-outline/10 flex justify-between items-center">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Subir Archivo</h3>
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" (click)="closeModal()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form class="p-md space-y-md" (ngSubmit)="onSubmit()">
          <div class="space-y-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Nombre del archivo</label>
            <input type="text" [(ngModel)]="formNombre" name="nombre" required placeholder="Ej: Guía de Álgebra.pdf"
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
          </div>
          <div class="space-y-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Curso</label>
            <select [(ngModel)]="formCurso" name="curso" required
                    class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all">
              <option value="">Seleccionar...</option>
              @for (c of cursos(); track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-sm border-t border-outline/10">
            <button type="button" class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors" (click)="closeModal()">Cancelar</button>
            <button type="submit" class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2">
              <span class="material-symbols-outlined" style="font-size: 18px;">upload</span> Subir
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
})
export class MaterialesComponent {
  private readonly service = inject(MaterialesService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  filterCurso = '';
  filterTipo = '';
  formNombre = '';
  formCurso = '';
  showModal = false;

  currentPage = signal(1);
  readonly cursos = computed(() => this.service.getCursos());
  readonly tipos = computed(() => this.service.getTipos());

  readonly filtered = computed(() => {
    let list = this.service.materiales();
    if (this.filterCurso) list = list.filter((m) => m.curso === this.filterCurso);
    if (this.filterTipo) list = list.filter((m) => m.tipo === this.filterTipo);
    return list;
  });

  readonly paginated = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * ITEMS_PER_PAGE;
    return this.filtered().slice(start, start + ITEMS_PER_PAGE);
  });
  readonly totalItems = computed(() => this.filtered().length);

  onPageChange(page: number) { this.currentPage.set(page); }
  applyFilters() { this.currentPage.set(1); }
  clearFilters() { this.filterCurso = ''; this.filterTipo = ''; this.currentPage.set(1); }

  openUploadModal(): void { this.formNombre = ''; this.formCurso = ''; this.showModal = true; }
  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    if (!this.formNombre || !this.formCurso) return;
    this.confirm.confirm({
      title: 'Subir archivo',
      desc: `Se subirá "${this.formNombre}" al curso de ${this.formCurso}.`,
      icon: 'upload', iconBg: 'bg-primary-container/20', iconColor: 'text-primary',
      confirmText: 'Subir', confirmClass: 'bg-primary text-on-primary hover:bg-primary/90',
    }).subscribe(ok => {
      if (!ok) return;
      this.service.crear(this.formNombre, this.formCurso);
      this.closeModal();
      this.toast.show('Archivo subido correctamente', 'success');
    });
  }

  confirmDelete(id: string): void {
    this.confirm.confirm({
      title: 'Eliminar archivo',
      desc: '¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.',
      icon: 'delete', iconBg: 'bg-error-container', iconColor: 'text-error',
      confirmText: 'Eliminar', confirmClass: 'bg-error text-on-error hover:bg-error/90',
    }).subscribe(ok => { if (ok) { this.service.eliminar(id); this.toast.show('Archivo eliminado correctamente', 'success'); } });
  }
}
