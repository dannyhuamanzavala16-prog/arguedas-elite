import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { doc, setDoc } from '@angular/fire/firestore';
import { Estudiante } from '../../shared/models/estudiante.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';

@Injectable({ providedIn: 'root' })
export class EstudiantesService extends FirestoreCollectionService<Estudiante> {
  private readonly auth = inject(Auth);

  /** Lista reactiva — se actualiza automáticamente cuando Firestore cambia */
  readonly estudiantes = toSignal(this.getAll(), { initialValue: [] as Estudiante[] });

  constructor() {
    super('estudiantes');
  }

  /**
   * Calcula el próximo código disponible para un ciclo sin persistir nada.
   * @param ciclo 'I' o 'II'
   */
  previewNextCodigo(ciclo: 'I' | 'II'): { docId: string; codigo: string } {
    const prefix = ciclo === 'I' ? 'AEI' : 'AEII';
    const list = this.estudiantes();
    const delCiclo = list.filter((e) => e.codigo.startsWith(`#${prefix}`));
    let nextNum = 1;
    if (delCiclo.length > 0) {
      const numbers = delCiclo
        .map((e) => {
          const numPart = e.codigo.replace(`#${prefix}`, '');
          return parseInt(numPart, 10);
        })
        .filter((num) => !isNaN(num));
      if (numbers.length > 0) {
        nextNum = Math.max(...numbers) + 1;
      }
    }
    const padded = String(nextNum).padStart(ciclo === 'I' ? 4 : 3, '0');
    const docId = `${prefix}${padded}`;
    return { docId, codigo: `#${docId}` };
  }

  /**
   * Registra un estudiante:
   * 1. Genera código correlativo (ej: #AEI0001 o #AEII001)
   * 2. Crea cuenta en Firebase Auth con email = {código}@arguedas.edu.pe
   * 3. Crea documento en usuarios/{uid} con rol 'estudiante'
   * 4. Crea documento en estudiantes/{docId}
   *
   * El código (sin #) se usa como username y contraseña inicial.
   *
   * @param ciclo 'I' o 'II' — determina el formato del código
   * @returns El código generado (ej: #AEI0001)
   */
  async crear(est: Omit<Estudiante, 'codigo' | 'createdAt' | 'email'>, ciclo: 'I' | 'II'): Promise<string> {
    const { docId, codigo } = this.previewNextCodigo(ciclo);
    const email = `${docId}@arguedas.edu.pe`;

    // 1. Crear cuenta en Firebase Auth
    const userCred = await createUserWithEmailAndPassword(this.auth, email, docId);

    // 2. Crear documento en usuarios/{uid}
    await setDoc(doc(this.firestore, 'usuarios', userCred.user.uid), {
      username: docId,
      role: 'estudiante' as const,
      nombre: est.nombre,
      email,
    });

    // 3. Crear documento en estudiantes/{docId}
    await setDoc(doc(this.firestore, 'estudiantes', docId), {
      nombre: est.nombre,
      email,
      salon: est.salon,
      carrera: est.carrera,
      estado: est.estado,
      codigo,
      createdAt: new Date().toISOString(),
    });

    return codigo;
  }

  async actualizar(codigo: string, cambios: Partial<Estudiante>): Promise<void> {
    await this.update(codigo.replace('#', ''), cambios);
  }

  async eliminar(codigo: string): Promise<void> {
    await this.delete(codigo.replace('#', ''));
  }

  getByCodigo(codigo: string): Estudiante | undefined {
    return this.estudiantes().find((e) => e.codigo === codigo);
  }

  getCarreras(): string[] {
    return [...new Set(this.estudiantes().map((e) => e.carrera))];
  }
}
