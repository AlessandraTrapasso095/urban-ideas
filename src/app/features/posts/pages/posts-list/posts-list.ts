/* pagina lista post: carico i post da GoREST e mostro commenti inline */

import { Component, OnInit, inject } from '@angular/core';
/* Component = definisco componente
   OnInit = posso usare ngOnInit */

import { CommonModule } from '@angular/common';
/* CommonModule = *ngIf *ngFor */

import { finalize } from 'rxjs/operators';
/* finalize = spengo loading sempre */

import { PostsService } from '../../../users/services/posts.service';
/* service API post */

import { Post, PaginatedResponse } from '../../../users/models/gorest-models.model';
/* tipi DRY */

import { PostCommentsComponent } from '../../../users/components/post-comments/post-comments';
/* componente commenti */

import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
/* DRY error message */

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

  isLoading = false;
  errorMessage = '';

  page = 1;
  pages = 1;
  perPage = 10;
  total = 0;

  expandedPostId: number | null = null;
  /* ID del post che ha i commenti aperti */

  ngOnInit(): void {
    this.loadPosts();
    /* appena entro nella pagina carico i post */
  }

  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.postsService
      .getPosts(this.page, this.perPage)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (res: PaginatedResponse<Post>) => {
          this.posts = res.data;
          this.page = res.page;
          this.pages = res.pages;
          this.total = res.total;
          this.perPage = res.limit;
        },
        error: (err: unknown) => {
          this.errorMessage = buildHttpErrorMessage('caricamento post', err);
        },
      });
  }

  toggleComments(postId: number): void {
    this.expandedPostId = this.expandedPostId === postId ? null : postId;
  }

  isExpanded(postId: number): boolean {
    return this.expandedPostId === postId;
  }

  goPrev(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.loadPosts();
  }

  goNext(): void {
    if (this.page >= this.pages) return;
    this.page += 1;
    this.loadPosts();
  }
}
