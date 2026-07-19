import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Material } from '../../shared/models/material.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';
import { ICON_MAP, COLOR_MAP, detectarTipoArchivo } from '../../shared/services/mock-data.service';

const CLOUDINARY_CLOUD = 'adtzb9q6';
const CLOUDINARY_PRESET = 'arguedas_materiales';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`;

@Injectable({ providedIn: 'root' })
export class MaterialesService extends FirestoreCollectionService<Material> {
  readonly materiales = toSignal(this.getAll(), { initialValue: [] as Material[] });



  constructor() {
    super('materiales');
  }

  /**
   * Sube el archivo a Cloudinary y guarda los metadatos en Firestore.
   * @param file Archivo real del input
   * @param curso Curso al que pertenece
   * @param onProgress Callback con porcentaje de progreso (0-100)
   */
  async crear(file: File, curso: string, onProgress?: (pct: number) => void): Promise<void> {
    const nombre = file.name;
    const tipo = detectarTipoArchivo(nombre);

    // ─── Subida a Cloudinary via XMLHttpRequest (para tener progreso real) ───
    const { url, publicId } = await this.uploadToCloudinary(file, onProgress);

    // ─── Tamaño real del archivo ──────────────────────────────────────────────
    const sizeInMb = file.size / (1024 * 1024);
    const tamano = sizeInMb < 0.1
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${sizeInMb.toFixed(1)} MB`;

    // ─── Guardar metadatos en Firestore ───────────────────────────────────────
    const material: Omit<Material, 'id'> = {
      nombre,
      curso,
      tipo,
      tamano,
      icono: ICON_MAP[tipo] ?? 'description',
      colorClase: COLOR_MAP[tipo] ?? 'bg-primary-container/10 text-primary',
      fecha: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      url,
      storagePath: publicId,
    };
    await this.create(material as any);
  }

  async eliminar(id: string): Promise<void> {
    // Nota: borrado de Cloudinary requiere API Secret (no exponer en frontend).
    // El archivo en Cloudinary se puede limpiar desde la consola o con backend.
    await this.delete(id);
  }

  getCursos(): string[] {
    return [...new Set(this.materiales().map((m) => m.curso))];
  }

  getTipos(): string[] {
    return [...new Set(this.materiales().map((m) => m.tipo))];
  }

  // ─── Privado ─────────────────────────────────────────────────────────────────

  private uploadToCloudinary(file: File, onProgress?: (pct: number) => void): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      // resource_type 'auto' está configurado en la URL del endpoint

      const xhr = new XMLHttpRequest();
      xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
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

      xhr.addEventListener('error', () => reject(new Error('Error de red al subir a Cloudinary')));
      xhr.send(formData);
    });
  }
}
