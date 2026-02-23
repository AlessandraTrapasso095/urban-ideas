import {
  Component,
  Input,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PostsService } from '../../../users/services/posts.service';
import { Comment, CreateCommentDto } from '../../../users/models/gorest-models.model';
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

  trackByCommentId(_: number, c: Comment): number {
    return c.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['postId']) return;

    const id = Number(this.postId);
    if (!id || id <= 0) return;

    // IMPORTANTISSIMO: rimando il load ad un MACROTASK
    // così evitiamo NG0100 in dev mode
    setTimeout(() => this.loadComments(), 0);
  }

  private setLoading(value: boolean): void {
    this.isLoading = value;
    this.cdr.markForCheck();
  }

  loadComments(): void {
    const id = Number(this.postId);
    if (!id || id <= 0) return;

    // Metto isLoading=true in macrotask
    setTimeout(() => {
      this.comments = [];
      this.errorMessage = '';
      this.setLoading(true);

      this.postsService
        .getPostComments(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (items: Comment[]) => {
            // Anche l'update finale in macrotask
            setTimeout(() => {
              this.comments = items ?? [];
              this.setLoading(false);
            }, 0);
          },
          error: (err: any) => {
            setTimeout(() => {
              this.comments = [];
              this.errorMessage = buildHttpErrorMessage('caricamento commenti', err);
              this.setLoading(false);
            }, 0);
          },
        });
    }, 0);
  }

  submit(): void {
    const id = Number(this.postId);
    if (!id || id <= 0) return;

    this.submitError = '';

    const dto: CreateCommentDto = {
      name: this.draft.name.trim(),
      email: this.draft.email.trim(),
      body: this.draft.body.trim(),
    };

    if (!dto.name || !dto.email || !dto.body) {
      this.submitError = 'Compila tutti i campi.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.postsService
      .createComment(id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created: Comment) => {
          setTimeout(() => {
            this.isSubmitting = false;
            this.comments = [created, ...this.comments];
            this.draft = { name: '', email: '', body: '' };
            this.cdr.markForCheck();
          }, 0);
        },
        error: (err: any) => {
          setTimeout(() => {
            this.isSubmitting = false;
            this.submitError = buildHttpErrorMessage('invio commento', err);
            this.cdr.markForCheck();
          }, 0);
        },
      });
  }
}
