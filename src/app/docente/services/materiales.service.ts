import { Injectable, Injector, inject, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Material } from '../../shared/models/material.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';
import { environment } from '../../../environments/environment';

export type { Material as MaterialDocente };

const SUPABASE_URL = environment.supabase.url;
const SUPABASE_ANON_KEY = environment.supabase.anonKey;
const BUCKET = 'materiales';

@Injectable({ providedIn: 'root' })
export class MaterialesDocenteService extends FirestoreCollectionService<Material> {
  private readonly injector = inject(Injector);

  /** Cliente Supabase perezoso: no se crea hasta que se usa (evita romper en dev sin credenciales). */
  private supabaseClient: SupabaseClient | null = null;
  private get supabase(): SupabaseClient {
    if (!this.supabaseClient) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase no está configurado: completá environment.supabase.url y anonKey.');
      }
      this.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return this.supabaseClient;
  }

  private readonly _loading = signal(true);
  readonly loading = this._loading.asReadonly();

  /** Lista reactiva en tiempo real desde Firestore */
  readonly materiales = runInInjectionContext(this.injector, () =>
    toSignal(
      this.getAll().pipe(
        catchError((err) => {
          console.error('Error cargando materiales:', err);
          return of([] as Material[]);
        }),
        tap(() => this._loading.set(false))
      ),
      { initialValue: [] as Material[] }
    )
  );

  constructor() {
    super('materiales');
  }

  async eliminar(id: string, storagePath?: string): Promise<void> {
    if (storagePath) {
      const { error } = await this.supabase.storage.from(BUCKET).remove([storagePath]);
      if (error) {
        throw new Error(`No se pudo borrar el archivo de Storage: ${error.message}`);
      }
    }
    await this.delete(id);
  }
}
