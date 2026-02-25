/* gestisce creazione e modifica di un post con validazione form e chiamate API */

import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PostsService } from '../../../users/services/posts.service';
import { Post, CreatePostDto } from '../../../users/models/gorest-models.model';
import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';

interface PostDialogData {
  /* dati opzionali che posso passare al dialog */
  post?: Post;
}

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
  private dialogData = inject<PostDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  /* se apro in modalità edit, qui arriva il post da modificare */

  private cdr = inject(ChangeDetectorRef);

  private readonly editPost = this.dialogData?.post ?? null;
  /* riferimento al post da modificare (se presente) */

  readonly isEditMode = !!this.editPost;
  /* true se il dialog è stato aperto per modifica */

  readonly dialogTitle = this.isEditMode ? 'Modifica post' : 'Nuovo post';
  /* titolo dinamico del dialog */

  readonly submitLabel = this.isEditMode ? 'Salva modifiche' : 'Crea';
  /* etichetta bottone conferma */

  readonly submittingLabel = this.isEditMode ? 'Salvataggio...' : 'Invio...';
  /* etichetta bottone mentre sto inviando */

  form = this.fb.nonNullable.group({
    user_id: [0, [Validators.required, Validators.min(1)]],
    /* user_id deve essere > 0 */

    title: ['', [Validators.required, Validators.minLength(3)]],

    body: ['', [Validators.required, Validators.minLength(3)]],
  });

  isSubmitting = false;
  /* loading invio */

  errorMessage = '';
  /* errore invio */

  constructor() {
    /* se sono in edit, precompilo il form con i dati del post */
    if (!this.editPost) return;

    this.form.patchValue({
      user_id: this.editPost.user_id,
      title: this.editPost.title,
      body: this.editPost.body,
    });
  }

  cancel(): void {
    /* chiudo senza creare */
    this.dialogRef.close(undefined);
  }

  submit(): void {
    /* valido e invio:
       - POST se creo
       - PUT se modifico */

    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreatePostDto = {
      user_id: Number(this.form.controls.user_id.value),

      title: this.form.controls.title.value.trim(),
      body: this.form.controls.body.value.trim(),
    };

    this.isSubmitting = true;

    const request$ =
      this.isEditMode && this.editPost
        ? this.postsService.updatePost(this.editPost.id, dto)
        : this.postsService.createPost(dto);

    const actionLabel = this.isEditMode ? 'modifica post' : 'creazione post';
    /* etichetta usata nel messaggio errore */

    request$.subscribe({
      next: (created: Post) => {

        setTimeout(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          /* forzo refresh view */
          this.dialogRef.close(created);
        }, 0);
      },

      error: (err: any) => {

        setTimeout(() => {
          this.isSubmitting = false;

          const serverDetails =
            Array.isArray(err?.error)
              ? err.error.map((e: any) => `${e.field}: ${e.message}`).join(' | ')
              : '';

          const base = buildHttpErrorMessage(actionLabel, err);

          this.errorMessage = serverDetails
            ? `${base} - ${serverDetails}`
            : base;

          this.cdr.detectChanges();
        }, 0);
      },
    });
  }
}
