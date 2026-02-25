/* dialog creazione/modifica utente: gestisce form reactive, validazione e salvataggio via API */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from '../../services/users.service';
import { CreateUserDto, User, UserGender, UserStatus } from '../../models/gorest-models.model';
import { finalize } from 'rxjs/operators';
import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';

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

  private usersService = inject(UsersService);

  private dialogRef = inject(MatDialogRef<CreateUserDialog>);
  /* riferimento al dialog per chiuderlo */

  data = inject(MAT_DIALOG_DATA) as { user?: User } | null;
  /* data può contenere user se in EDIT; se null/undefined è in CREATE */

  isEditMode = !!this.data?.user;
  /* true se ho ricevuto un utente = EDIT */

  title = this.isEditMode ? 'Modifica utente' : 'Nuovo utente';

  submitLabel = this.isEditMode ? 'Salva' : 'Crea';

  genders: readonly UserGender[] = ['male', 'female'];

  statuses: readonly UserStatus[] = ['active', 'inactive'];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],

    email: ['', [Validators.required, Validators.email]],

    gender: ['female' as UserGender, [Validators.required]],

    status: ['active' as UserStatus, [Validators.required]],
  });

  isSubmitting = false;
  /* quando invio al server lo uso per bloccare i bottoni */

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
    /* restituisco undefined */
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

    const request$ =
      this.isEditMode && this.data?.user
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
          /* se va a buon fine, ricevo l'utente salvato */

          this.dialogRef.close(savedUser);
          /* chiudo il dialog e restituisco l'utente aggiornato */
        },
        error: (err: unknown) => {
         this.errorMessage = this.isEditMode
           ? buildHttpErrorMessage('modifica utente', err)
           : buildHttpErrorMessage('creazione utente', err);
          },
      });
  }
}
