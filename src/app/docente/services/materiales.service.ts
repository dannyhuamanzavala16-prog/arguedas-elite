import { Injectable, Injector, inject, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Material } from '../../shared/models/material.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';
import {
  ICON_MAP,
  COLOR_MAP_DOCENTE,
  detectarTipoArchivo,
  MATERIALES_DOCENTE_CATEGORIAS,
} from '../../shared/services/mock-data.service';

export type { Material as MaterialDocente };

const CLOUDINARY_CLOUD = 'adtzb9q6';
const CLOUDINARY_PRESET = 'arguedas_materiales';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`;

@Injectable({ providedIn: 'root' })
export class MaterialesDocenteService extends FirestoreCollectionService<Material> {
  private readonly injector = inject(Injector);

  /** Lista reactiva en tiempo real desde Firestore */
  readonly materiales = runInInjectionContext(this.injector, () =>
    toSignal(this.getAll(), { initialValue: [] as Material[] })
  );

  readonly categorias = signal<string[]>([...MATERIALES_DOCENTE_CATEGORIAS]);

  constructor() {
    super('materiales');
  }

  async crear(file: File, categoria: string, onProgress?: (pct: number) => void): Promise<void> {
    const nombre = file.name;
    const tipo = detectarTipoArchivo(nombre);

    const { url, publicId } = await this.uploadToCloudinary(file, onProgress);

    const sizeInMb = file.size / (1024 * 1024);
    const tamano =
      sizeInMb < 0.1
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${sizeInMb.toFixed(1)} MB`;

    const material: Omit<Material, 'id'> = {
      nombre,
      curso: categoria,
      tipo,
      tamano,
      icono: ICON_MAP[tipo] ?? 'description',
      colorClase: COLOR_MAP_DOCENTE[tipo] ?? 'bg-primary/10 text-primary',
      fecha: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      url,
      storagePath: publicId,
    };

    await this.create(material as any);
  }

  async eliminar(id: string): Promise<void> {
    await this.delete(id);
  }

  private uploadToCloudinary(
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve({ url: res.secure_url, publicId: res.public_id });
        } else {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message ?? 'Error en Cloudinary'));
        }
      });

      xhr.addEventListener('error', () =>
        reject(new Error('Error de red al subir a Cloudinary'))
      );
      xhr.send(formData);
    });
  }
}
