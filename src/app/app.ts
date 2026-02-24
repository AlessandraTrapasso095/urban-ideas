import { Component } from '@angular/core';
/* Component = definisco il componente root */

import { RouterOutlet, RouterLink, Router } from '@angular/router';
/* RouterOutlet = punto dove vengono caricate le pagine */
/* RouterLink = per creare link nel template */
/* Router = per fare redirect nel logout */

import { MatToolbarModule } from '@angular/material/toolbar';
/* toolbar Material */

import { MatButtonModule } from '@angular/material/button';
/* bottoni Material */

import { CommonModule } from '@angular/common';
/* mi serve per *ngIf */

import { AuthService } from './core/services/auth.service';
/* mi serve per sapere se sono loggata e per fare logout */

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
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
