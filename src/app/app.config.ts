/* qui configuro router, http client, interceptor, provider globali */

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token-interceptor';
export const appConfig: ApplicationConfig = {

  providers: [
    provideBrowserGlobalErrorListeners(),
    /* attivo listener sugli errori del browser */

    provideRouter(routes),
    /* attivo il router usando le rotte definite in routes */

    provideHttpClient(
      withInterceptors([authTokenInterceptor])
      /* ogni chiamata HttpClient passerà da authTokenInterceptor */
    ),
  ],
};
