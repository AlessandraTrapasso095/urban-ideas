/* avvio applicazione e monto il componente root */

import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  /* avvio dell'app */
  .catch((err) => console.error(err));
  /* se il bootstrap fallisce loggo errore in console */
