import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialesService } from '../services/materiales.service';
import { Material } from '../../shared/models/material.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';

const ITEMS_PER_PAGE = 6;

// Tipos aceptados y su límite de tamaño (50 MB)
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
  selector: 'app-materiales',
  standalone: true,
  imports: [FormsModule, ModalComponent, PaginationComponent],
  template: `
    <div class="max-w-container-max mx-auto p-md md:p-lg">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 class="font-headline-xl text-headline-md md:text-headline-xl text-primary-container mb-2">Gestión de Materiales</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Sube, organiza y administra los materiales académicos.</p>
        </div>
        <button class="w-full md:w-auto bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                (click)="openUploadModal()">
          <span class="material-symbols-outlined">upload</span> Subir Archivo
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10 p-md mb-lg">
        <div class="grid grid-cols-1 sm:grid-cols-3 items-end gap-md">
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Curso</label>
            <select [(ngModel)]="filterCurso"
                    class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md">
              <option value="">Todos</option>
              @for (c of cursos(); track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Tipo</label>
            <select [(ngModel)]="filterTipo"
                    class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md">
              <option value="">Todos</option>
              @for (t of tipos(); track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <div class="flex items-center gap-2">
            <button class="flex-1 bg-primary text-on-primary px-md py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors"
                    (click)="applyFilters()">Aplicar</button>
            <button class="flex-1 border border-outline/20 px-md py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                    (click)="clearFilters()">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        @for (mat of paginated(); track mat.id) {
          <div class="group bg-surface-container-lowest rounded-xl p-md border border-outline/10 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div class="absolute top-0 right-0 p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
              @if (mat.url) {
                <button type="button"
                   class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors material-symbols-outlined"
                   [class.animate-spin]="downloadingId() === mat.id"
                   [disabled]="downloadingId() === mat.id"
                   title="Descargar"
                   (click)="downloadFile(mat)">{{ downloadingId() === mat.id ? 'progress_activity' : 'download' }}</button>
              }
              <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors material-symbols-outlined"
                      (click)="confirmDelete(mat.id, mat.storagePath)" title="Eliminar">delete</button>
            </div>
            <div class="w-12 h-12 rounded-lg {{ mat.colorClase }} flex items-center justify-center mb-md">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">{{ mat.icono }}</span>
            </div>
            <h4 class="font-label-md text-label-md text-on-surface truncate" [title]="mat.nombre">{{ mat.nombre }}</h4>
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

          <!-- Drop zone -->
          <div class="space-y-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Archivo</label>
            <label for="fileInput"
                   class="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-lg cursor-pointer transition-colors"
                   [class]="selectedFile()
                     ? 'border-primary/50 bg-primary/5'
                     : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container'">
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
                  <p class="font-label-sm text-label-sm text-on-surface-variant">PDF, DOCX, PPTX, ZIP, MP4, IMG · Máx. {{ maxSizeMb }} MB</p>
                </div>
              }
              <input id="fileInput" type="file" class="hidden"
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

          <!-- Curso -->
          <div class="space-y-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Curso</label>
            <select [(ngModel)]="formCurso" name="curso" required
                    class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary transition-all">
              <option value="">Seleccionar...</option>
              @for (c of allCursosOptions; track c) { <option [value]="c">{{ c }}</option> }
            </select>
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

          <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline/10">
            <button type="button"
                    class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                    (click)="closeModal()" [disabled]="uploading()">Cancelar</button>
            <button type="submit"
                    class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    [disabled]="uploading() || !selectedFile() || !formCurso">
              @if (uploading()) {
                <span class="material-symbols-outlined animate-spin" style="font-size: 18px;">progress_activity</span> Subiendo...
              } @else {
                <span class="material-symbols-outlined" style="font-size: 18px;">upload</span> Subir
              }
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

  readonly maxSizeMb = MAX_SIZE_MB;
  readonly acceptedMimeTypes = ACCEPTED_TYPES.join(',');

  // Cursos disponibles para el select (combinación de BD + opciones base)
  readonly allCursosOptions = [
    'Álgebra', 'Trigonometría', 'Geometría', 'Razonamiento Matemático',
    'Física', 'Química', 'Biología', 'Lenguaje', 'Literatura',
    'Historia', 'Historia del Perú', 'Historia Universal',
    'Anatomía', 'Farmacología', 'Administración', 'Economía',
  ];

  filterCurso = '';
  filterTipo = '';
  appliedCurso = signal('');
  appliedTipo = signal('');
  formCurso = '';
  showModal = false;


  // File state
  selectedFile = signal<File | null>(null);
  fileError = signal('');
  uploading = signal(false);
  uploadPercent = signal(0);
  downloadingId = signal<string | null>(null);

  currentPage = signal(1);
  readonly cursos = computed(() => this.service.getCursos());
  readonly tipos = computed(() => this.service.getTipos());

  readonly filtered = computed(() => {
    let list = this.service.materiales();
    const cur = this.appliedCurso();
    if (cur) list = list.filter((m) => m.curso === cur);
    const tip = this.appliedTipo();
    if (tip) list = list.filter((m) => m.tipo === tip);
    return list;
  });

  readonly paginated = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * ITEMS_PER_PAGE;
    return this.filtered().slice(start, start + ITEMS_PER_PAGE);
  });
  readonly totalItems = computed(() => this.filtered().length);

  onPageChange(page: number) { this.currentPage.set(page); }

  applyFilters() {
    this.appliedCurso.set(this.filterCurso);
    this.appliedTipo.set(this.filterTipo);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.filterCurso = '';
    this.filterTipo = '';
    this.appliedCurso.set('');
    this.appliedTipo.set('');
    this.currentPage.set(1);
  }

  openUploadModal(): void {
    this.selectedFile.set(null);
    this.fileError.set('');
    this.formCurso = '';
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

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.fileError.set('Tipo de archivo no permitido. Usá PDF, DOCX, PPTX, ZIP, MP4 o imagen.');
      this.selectedFile.set(null);
      return;
    }

    // Validate size
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
    return mb < 0.1
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${mb.toFixed(1)} MB`;
  }

  async onSubmit(): Promise<void> {
    const file = this.selectedFile();
    if (!file || !this.formCurso || this.uploading()) return;

    this.uploading.set(true);
    this.uploadPercent.set(0);

    try {
      await this.service.crear(file, this.formCurso, (pct) => {
        this.uploadPercent.set(pct);
      });
      this.showModal = false;
      this.toast.show(`"${file.name}" subido correctamente`, 'success');
    } catch (err) {
      console.error('Error al subir material:', err);
      this.toast.show('Error al subir el archivo. Revisá el preset de Cloudinary.', 'error');
    } finally {
      this.uploading.set(false);
      this.uploadPercent.set(0);
    }
  }

  async downloadFile(mat: Material): Promise<void> {
    if (!mat.url || !mat.id) return;
    this.downloadingId.set(mat.id);
    try {
      // Fetch directo sobre la URL pública (sin transformaciones que requieran autorización)
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
      // Fallback: abrir en nueva pestaña si fetch falla por CORS u otro error
      window.open(mat.url, '_blank', 'noopener');
    } finally {
      this.downloadingId.set(null);
    }
  }

  confirmDelete(id?: string, storagePath?: string): void {
    if (!id) return;
    this.confirm.confirm({
      title: 'Eliminar archivo',
      desc: '¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.',
      icon: 'delete', iconBg: 'bg-error-container', iconColor: 'text-error',
      confirmText: 'Eliminar', confirmClass: 'bg-error text-on-error hover:bg-error/90',
    }).subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.service.eliminar(id, storagePath);
        this.toast.show('Archivo eliminado correctamente', 'success');
      } catch (err) {
        console.error('Error al eliminar material:', err);
        this.toast.show('Error al eliminar el material. Intente de nuevo.', 'error');
      }
    });
  }
}
