import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialesDocenteService } from '../services/materiales.service';
import { Material } from '../../shared/models/material.model';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';

type SortMode = 'recientes' | 'nombre';

@Component({
  selector: 'app-materiales-docente',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-md">
        <div>
          <h3 class="font-headline-lg text-headline-lg text-primary mb-1 font-bold">Gestión de Materiales</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant">{{ service.materiales().length }} archivo(s) en total</p>
        </div>
        <!-- Sin botón de subir — solo el administrador puede subir archivos -->
      </div>

      <!-- Filter Bar -->
      <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant/20 mb-md grid grid-cols-1 sm:grid-cols-3 gap-md">
        <div class="relative sm:col-span-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                 class="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:bg-white text-body-sm font-body-sm outline-none transition-all"
                 placeholder="Buscar por nombre o curso..." />
        </div>
        <div class="relative">
          <select [ngModel]="formatFilter()" (ngModelChange)="formatFilter.set($event)"
                  class="w-full appearance-none bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-sm font-body-sm px-4 py-2 pr-8 focus:border-primary focus:bg-white cursor-pointer outline-none transition-all">
            <option value="">Todos los formatos</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">Documentos</option>
            <option value="ZIP">Comprimidos</option>
            <option value="MP4">Video</option>
          </select>
          <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
        </div>
        <div class="relative">
          <select [ngModel]="sortMode()" (ngModelChange)="sortMode.set($event)"
                  class="w-full appearance-none bg-surface-container-low border border-outline-variant/30 rounded-lg text-body-sm font-body-sm px-4 py-2 pr-8 focus:border-primary focus:bg-white cursor-pointer outline-none transition-all">
            <option value="recientes">Más recientes</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
          <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
        </div>
      </div>

      <!-- Files Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        @if (service.loading()) {
          <!-- Skeleton Loader Cards -->
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-md shadow-sm animate-pulse space-y-4">
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-lg bg-on-surface/10"></div>
              </div>
              <div class="h-4 bg-on-surface/10 rounded w-3/4"></div>
              <div class="flex justify-between items-center mt-4 pt-2">
                <div class="h-3 bg-on-surface/10 rounded w-16"></div>
                <div class="h-5 bg-on-surface/10 rounded w-20"></div>
              </div>
              <div class="h-3.5 bg-on-surface/10 rounded w-12"></div>
            </div>
          }
        } @else {
          @for (mat of filteredMateriales(); track mat.id) {
            <div class="group relative bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <!-- Actions overlay -->
              <div class="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                @if (mat.url) {
                  <button type="button"
                     class="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant bg-surface-container-lowest/80 border border-outline/10 hover:bg-primary/10 hover:text-primary transition-colors material-symbols-outlined text-[18px]"
                     [class.animate-spin]="downloadingId() === mat.id"
                     [disabled]="downloadingId() === mat.id"
                     title="Descargar"
                     (click)="downloadFile(mat)">{{ downloadingId() === mat.id ? 'progress_activity' : 'download' }}</button>
                }
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant bg-surface-container-lowest/80 border border-outline/10 hover:bg-error/10 hover:text-error transition-colors material-symbols-outlined text-[18px]"
                        (click)="confirmDelete(mat)" title="Eliminar">delete</button>
              </div>

              <div class="flex items-center justify-between mb-4">
                <div [class]="'p-3 rounded-lg ' + mat.colorClase">
                  <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">{{ mat.icono }}</span>
                </div>
              </div>
              <h4 class="font-label-md text-label-md text-on-surface truncate pr-4" [title]="mat.nombre">{{ mat.nombre }}</h4>
              <div class="flex justify-between items-center mt-4">
                <span class="text-outline font-label-sm text-[10px] uppercase">{{ mat.fecha }}</span>
                <span class="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded text-[10px] font-bold">{{ mat.curso }}</span>
              </div>
              @if (mat.tamano) {
                <p class="font-label-sm text-label-sm text-on-surface-variant mt-1">{{ mat.tamano }}</p>
              }
            </div>
          } @empty {
            <div class="col-span-full flex flex-col items-center justify-center py-xl gap-3 text-on-surface-variant">
              <span class="material-symbols-outlined text-5xl opacity-30">folder_open</span>
              <p class="font-body-md text-body-md">No se encontraron materiales</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
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

  downloadingId = signal<string | null>(null);

  readonly filteredMateriales = computed(() => {
    let list = this.service.materiales();
    const q = this.searchQuery().toLowerCase().trim();

    if (q) {
      list = list.filter(
        (m) => m.nombre.toLowerCase().includes(q) || (m.curso && m.curso.toLowerCase().includes(q))
      );
    }

    if (this.formatFilter()) {
      list = list.filter((m) => m.tipo === this.formatFilter());
    }

    if (this.sortMode() === 'nombre') {
      list = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else {
      list = [...list].sort((a, b) =>
        (b.createdAt ?? b.fecha ?? '').localeCompare(a.createdAt ?? a.fecha ?? '')
      );
    }

    return list;
  });

  async downloadFile(mat: Material): Promise<void> {
    if (!mat.url || !mat.id) return;
    this.downloadingId.set(mat.id);
    try {
      const res = await fetch(mat.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = mat.nombre;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(mat.url, '_blank', 'noopener');
    } finally {
      this.downloadingId.set(null);
    }
  }

  confirmDelete(mat: Material): void {
    if (!mat.id) return;
    this.confirm.confirm({
      title: 'Eliminar archivo',
      desc: `¿Estás seguro de eliminar "${mat.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'delete', iconBg: 'bg-error-container', iconColor: 'text-error',
      confirmText: 'Eliminar', confirmClass: 'bg-error text-on-error hover:bg-error/90',
    }).subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.service.eliminar(mat.id!, mat.storagePath);
        this.toast.show('Archivo eliminado correctamente', 'success');
      } catch (err) {
        console.error('Error al eliminar:', err);
        this.toast.show('Error al eliminar el material. Intente de nuevo.', 'error');
      }
    });
  }
}
