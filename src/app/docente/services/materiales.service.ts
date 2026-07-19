import { Injectable, Injector, inject, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { tap } from 'rxjs/operators';
import { Material } from '../../shared/models/material.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';
import {
  ICON_MAP,
  COLOR_MAP_DOCENTE,
  detectarTipoArchivo,
  MATERIALES_DOCENTE_CATEGORIAS,
} from '../../shared/services/mock-data.service';
import { environment } from '../../../environments/environment';

export type { Material as MaterialDocente };

const SUPABASE_URL = environment.supabase.url;
const SUPABASE_ANON_KEY = environment.supabase.anonKey;
const BUCKET = 'materiales';

@Injectable({ providedIn: 'root' })
export class MaterialesDocenteService extends FirestoreCollectionService<Material> {
  private readonly injector = inject(Injector);
  private readonly supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  private readonly _loading = signal(true);
  readonly loading = this._loading.asReadonly();

  /** Lista reactiva en tiempo real desde Firestore */
  readonly materiales = runInInjectionContext(this.injector, () =>
    toSignal(
      this.getAll().pipe(
        tap(() => this._loading.set(false))
      ),
      { initialValue: [] as Material[] }
    )
  );

  readonly categorias = signal<string[]>([...MATERIALES_DOCENTE_CATEGORIAS]);

  constructor() {
    super('materiales');
  }

  async crear(file: File, categoria: string, onProgress?: (pct: number) => void): Promise<void> {
    const nombre = file.name;
    const tipo = detectarTipoArchivo(nombre);

    // ─── Subida a Supabase Storage ────────────────────────────────────────────
    const ext = nombre.split('.').pop() ?? '';
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

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
      storagePath: data.path,
    };

    await this.create(material as any);
  }

  async eliminar(id: string, storagePath?: string): Promise<void> {
    if (storagePath) {
      await this.supabase.storage.from(BUCKET).remove([storagePath]);
    }
    await this.delete(id);
  }
}
