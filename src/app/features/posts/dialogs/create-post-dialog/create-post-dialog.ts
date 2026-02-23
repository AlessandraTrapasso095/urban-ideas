import { Component, inject, ChangeDetectorRef } from '@angular/core';
/* Component = definisco componente */
/* inject = dependency injection moderna */
/* ChangeDetectorRef = mi permette di forzare il refresh della view */

import { CommonModule } from '@angular/common';
/* CommonModule = *ngIf */

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
/* ReactiveFormsModule = reactive forms */
/* FormBuilder = costruisco form in modo pulito */
/* Validators = validazioni pronte */

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
/* MatDialogModule = struttura dialog */
/* MatDialogRef = riferimento al dialog per chiuderlo */

import { MatButtonModule } from '@angular/material/button';
/* bottoni Material */

import { MatFormFieldModule } from '@angular/material/form-field';
/* wrapper input */

import { MatInputModule } from '@angular/material/input';
/* input e textarea */

import { PostsService } from '../../../users/services/posts.service';
/* chiamate API post */

import { Post, CreatePostDto } from '../../../users/models/gorest-models.model';
/* tipi DRY */

import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
/* DRY: messaggio errore standard */

@Component({
  selector: 'app-create-post-dialog',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],

  templateUrl: './create-post-dialog.html',
  styleUrl: './create-post-dialog.scss',
})
export class CreatePostDialog {
  /* dialog per creare un nuovo post */

  private fb = inject(FormBuilder);
  /* prendo FormBuilder */

  private postsService = inject(PostsService);
  /* prendo PostsService */

  private dialogRef = inject(MatDialogRef<CreatePostDialog>);
  /* riferimento dialog */

  private cdr = inject(ChangeDetectorRef);
  /* mi serve per evitare NG0100 nei dialog */

  form = this.fb.nonNullable.group({
    user_id: [0, [Validators.required, Validators.min(1)]],
    /* user_id deve essere > 0 */

    title: ['', [Validators.required, Validators.minLength(3)]],
    /* titolo obbligatorio */

    body: ['', [Validators.required, Validators.minLength(3)]],
    /* testo obbligatorio */
  });

  isSubmitting = false;
  /* loading invio */

  errorMessage = '';
  /* errore invio */

  cancel(): void {
    /* chiudo senza creare */
    this.dialogRef.close(undefined);
  }

  submit(): void {
    /* valido e invio POST */

    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreatePostDto = {
      user_id: Number(this.form.controls.user_id.value),
      /* IMPORTANTISSIMO: forzo user_id a number */

      title: this.form.controls.title.value.trim(),
      body: this.form.controls.body.value.trim(),
    };

    this.isSubmitting = true;

    this.postsService.createPost(dto).subscribe({
      next: (created: Post) => {
        /* rimando update stato per evitare NG0100 */

        setTimeout(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          /* forzo refresh view */
          this.dialogRef.close(created);
        }, 0);
      },

      error: (err: any) => {
        /* rimando update stato per evitare NG0100 */

        setTimeout(() => {
          this.isSubmitting = false;

          const serverDetails =
            Array.isArray(err?.error)
              ? err.error.map((e: any) => `${e.field}: ${e.message}`).join(' | ')
              : '';

          const base = buildHttpErrorMessage('creazione post', err);

          this.errorMessage = serverDetails
            ? `${base} - ${serverDetails}`
            : base;

          this.cdr.detectChanges();
          /* forzo refresh view */
        }, 0);
      },
    });
  }
}
