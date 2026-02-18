/* per intercettare ogni richiesta HTTP che parte dall'app*/

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  /* mi prendo AuthService senza constructor */

  const token = authService.getToken();
  /* leggo il token salvato */

  if (!token) {
    /* se non ho token, non modifico la request */
    return next(req);
  }

  const authReq = req.clone({ /* clono req */
    setHeaders: {
      Authorization: `Bearer ${token}`,
      /* aggiungo header per GoREST */
    },
  });

  return next(authReq);
  /* faccio proseguire la request, ma con l'header aggiunto */
};
