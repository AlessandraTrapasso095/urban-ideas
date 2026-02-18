/* controlla se l'utente può entrare in una rota, blocca l'accsso se non autenticato
ed eventualmente reinderizza al login */

import { inject } from '@angular/core';
/* inject mi permette di usare servizi senza constructor */

import { CanActivateFn, Router } from '@angular/router';
/* CanActivateFn = tipo della guard
   Router = mi serve per fare redirect */

import { AuthService } from '../services/auth.service';
/* importo il mio AuthService per controllare se esiste il token */

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
