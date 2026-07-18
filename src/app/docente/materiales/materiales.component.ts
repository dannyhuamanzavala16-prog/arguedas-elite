import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialesDocenteService, MaterialDocente } from '../services/materiales.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';

type SortMode = 'recientes' | 'nombre' | 'tamano';

@Component({
  selector: 'app-materiales-docente',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-gutter">
        <div>
          <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Gestión de Materiales</h3>
        </div>
        <button class="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                (click)="openUploadModal()">
          <span class="material-symbols-outlined">upload</span>
          Subir Material
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="bg-surface-container-lowest p-sm rounded-xl shadow-sm border border-outline-variant/20 mb-md flex flex-wrap gap-4 items-center">
        <div class="flex-1 min-w-[300px] relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
                 class="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-body-sm font-body-sm outline-none"
                 placeholder="Buscar por nombre de archivo o etiqueta..." />
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <select [(ngModel)]="formatFilter" (ngModelChange)="applyFilters()"
                    class="appearance-none bg-surface-container-low border-none rounded-lg text-body-sm font-body-sm px-4 py-2 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Todos los formatos</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">Documentos</option>
              <option value="ZIP">Comprimidos</option>
              <option value="MP4">Video</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
          </div>
          <div class="relative">
            <select [(ngModel)]="sortMode" (ngModelChange)="applyFilters()"
                    class="appearance-none bg-surface-container-low border-none rounded-lg text-body-sm font-body-sm px-4 py-2 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="recientes">Más recientes</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="tamano">Tamaño</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
          </div>
        </div>
      </div>

      <!-- Files Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        @for (mat of filteredMateriales(); track mat.id) {
          <div class="group relative bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden file-card">
            <div class="flex items-center justify-between mb-4">
              <div [class]="'p-3 rounded-lg ' + mat.colorClase">
                <span class="material-symbols-outlined text-3xl">{{ mat.icono }}</span>
              </div>
              <div class="flex gap-1">
                <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1"
                        (click)="openEditModal(mat)">edit</button>
                <button class="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1"
                        (click)="confirmDelete(mat)">delete</button>
              </div>
            </div>
            <h4 class="font-label-md text-label-md text-on-surface truncate pr-4" [title]="mat.nombre">{{ mat.nombre }}</h4>
            <div class="flex justify-between items-center mt-4">
              <span class="text-outline font-label-sm text-[10px] uppercase">Subido el {{ formatDate(mat.fecha) }}</span>
              <span class="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded text-[10px] font-bold">{{ mat.categoria }}</span>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-xl text-on-surface-variant font-body-md text-body-md">
            No se encontraron materiales
          </div>
        }
      </div>
    </div>

    <!-- Upload/Edit Modal -->
    <app-modal [isOpen]="showModal" (close)="closeModal()">
      <div class="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div class="p-md bg-primary text-on-primary flex justify-between items-center">
          <h3 class="font-headline-sm text-headline-sm">{{ isEditing ? 'Editar material' : 'Subir nuevo material' }}</h3>
          <button class="material-symbols-outlined hover:rotate-90 transition-transform" (click)="closeModal()">close</button>
        </div>
        <div class="p-md space-y-md">
          <div class="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center gap-3 bg-surface-container-low">
            <span class="material-symbols-outlined text-4xl text-outline">cloud_upload</span>
            <p class="text-body-md font-body-md text-center">
              Arrastra tus archivos aquí o <span class="text-primary font-bold cursor-pointer">selecciona</span>
            </p>
            <p class="text-xs text-outline">PDF, DOCX, ZIP (Máx. 50MB)</p>
          </div>
          <div class="space-y-base">
            <label class="font-label-md text-label-md text-on-surface-variant">Nombre del Material</label>
            <input type="text" [(ngModel)]="formNombre" name="formNombre"
                   class="w-full bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none p-3 text-body-md"
                   placeholder="Ej. Guía de Lectura 04" />
          </div>
          <div class="space-y-base">
            <label class="font-label-md text-label-md text-on-surface-variant">Categoría</label>
            <select [(ngModel)]="formCategoria" name="formCategoria"
                    class="w-full bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none p-3 text-body-md">
              @for (cat of service.categorias(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>
          <div class="flex gap-base justify-end pt-md">
            <button class="px-md py-sm rounded-lg font-label-md text-primary border border-primary hover:bg-primary/5 transition-colors"
                    (click)="closeModal()">Cancelar</button>
            <button class="px-md py-sm rounded-lg font-label-md bg-primary text-on-primary shadow-md hover:bg-primary/90 transition-all"
                    (click)="submitUpload()">Subir Archivo</button>
          </div>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .file-card:hover .action-overlay { opacity: 1; }
    .appearance-none { background-image: none !important; }
  `],
})
export class MaterialesComponent {
  protected service = inject(MaterialesDocenteService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  searchQuery = signal('');
  formatFilter = signal('');
  sortMode = signal<SortMode>('recientes');

  // Form
  showModal = false;
  isEditing = false;
  editingId: string | null = null;
  formNombre = '';
  formCategoria = 'TEORÍA';

  readonly filteredMateriales = computed(() => {
    let list = this.service.materiales();
    const q = this.searchQuery().toLowerCase().trim();

    // Filter by search
    if (q) {
      list = list.filter(
        (m) => m.nombre.toLowerCase().includes(q) || m.categoria.toLowerCase().includes(q)
      );
    }

    // Filter by format
    const fmt = this.formatFilter();
    if (fmt) {
      list = list.filter((m) => m.tipo === fmt);
    }

    // Sort
    const sort = this.sortMode();
    if (sort === 'nombre') {
      list = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sort === 'recientes') {
      list = [...list].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

    return list;
  });

  formatDate(date: Date): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  applyFilters(): void {
    // Signals auto-track computed, no-op needed
  }

  openUploadModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formNombre = '';
    this.formCategoria = 'TEORÍA';
    this.showModal = true;
  }

  openEditModal(mat: MaterialDocente): void {
    this.isEditing = true;
    this.editingId = mat.id;
    this.formNombre = mat.nombre.replace(/\.[^.]+$/, ''); // remove extension
    this.formCategoria = mat.categoria;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
    this.formNombre = '';
    this.formCategoria = 'TEORÍA';
  }

  submitUpload(): void {
    if (!this.formNombre.trim()) return;

    if (this.isEditing && this.editingId) {
      this.service.actualizar(this.editingId, this.formNombre.trim(), this.formCategoria);
      this.toast.show('Material actualizado correctamente', 'success');
    } else {
      this.service.crear(this.formNombre.trim(), this.formCategoria);
      this.toast.show('Material subido correctamente', 'success');
    }
    this.closeModal();
  }

  confirmDelete(mat: MaterialDocente): void {
    this.confirm
      .confirm({
        title: 'Eliminar archivo',
        desc: `¿Estás seguro de eliminar "${mat.nombre}"? Esta acción no se puede deshacer.`,
        icon: 'delete',
        iconBg: 'bg-error-container',
        iconColor: 'text-error',
        confirmText: 'Eliminar',
        confirmClass: 'bg-error text-on-error hover:bg-error/90',
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.eliminar(mat.id);
          this.toast.show('Archivo eliminado correctamente', 'success');
        }
      });
  }
}
