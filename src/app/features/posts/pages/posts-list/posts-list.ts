/* pagina lista post: qui carico i post da GoREST e li mostro */

import { Component, OnInit, inject } from '@angular/core';
/* Component = definisco un componente Angular */
/* OnInit = uso ngOnInit() */

import { CommonModule } from '@angular/common';
/* CommonModule = per *ngIf e *ngFor */

import { finalize } from 'rxjs/operators';
/* finalize = esegue codice sia in caso di successo che errore */

import { PostsService } from '../../../users/services/posts.service';
/* PostsService = chiamate API post */

import { Post } from '../../../users/models/gorest-models.model';
/* tipo Post */

import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
/* DRY: messaggi errore standard */

import { PostCommentsComponent } from '../../../users/components/post-comments/post-comments';
/* componente commenti (stesso che usi nella pagina user-detail) */

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, PostCommentsComponent],
  templateUrl: './posts-list.html',
  styleUrl: './posts-list.scss',
})
export class PostsList implements OnInit {
  private postsService = inject(PostsService);

  posts: Post[] = [];
  /* lista post mostrati */

  isLoading = false;
  /* loading lista post */

  errorMessage = '';
  /* errore lista post */

  expandedPostId: number | null = null;
  /* ID del post che ha i commenti aperti */

  ngOnInit(): void {
    /* appena entro in pagina, carico i post */
    this.loadPosts();
  }

  loadPosts(): void {
    /* carico la lista post */

    this.isLoading = true;
    /* accendo loading */

    this.errorMessage = '';
    /* reset errore */

    this.postsService
      .getPosts(1, 10)
      /* prendo pagina 1, 10 post (poi aggiungiamo paginazione) */

      .pipe(
        finalize(() => {
          this.isLoading = false;
          /* spengo loading sempre */
        })
      )
      .subscribe({
        next: (res) => {
          this.posts = res.data ?? [];
          /* assegno i post */
        },
        error: (err: unknown) => {
          this.errorMessage = buildHttpErrorMessage('caricamento post', err);
          /* DRY */
        },
      });
  }

  toggleComments(postId: number): void {
    /* apro/chiudo commenti del post */
    this.expandedPostId = this.expandedPostId === postId ? null : postId;
  }

  isExpanded(postId: number): boolean {
    return this.expandedPostId === postId;
  }
}
