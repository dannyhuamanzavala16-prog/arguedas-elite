import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Docente } from '../../shared/models/docente.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';

@Injectable({ providedIn: 'root' })
export class DocentesService extends FirestoreCollectionService<Docente> {
  private readonly auth = inject(Auth);

  readonly docentes = toSignal(this.getAll(), { initialValue: [] as Docente[] });

  constructor() {
    super('docentes');
  }

  /** Calcula el próximo código disponible sin persistir nada */
  previewNextCodigo(): { docId: string; codigo: string } {
    const list = this.docentes();
    let nextNum = 1;
    if (list.length > 0) {
      const numbers = list
        .map((d) => {
          // Soporta formato viejo (#DOC-2025-001) y nuevo (#DOC001)
          const match = d.codigo.match(/(\d+)$/);
          return match ? parseInt(match[1], 10) : NaN;
        })
        .filter((num) => !isNaN(num));
      if (numbers.length > 0) {
        nextNum = Math.max(...numbers) + 1;
      }
    }
    const padded = String(nextNum).padStart(3, '0');
    const docId = `DOC${padded}`;
    return { docId, codigo: `#${docId}` };
  }

  /**
   * Registra un docente:
   * 1. Genera código correlativo (ej: #DOC001)
   * 2. Crea cuenta en Firebase Auth con email = {código}@arguedas.edu.pe
   * 3. Crea documento en usuarios/{uid} con rol 'docente'
   * 4. Crea documento en docentes/{docId}
   *
   * El código (sin #) se usa como username y contraseña inicial.
   *
   * @returns El código generado (ej: #DOC001)
   */
  async crear(data: Omit<Docente, 'codigo' | 'createdAt' | 'email'>): Promise<string> {
    const { docId, codigo } = this.previewNextCodigo();
    const email = `${docId}@arguedas.edu.pe`;

    // 1. Crear cuenta en Firebase Auth
    const userCred = await createUserWithEmailAndPassword(this.auth, email, docId);

    // 2. Crear documento en usuarios/{uid}
    await setDoc(doc(this.firestore, 'usuarios', userCred.user.uid), {
      username: docId,
      role: 'docente' as const,
      nombre: data.nombre,
      email,
      foto: data.foto ?? '',
    });

    // 3. Crear documento en docentes/{docId}
    await setDoc(doc(this.firestore, 'docentes', docId), {
      nombre: data.nombre,
      email,
      especialidad: data.especialidad,
      cursos: data.cursos,
      estado: data.estado,
      foto: data.foto ?? '',
      codigo,
      createdAt: new Date().toISOString(),
    });

    return codigo;
  }

  async actualizar(codigo: string, cambios: Partial<Docente>): Promise<void> {
    const docId = codigo.replace('#', '');
    await this.update(docId, cambios);

    // Si incluye foto, actualizar también en usuarios/{uid}
    if (cambios.foto !== undefined) {
      const q = query(collection(this.firestore, 'usuarios'), where('username', '==', docId));
      const snapshot = await getDocs(q);
      snapshot.forEach((d) => updateDoc(doc(this.firestore, `usuarios/${d.id}`), { foto: cambios.foto }));
    }
  }

  async eliminar(codigo: string): Promise<void> {
    await this.delete(codigo.replace('#', ''));
  }

  getEspecialidades(): string[] {
    return [...new Set(this.docentes().map((d) => d.especialidad))];
  }
}
