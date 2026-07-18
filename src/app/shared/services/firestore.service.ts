import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentReference,
  WithFieldValue,
  QueryConstraint,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

/**
 * Servicio genérico para operaciones CRUD contra Firestore.
 * Cada instancia trabaja sobre una colección específica.
 *
 * @example
 * ```ts
 * class EstudiantesService extends FirestoreCollectionService<Estudiante> {
 *   constructor() {
 *     super('estudiantes');
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class FirestoreCollectionService<T extends { id?: string }> {
  protected readonly firestore = inject(Firestore);
  protected readonly collectionRef;

  constructor(protected collectionName: string) {
    this.collectionRef = collection(this.firestore, collectionName);
  }

  /** Obtiene todos los documentos de la colección como observable */
  getAll(...constraints: QueryConstraint[]): Observable<T[]> {
    const q = constraints.length > 0
      ? query(this.collectionRef, ...constraints)
      : query(this.collectionRef, orderBy('__name__'));

    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  /** Obtiene un documento por su ID */
  getById(id: string): Observable<T | undefined> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<T | undefined>;
  }

  /** Crea un nuevo documento; devuelve el ID generado */
  async create(data: WithFieldValue<T>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, data as any);
    return docRef.id;
  }

  /** Actualiza parcialmente un documento por ID */
  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(docRef, data as any);
  }

  /** Elimina un documento por ID */
  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(docRef);
  }

  /** Busca documentos donde un campo coincida con un valor */
  findBy(field: string, value: any): Observable<T[]> {
    const q = query(this.collectionRef, where(field, '==', value));
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }
}
