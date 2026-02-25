/* componente root dell'app: gestisco header, navigazione principale e logout */

import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  /* nome tag usato in index.html */
  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
  ],

  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    /* controllo se esiste token */
    return this.authService.isLoggedIn();
  }

  isAuthRoute(): boolean {
    /* su /auth non devo mostrare header */
    return this.router.url.startsWith('/auth');
  }

  goHome(): void {
    /* logo cliccabile:
       se loggata vado alla pagina principale utenti,
       altrimenti torno al login */
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/users');
      return;
    }

    this.router.navigateByUrl('/auth');
  }

  logout(): void {
    /* cancello token */
    this.authService.logout();

    /* redirect al login */
    this.router.navigateByUrl('/auth');
  }
}
