export interface Docente {
  id?: string;
  createdAt?: string;
  codigo: string;
  nombre: string;
  email: string;
  especialidad: string;
  cursos: string[];
  estado: 'Activo' | 'Pendiente';
}
