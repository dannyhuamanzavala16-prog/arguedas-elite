import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Material } from '../../shared/models/material.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';
import { ICON_MAP, COLOR_MAP, detectarTipoArchivo } from '../../shared/services/mock-data.service';

import { environment } from '../../../environments/environment';

const SUPABASE_URL = environment.supabase.url;
const SUPABASE_ANON_KEY = environment.supabase.anonKey;
const BUCKET = 'materiales';

@Injectable({ providedIn: 'root' })
export class MaterialesService extends FirestoreCollectionService<Material> {
  readonly materiales = toSignal(this.getAll(), { initialValue: [] as Material[] });

  private readonly supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  constructor() {
    super('materiales');
  }

  /**
   * Sube el archivo a Supabase Storage y guarda los metadatos en Firestore.
   * @param file Archivo real del input
   * @param curso Curso al que pertenece
   * @param onProgress Callback con porcentaje de progreso (0-100)
   */
  async crear(file: File, curso: string, onProgress?: (pct: number) => void): Promise<void> {
    const nombre = file.name;
    const tipo = detectarTipoArchivo(nombre);

    // ─── Subida a Supabase Storage ────────────────────────────────────────────
    // Usamos un nombre único para evitar colisiones de public_id
    const ext = nombre.split('.').pop() ?? '';
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // Supabase no tiene progreso nativo en el SDK; simulamos inicio y fin
    onProgress?.(10);

    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .upload(uniqueName, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(error.message);

    onProgress?.(90);

    // ─── URL pública (bucket debe ser público) ────────────────────────────────
    const { data: publicUrlData } = this.supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    const url = publicUrlData.publicUrl;
    onProgress?.(100);

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
      storagePath: data.path,
    };
    await this.create(material as any);
  }

  async eliminar(id: string, storagePath?: string): Promise<void> {
    // Borrar el archivo de Supabase Storage si tenemos el path
    if (storagePath) {
      await this.supabase.storage.from(BUCKET).remove([storagePath]);
    }
    await this.delete(id);
  }

  getCursos(): string[] {
    return [...new Set(this.materiales().map((m) => m.curso))];
  }

  getTipos(): string[] {
    return [...new Set(this.materiales().map((m) => m.tipo))];
  }
}
