import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (requiredRole: UserRole) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getUserRole() === requiredRole) {
    return true;
  }

  return router.parseUrl('/login');
};
