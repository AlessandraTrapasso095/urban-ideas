/* rotte dell'app */

import { authGuard } from './core/guards/auth-guard';
import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    /* root dell'app, cioè quando entro su localhost */

    pathMatch: 'full',
    /* così evito che faccia match strani */

    redirectTo: 'auth',
    /* se sono sulla root mi manda direttamente alla pagina di login */
  },

  {
    path: 'auth',
    /* rotta per il login */

    loadComponent: () =>

      import('./features/auth/pages/login/login')

        .then((m) => m.Login),
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
  },

  {
    path: 'users/:id',
    /* rotta dettaglio utente */

    canActivate: [authGuard],
    /* proteggo anche questa rotta: serve token */

    loadComponent: () =>
      import('./features/users/pages/user-detail/user-detail').then(
        (m) => m.UserDetail
      ),
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
    /* qui il nome deve combaciare con l'export del file posts-list.ts */
  },

  {
    path: '**',
    /* per intercettare qualsiasi URL non definito sopra */

    redirectTo: 'auth',
    /* se l'utente scrive un URL sbagliato, lo riporto al login per sicurezza */
  },
];
