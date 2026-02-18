/* qui configuro router, http client, interceptor, provider globali */

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideRouter } from '@angular/router';
/* provideRouter = abilito il routing usando le rotte definite in app.routes.ts */

import { provideHttpClient, withInterceptors } from '@angular/common/http';
/* provideHttpClient = abilito HttpClient in tutta l'app
   withInterceptors = registro uno o più interceptor globali */

import { routes } from './app.routes';
/* importo le rotte dell'app */

import { authTokenInterceptor } from './core/interceptors/auth-token-interceptor';
/* importo l'interceptor che aggiunge il Bearer Token alle richieste */

export const appConfig: ApplicationConfig = {
  /* contiene tutti i provider globali dell'app */

  providers: [
    /* lista di "servizi/config" che voglio disponibili globalmente */

    provideBrowserGlobalErrorListeners(),
    /* attivo listener globali sugli errori del browser */

    provideRouter(routes),
    /* attivo il router usando le rotte definite in routes */

    provideHttpClient(
      withInterceptors([authTokenInterceptor])
      /* registro l'interceptor:
         ogni chiamata HttpClient passerà da authTokenInterceptor */
    ),
  ],
};
