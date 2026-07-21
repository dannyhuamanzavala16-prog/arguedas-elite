import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const SUPABASE_URL = environment.supabase.url;
const SUPABASE_ANON_KEY = environment.supabase.anonKey;
const BUCKET = 'fotos-perfil';

@Injectable({ providedIn: 'root' })
export class FotoService {
  private readonly supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /**
   * Sube una foto de perfil y devuelve la URL pública.
   * @param file Archivo de imagen (jpeg, png, gif, webp)
   * @param folder Subcarpeta (ej: 'docentes', 'estudiantes')
   * @param fileName Nombre único con extensión (ej: 'DOC001.jpg')
   */
  async subir(file: File, folder: string, fileName: string): Promise<string> {
    const path = `${folder}/${fileName}`;

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
    // Extraer el path de la URL pública
    const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
    if (!url.startsWith(prefix)) return;
    const path = url.slice(prefix.length);

    await this.supabase.storage.from(BUCKET).remove([path]);
  }
}
