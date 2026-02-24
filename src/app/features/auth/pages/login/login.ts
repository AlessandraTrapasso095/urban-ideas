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

const GOREST_TOKEN_PATTERN = /^[A-Za-z0-9_-]{30,}$/;
/* pattern "ragionevole" per token API:
   almeno 30 caratteri alfanumerici (più _ e -) */

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

    validators: [
      Validators.required,
      Validators.pattern(GOREST_TOKEN_PATTERN),
    ],
    /* required = token obbligatorio
       pattern = formato token plausibile */
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

    const rawToken = this.tokenControl.value.trim();
    /* leggo valore inserito e rimuovo spazi esterni */

    const token = rawToken.replace(/^Bearer\s+/i, '').trim();
    /* se l'utente incolla "Bearer <token>", tengo solo il token */

    if (!GOREST_TOKEN_PATTERN.test(token)) {
      /* validazione finale difensiva (DRY col pattern sopra) */
      this.tokenControl.setErrors({ tokenFormat: true });
      this.tokenControl.markAsTouched();
      return;
    }

    this.authService.setToken(token);
    /* salvo token nel localStorage tramite AuthService */

    this.router.navigateByUrl('/users');
    /* dopo il login mando l'utente alla lista utenti */
  }
}
