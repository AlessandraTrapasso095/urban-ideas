/* componente commenti per un singolo post */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
/* Component = definisco componente
   Input = ricevo postId
   OnChanges = reagisco quando cambia postId */

import { CommonModule } from '@angular/common';
/* CommonModule = *ngIf *ngFor */

import { FormsModule } from '@angular/forms';
/* FormsModule = necessario per [(ngModel)] */

import { finalize } from 'rxjs/operators';
/* finalize = spengo loading sempre */

import { PostsService } from '../../services/posts.service';
/* chiamo API commenti + creazione commento */

import { Comment, CreateCommentDto } from '../../models/gorest-models.model';
/* tipi condivisi DRY */

import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
/* DRY: messaggi errore standard */

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-comments.html',
  styleUrl: './post-comments.scss',
})
export class PostCommentsComponent implements OnChanges {
  @Input({ required: true }) postId!: number;
  /* id del post ricevuto dal padre */

  isLoading = false;
  /* loading commenti */

  errorMessage = '';
  /* errore commenti */

  comments: Comment[] = [];
  /* lista commenti */

  isSubmitting = false;
  /* loading invio commento */

  submitError = '';
  /* errore invio commento */

  draft: CreateCommentDto = { name: '', email: '', body: '' };
  /* bozza commento */

  constructor(private postsService: PostsService) {
    /* inietto PostsService per chiamare API commenti */
  }

  ngOnChanges(changes: SimpleChanges): void {
    /* quando cambia postId ricarico i commenti */

    if (changes['postId']) {
      const id = Number(this.postId);

      if (!id || id <= 0) {
        this.comments = [];
        this.errorMessage = 'Post non valido.';
        return;
      }

      this.loadComments();
    }
  }

  private loadComments(): void {
    /* carico commenti del post */

    this.isLoading = true;
    this.errorMessage = '';
    this.comments = [];

    this.postsService
      .getPostComments(this.postId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (items: Comment[]) => {
          this.comments = items ?? [];
        },
        error: (err: unknown) => {
          this.errorMessage = buildHttpErrorMessage('caricamento commenti', err);
        },
      });
  }

  submit(): void {
    /* invio commento */

    const dto: CreateCommentDto = {
      name: this.draft.name.trim(),
      email: this.draft.email.trim(),
      body: this.draft.body.trim(),
    };

    if (!dto.name || !dto.email || !dto.body) {
      this.submitError = 'Compila tutti i campi.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    this.postsService
      .createComment(this.postId, dto)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (created: Comment) => {
          this.comments = [created, ...this.comments];
          this.draft = { name: '', email: '', body: '' };
        },
        error: (err: unknown) => {
          this.submitError = buildHttpErrorMessage('invio commento', err);
        },
      });
  }
}
