import 'zone.js';
/* abilito Zone.js:
   così Angular rileva automaticamente aggiornamenti async
   (HTTP, setTimeout, subscribe) e aggiorna la UI */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
