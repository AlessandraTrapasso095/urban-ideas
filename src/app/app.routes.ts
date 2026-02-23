/* definisco le rotte (URL) dell'app */

import { authGuard } from './core/guards/auth-guard';

import { Routes } from '@angular/router';
/* importo Routes da angular router perché
mi serve per tipizzare le rotte */

export const routes: Routes = [
  {
    path: '',
    /* root dell'app, cioè quando entro su http://localhost:4200 */

    pathMatch: 'full',
    /* matcha solo se l'URL è ESATTAMENTE vuoto,
       così evito che faccia match parziali strani */

    redirectTo: 'auth',
    /* se sono sulla root mi manda direttamente alla pagina di login */
  },

  {
    path: 'auth',
    /* rotta per il login */

    loadComponent: () =>
      /* uso loadComponent perché sono in standalone
         e voglio fare lazy loading (carica solo quando serve) */

      import('./features/auth/pages/login/login')
        /* import dinamico → crea uno chunk separato */

        .then((m) => m.Login),
    /* m è il modulo importato dinamicamente e io prendo il LoginComponent da lì */
  },

  {
    path: 'users',
    /* pagina lista utenti */

    canActivate: [authGuard],
    /* proteggo questa rotta */

    loadComponent: () =>
      import('./features/users/pages/users-list/users-list').then(
        (m) => m.UsersList
      ),
    /* stesso concetto che ho fatto sopra, lazy loading */
  },

  {
    path: 'users/:id',
    /* rotta dettaglio utente: :id è un parametro dinamico (es. /users/123) */

    canActivate: [authGuard],
    /* proteggo anche questa rotta: serve token */

    loadComponent: () =>
      import('./features/users/pages/user-detail/user-detail').then(
        (m) => m.UserDetail
      ),
    /* lazy loading: carico la pagina dettaglio solo quando serve */
  },

  {
    path: 'posts',
    /* pagina lista post */

    canActivate: [authGuard],
    /* proteggo anche questa */

    loadComponent: () =>
      import('./features/posts/pages/posts-list/posts-list').then(
        (m) => m.PostListComponent
      ),
    /* qui il nome DEVE combaciare con l'export del file posts-list.ts */
  },

  {
    path: '**',
    /* wildcard → per intercettare qualsiasi URL non definito sopra */

    redirectTo: 'auth',
    /* se l'utente scrive un URL sbagliato, lo riporto al login per sicurezza */
  },
];
