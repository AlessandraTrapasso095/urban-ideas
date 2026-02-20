import { Component, inject } from '@angular/core';
/* Component = definisco componente */
/* inject = dependency injection moderna senza constructor */

import { CommonModule } from '@angular/common';
/* CommonModule = per *ngIf e *ngFor nel template */

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
/* ReactiveFormsModule = abilita reactive forms */
/* FormBuilder = costruisco il form in modo pulito */
/* Validators = validazioni pronte */

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
/* MatDialogModule = struttura dialog */
/* MatDialogRef = riferimento al dialog aperto (chiusura + valore di ritorno) */
/* MAT_DIALOG_DATA = dati passati dal componente che apre il dialog */

import { MatButtonModule } from '@angular/material/button';
/* bottoni Material */

import { MatFormFieldModule } from '@angular/material/form-field';
/* wrapper input Material */

import { MatInputModule } from '@angular/material/input';
/* input Material */

import { MatSelectModule } from '@angular/material/select';
/* select Material */

import { UsersService, CreateUserDto, User, UserGender, UserStatus } from '../..//users/services/users.service';
/* UsersService = chiamate API (lo useremo dopo per POST/PUT) */
/* CreateUserDto = payload di creazione (lo useremo dopo) */
/* User = tipo utente */
/* UserGender/UserStatus = union types */

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],

  templateUrl: './create-user-dialog.html',
  styleUrl: './create-user-dialog.scss',
})
export class CreateUserDialog {
  /* questo dialog serve sia per CREATE che per EDIT */

  private fb = inject(FormBuilder);
  /* prendo FormBuilder */

  private usersService = inject(UsersService);
  /* prendo il service (lo useremo nello step successivo per POST/PUT) */

  private dialogRef = inject(MatDialogRef<CreateUserDialog>);
  /* riferimento al dialog per chiuderlo */

  data = inject(MAT_DIALOG_DATA) as { user?: User } | null;
  /* data può contenere user se siamo in EDIT; se null/undefined siamo in CREATE */

  isEditMode = !!this.data?.user;
  /* true se ho ricevuto un utente -> EDIT */

  title = this.isEditMode ? 'Modifica utente' : 'Nuovo utente';
  /* titolo dinamico */

  submitLabel = this.isEditMode ? 'Salva' : 'Crea';
  /* testo bottone dinamico */

  genders: readonly UserGender[] = ['male', 'female'];
  /* valori validi */

  statuses: readonly UserStatus[] = ['active', 'inactive'];
  /* valori validi */

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    /* nome obbligatorio */

    email: ['', [Validators.required, Validators.email]],
    /* email obbligatoria e valida */

    gender: ['female' as UserGender, [Validators.required]],
    /* valore iniziale gender */

    status: ['active' as UserStatus, [Validators.required]],
    /* valore iniziale status */
  });
  /* creo il form */

  isSubmitting = false;
  /* quando invieremo al server lo useremo per bloccare i bottoni */

  errorMessage = '';
  /* eventuale errore */

  constructor() {
    /* uso constructor solo per eseguire logica dopo la creazione dell'istanza */

    if (this.isEditMode && this.data?.user) {
      /* se sono in edit e ho l'utente */

      this.form.patchValue({
        name: this.data.user.name ?? '',
        email: this.data.user.email ?? '',
        gender: this.data.user.gender,
        status: this.data.user.status,
      });
      /* precompilo il form con i valori esistenti */
    }
  }


  cancel(): void {
    /* chiudo senza fare nulla */

    this.dialogRef.close(undefined);
    /* restituisco undefined al chiamante */
  }

  submit(): void {
  /* questo metodo valida e poi invia POST (create) oppure PUT (edit) */

  this.errorMessage = '';
  /* resetto eventuali errori precedenti */

  if (this.form.invalid) {
    /* se il form non è valido non continuo */

    this.form.markAllAsTouched();
    /* forzo la visualizzazione degli errori sui campi */

    return;
    /* esco */
  }

  const dto: CreateUserDto = {
    /* costruisco il payload come lo vuole GoREST */

    name: this.form.controls.name.value.trim(),
    /* prendo name e tolgo spazi inutili */

    email: this.form.controls.email.value.trim(),
    /* prendo email e tolgo spazi inutili */

    gender: this.form.controls.gender.value,
    /* prendo gender dal form */

    status: this.form.controls.status.value,
    /* prendo status dal form */
  };

  this.isSubmitting = true;
  /* blocco i bottoni mentre invio la richiesta */

  const request$ = this.isEditMode && this.data?.user
    ? this.usersService.updateUser(this.data.user.id, dto)
    /* se sono in edit chiamo PUT /users/:id */
    : this.usersService.createUser(dto);
    /* se sono in create chiamo POST /users */

  request$
    .pipe(
      finalize(() => {
        this.isSubmitting = false;
        /* qualunque cosa succeda, sblocco i bottoni */
      })
    )
    .subscribe({
      next: (savedUser: User) => {
        /* se va a buon fine, ricevo l'utente salvato (creato o aggiornato) */

        this.dialogRef.close(savedUser);
        /* chiudo il dialog e restituisco al chiamante l'utente aggiornato */
      },
      error: (err: unknown) => {
        /* se fallisce, mostro un messaggio */

        const status =
          typeof err === 'object' && err !== null && 'status' in err
            ? (err as { status?: number }).status
            : undefined;
        /* leggo status in modo safe */

        this.errorMessage = this.isEditMode
          ? `Errore modifica utente (status: ${status ?? 'unknown'})`
          : `Errore creazione utente (status: ${status ?? 'unknown'})`;
        /* messaggio diverso tra create/edit */
      },
    });
}
}
