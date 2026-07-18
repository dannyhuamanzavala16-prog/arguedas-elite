export interface Docente {
  codigo: string;
  nombre: string;
  email: string;
  especialidad: string;
  cursos: string[];
  estado: 'Activo' | 'Pendiente';
}
