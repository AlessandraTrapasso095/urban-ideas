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
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  /* cdr = forzo refresh template quando aggiorno stato async */
  private ngZone = inject(NgZone);
  /* ngZone = eseguo update stato nel contesto Angular */

  @Input({ required: true }) postId!: number;

  comments: Comment[] = [];
  isLoading = false;
  errorMessage = '';

  isSubmitting = false;
  submitError = '';

  draft: CreateCommentDto = {
    name: '',
    email: '',
    body: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if ('postId' in changes) {
      const id = Number(this.postId);

      if (!id || id <= 0) {
        this.runInAngular(() => {
          this.comments = [];
          this.isLoading = false;
          this.errorMessage = 'Post non valido.';
        });
        return;
      }

      this.loadComments(id);
    }
  }

  trackByCommentId(index: number, c: Comment): number {
    return c.id ?? index;
  }

  private loadComments(postId: number): void {
    this.runInAngular(() => {
      this.isLoading = true;
      this.errorMessage = '';
      this.comments = [];
    });

    this.postsService
      .getPostComments(postId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items: Comment[]) => {
          this.runInAngular(() => {
            this.comments = Array.isArray(items) ? items : [];
            this.isLoading = false;
          });
        },
        error: (err: unknown) => {
          this.runInAngular(() => {
            this.comments = [];
            this.isLoading = false;
            this.errorMessage = buildHttpErrorMessage('caricamento commenti', err);
          });
        },
      });
  }

  submit(): void {
    const postId = Number(this.postId);
    if (!postId || postId <= 0) return;

    this.submitError = '';

    const dto: CreateCommentDto = {
      name: this.draft.name.trim(),
      email: this.draft.email.trim(),
      body: this.draft.body.trim(),
    };

    if (!dto.name || !dto.email || !dto.body) {
      this.runInAngular(() => {
        this.submitError = 'Compila tutti i campi.';
      });
      return;
    }

    this.runInAngular(() => {
      this.isSubmitting = true;
    });

    this.postsService
      .createComment(postId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created: Comment) => {
          this.runInAngular(() => {
            this.isSubmitting = false;
            this.comments = [created, ...this.comments];
            this.draft = { name: '', email: '', body: '' };
          });
        },
        error: (err: unknown) => {
          this.runInAngular(() => {
            this.isSubmitting = false;
            this.submitError = buildHttpErrorMessage('invio commento', err);
          });
        },
      });
  }

  private runInAngular(fn: () => void): void {
    /* utility DRY:
       1) eseguo aggiornamenti nel contesto Angular
       2) forzo refresh vista (utile con OnPush) */
    this.ngZone.run(() => {
      fn();
      this.cdr.detectChanges();
    });
  }
}
