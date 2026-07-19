import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialesDocenteService } from '../services/materiales.service';
import { Material } from '../../shared/models/material.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';

type SortMode = 'recientes' | 'nombre';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'video/mp4',
  'image/png',
  'image/jpeg',
  'image/gif',
];
const MAX_SIZE_MB = 50;

@Component({
  selector: 'app-materiales-docente',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-md">
        <div>
          <h3 class="font-headline-lg text-headline-lg text-primary mb-1 font-bold">Gestión de Materiales</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant">{{ service.materiales().length }} archivo(s) en total</p>
        </div>
        <button class="w-full md:w-auto bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                (click)="openUploadModal()">
          <span class="material-symbols-outlined">upload</span>
          Subir Material
        </button>
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

    <!-- Upload Modal -->
    <app-modal [isOpen]="showModal" (close)="closeModal()">
      <div class="p-md border-b border-outline/10 flex justify-between items-center">
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Subir nuevo material</h3>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                (click)="closeModal()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form class="p-md space-y-md" (ngSubmit)="onSubmit()">

        <!-- Drop Zone -->
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Archivo</label>
          <label for="docenteFileInput"
                 class="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-lg cursor-pointer transition-colors"
                 [class]="selectedFile()
                   ? 'border-primary/50 bg-primary/5'
                   : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'">
            @if (selectedFile(); as f) {
              <span class="material-symbols-outlined text-primary" style="font-size: 40px; font-variation-settings: 'FILL' 1;">task</span>
              <div class="text-center">
                <p class="font-label-md text-label-md text-on-surface">{{ f.name }}</p>
                <p class="font-label-sm text-label-sm text-on-surface-variant">{{ formatSize(f.size) }}</p>
              </div>
              <button type="button"
                      class="font-label-sm text-label-sm text-error hover:underline"
                      (click)="clearFile($event)">Cambiar archivo</button>
            } @else {
              <span class="material-symbols-outlined text-on-surface-variant" style="font-size: 40px;">cloud_upload</span>
              <div class="text-center">
                <p class="font-label-md text-label-md text-on-surface">Arrastrá o hacé clic para seleccionar</p>
                <p class="font-label-sm text-label-sm text-on-surface-variant text-center">PDF, DOCX, PPTX, ZIP, MP4, IMG · Máx. {{ maxSizeMb }} MB</p>
              </div>
            }
            <input id="docenteFileInput" type="file" class="hidden"
                   [accept]="acceptedMimeTypes"
                   (change)="onFileChange($event)" />
          </label>
          @if (fileError()) {
            <p class="font-label-sm text-label-sm text-error flex items-center gap-1">
              <span class="material-symbols-outlined" style="font-size:16px">error</span>
              {{ fileError() }}
            </p>
          }
        </div>

        <!-- Categoría -->
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Categoría / Etiqueta</label>
          <div class="relative">
            <select [(ngModel)]="formCategoria" name="formCategoria"
                    class="w-full bg-surface-container border border-outline-variant/30 rounded-lg focus:border-primary focus:bg-white outline-none p-3 text-body-md appearance-none">
              @for (cat of service.categorias(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
          </div>
        </div>

        <!-- Progress bar -->
        @if (uploading()) {
          <div class="space-y-1">
            <div class="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Subiendo...</span>
              <span>{{ uploadPercent() }}%</span>
            </div>
            <div class="h-2 bg-surface-container rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-300"
                   [style.width.%]="uploadPercent()"></div>
            </div>
          </div>
        }

        <div class="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-md border-t border-outline/10">
          <button type="button"
                  class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors w-full sm:w-auto"
                  (click)="closeModal()" [disabled]="uploading()">Cancelar</button>
          <button type="submit"
                  class="px-md py-2.5 rounded-lg font-label-md bg-primary text-on-primary shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                  [disabled]="uploading() || !selectedFile()">
            @if (uploading()) {
              <span class="material-symbols-outlined animate-spin" style="font-size: 18px;">progress_activity</span> Subiendo...
            } @else {
              <span class="material-symbols-outlined" style="font-size: 18px;">upload</span> Subir Archivo
            }
          </button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .appearance-none { background-image: none !important; }
  `],
})
export class MaterialesComponent {
  protected service = inject(MaterialesDocenteService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly maxSizeMb = MAX_SIZE_MB;
  readonly acceptedMimeTypes = ACCEPTED_TYPES.join(',');

  searchQuery = signal('');
  formatFilter = signal('');
  sortMode = signal<SortMode>('recientes');

  showModal = false;
  formCategoria = 'TEORÍA';

  selectedFile = signal<File | null>(null);
  fileError = signal('');
  uploading = signal(false);
  uploadPercent = signal(0);
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

  openUploadModal(): void {
    this.selectedFile.set(null);
    this.fileError.set('');
    this.formCategoria = 'TEORÍA';
    this.uploading.set(false);
    this.uploadPercent.set(0);
    this.showModal = true;
  }

  closeModal(): void {
    if (this.uploading()) return;
    this.showModal = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.fileError.set('Tipo de archivo no permitido. Usá PDF, DOCX, PPTX, ZIP, MP4 o imagen.');
      this.selectedFile.set(null);
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      this.fileError.set(`El archivo supera el límite de ${MAX_SIZE_MB} MB.`);
      this.selectedFile.set(null);
      return;
    }

    this.fileError.set('');
    this.selectedFile.set(file);
  }

  clearFile(event: Event): void {
    event.preventDefault();
    this.selectedFile.set(null);
    this.fileError.set('');
  }

  formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return mb < 0.1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  }

  async onSubmit(): Promise<void> {
    const file = this.selectedFile();
    if (!file || this.uploading()) return;

    this.uploading.set(true);
    this.uploadPercent.set(0);

    try {
      await this.service.crear(file, this.formCategoria, (pct) => {
        this.uploadPercent.set(pct);
      });
      this.showModal = false;
      this.toast.show(`"${file.name}" subido correctamente`, 'success');
    } catch (err) {
      console.error('Error al subir material:', err);
      this.toast.show('Error al subir el archivo. Intentá de nuevo.', 'error');
    } finally {
      this.uploading.set(false);
      this.uploadPercent.set(0);
    }
  }

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
