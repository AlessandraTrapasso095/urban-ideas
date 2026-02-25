/* componente commenti post: carica elenco commenti e permette inserimento nuovo commento */

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostsService } from '../../services/posts.service';
import { Comment, CreateCommentDto } from '../../models/gorest-models.model';
import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
import { runInAngular } from '../../../../core/utils/run-in-angular';

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-comments.html',
  styleUrl: './post-comments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCommentsComponent implements OnChanges {
  private postsService = inject(PostsService);
  /* service per chiamate commenti */
  private destroyRef = inject(DestroyRef);
  /* riferimento ciclo vita per cleanup subscription */
  private cdr = inject(ChangeDetectorRef);
  /* forzo refresh template quando aggiorno stato async */
  private ngZone = inject(NgZone);
  /* eseguo update stato nel contesto Angular */

  @Input({ required: true }) postId!: number;
  /* id del post passato dal componente padre */

  comments: Comment[] = [];
  /* lista commenti caricati per il post */
  isLoading = false;
  /* true mentre carico i commenti */
  errorMessage = '';
  /* messaggio errore caricamento commenti */

  isSubmitting = false;
  /* true mentre invio un nuovo commento */
  submitError = '';
  /* messaggio errore invio commento */

  draft: CreateCommentDto = {
    name: '',
    email: '',
    body: '',
  };
  /* bozza del form nuovo commento */

  ngOnChanges(changes: SimpleChanges): void {
    /* se cambia postId ricarico i commenti del post corrente */
    if ('postId' in changes) {
      const id = Number(this.postId);
      /* converto in numero per validazione */

      if (!id || id <= 0) {
        /* id non valido: reset stato e mostro messaggio */
        runInAngular(this.ngZone, this.cdr, () => {
          this.comments = [];
          this.isLoading = false;
          this.errorMessage = 'Post non valido.';
        });
        return;
      }

      this.loadComments(id);
      /* id valido: carico i commenti */
    }
  }

  trackByCommentId(index: number, c: Comment): number {
    /* per evitare re-render in lista */
    return c.id ?? index;
  }

  private loadComments(postId: number): void {
    /* preparo stato di caricamento */
    runInAngular(this.ngZone, this.cdr, () => {
      this.isLoading = true;
      this.errorMessage = '';
      this.comments = [];
    });

    this.postsService
      .getPostComments(postId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items: Comment[]) => {
          /* salvo array commenti e spengo loading */
          runInAngular(this.ngZone, this.cdr, () => {
            this.comments = Array.isArray(items) ? items : [];
            this.isLoading = false;
          });
        },
        error: (err: unknown) => {
          /* errore: svuoto lista e mostro messaggio leggibile */
          runInAngular(this.ngZone, this.cdr, () => {
            this.comments = [];
            this.isLoading = false;
            this.errorMessage = buildHttpErrorMessage('caricamento commenti', err);
          });
        },
      });
  }

  submit(): void {
    /* invio nuovo commento del form */
    const postId = Number(this.postId);
    if (!postId || postId <= 0) return;
    /* non invio se post id non valido */

    this.submitError = '';
    /* reset errore invio precedente */

    const dto: CreateCommentDto = {
      name: this.draft.name.trim(),
      email: this.draft.email.trim(),
      body: this.draft.body.trim(),
    };

    if (!dto.name || !dto.email || !dto.body) {
      /* validazione lato client */
      runInAngular(this.ngZone, this.cdr, () => {
        this.submitError = 'Compila tutti i campi.';
      });
      return;
    }

    runInAngular(this.ngZone, this.cdr, () => {
      this.isSubmitting = true;
    });
    /* attivo stato submit per disabilitare UI */

    this.postsService
      .createComment(postId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created: Comment) => {
          /* se ok: aggiungo commento in testa e pulisco form */
          runInAngular(this.ngZone, this.cdr, () => {
            this.isSubmitting = false;
            this.comments = [created, ...this.comments];
            this.draft = { name: '', email: '', body: '' };
          });
        },
        error: (err: unknown) => {
          /* errore submit: spengo stato e mostro messaggio */
          runInAngular(this.ngZone, this.cdr, () => {
            this.isSubmitting = false;
            this.submitError = buildHttpErrorMessage('invio commento', err);
          });
        },
      });
  }
}
