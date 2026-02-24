/* controlla se l'utente può entrare in una rotta, blocca l'accsso se non autenticato
ed eventualmente reinderizza al login */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const authGuard: CanActivateFn = (route, state) => {
  /* route = info sulla rotta corrente
     state = info sull'URL che sto cercando di aprire */

  const authService = inject(AuthService);
  /* mi prendo AuthService */

  const router = inject(Router);
  /* mi prendo Router per poter fare redirect */

  if (authService.isLoggedIn()) {
    /* se esiste il token posso entrare */
    return true;
  }

  /* se non sono loggata, non posso entrare */

  return router.createUrlTree(['/auth']);
  /* invece di true/false faccio redirect al login */
};
