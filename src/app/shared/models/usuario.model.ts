export type UserRole = 'admin' | 'docente' | 'estudiante';

export interface Usuario {
  username: string;
  role: UserRole;
  nombre: string;
  email: string;
}
