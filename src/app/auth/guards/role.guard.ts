import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (requiredRole: UserRole) => async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.isInitialized;

  if (auth.getUserRole() === requiredRole) {
    return true;
  }

  return router.parseUrl('/login');
};
