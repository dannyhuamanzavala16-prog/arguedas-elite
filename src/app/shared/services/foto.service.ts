import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const SUPABASE_URL = environment.supabase.url;
const SUPABASE_ANON_KEY = environment.supabase.anonKey;
const BUCKET = 'materiales'; // Usamos el bucket que ya existe
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

@Injectable({ providedIn: 'root' })
export class FotoService {
  private readonly supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /**
   * Valida que el archivo sea una imagen y no supere 50 MB.
   * @throws Error si no pasa la validación.
   */
  validar(file: File): void {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Usá JPG, PNG, GIF o WebP.');
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(`El archivo supera el límite de 50 MB.`);
    }
  }

  /**
   * Sube una foto de perfil y devuelve la URL pública.
   * Usa el bucket "materiales" con subcarpeta "fotos-perfil/".
   */
  async subir(file: File, folder: string, fileName: string): Promise<string> {
    const path = `fotos-perfil/${folder}/${fileName}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (error) throw new Error(error.message);

    const { data: publicUrlData } = this.supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  /**
   * Elimina una foto de perfil por su URL.
   */
  async eliminar(url: string): Promise<void> {
    const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
    if (!url.startsWith(prefix)) return;
    const path = url.slice(prefix.length);

    await this.supabase.storage.from(BUCKET).remove([path]);
  }
}
