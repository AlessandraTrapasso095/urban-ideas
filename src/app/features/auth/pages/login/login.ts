/* pagina login: qui inserisco il token GoREST e lo salvo */

import { CommonModule } from '@angular/common';
/* CommonModule contiene direttive base come *ngIf, *ngFor ecc. */

import { Component } from '@angular/core';

import { Router } from '@angular/router';
/* Router mi serve per reindirizzare dopo il login */

import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../../core/services/auth.service';
/* importo AuthService per salvare/leggere il token */

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
  CommonModule,
  /* mi serve per usare *ngIf nel template */

  ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
    /* componenti Angular Material che userò nell'HTML */
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  /* creo un form control per il token */

  tokenControl = new FormControl('', {
    nonNullable: true,
    /* così tokenControl.value è sempre una stringa (mai null) */

    validators: [Validators.required],
    /* obbligo l'utente a inserire qualcosa */
  });

  constructor(
    private authService: AuthService,
    /* mi serve per salvare il token */

    private router: Router
    /* mi serve per navigare dopo il login */
  ) {}

  login(): void {
    /* funzione chiamata quando clicco il bottone */

    if (this.tokenControl.invalid) {
      /* se il campo è vuoto/non valido, mi fermo */
      this.tokenControl.markAsTouched();
      /* segno il campo come "toccato" così si vede l'errore */
      return;
    }

    const token = this.tokenControl.value.trim();
    /* prendo il valore e tolgo spazi iniziali/finali */

    this.authService.setToken(token);
    /* salvo token nel localStorage tramite AuthService */

    this.router.navigateByUrl('/users');
    /* dopo il login mando l'utente alla lista utenti */
  }
}
