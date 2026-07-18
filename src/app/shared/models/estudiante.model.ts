export interface Estudiante {
  codigo: string;
  nombre: string;
  email: string;
  salon: string;
  carrera: string;
  estado: 'Activo' | 'Pendiente';
}
