/* pagina dei post: carico i post da GoREST e li mostro in stile feed */

import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
/* mi serve per *ngIf e *ngFor */
import { FormsModule } from '@angular/forms';
/* mi serve per usare [(ngModel)] nella barra filtri */
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
/* tooltip hover per bottone "+" in header */
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, timeout } from 'rxjs';
import { PostsService } from '../../../users/services/posts.service';
/* service che chiama le API dei post */
import { UsersService } from '../../../users/services/users.service';
import { Post, PaginatedResponse } from '../../../users/models/gorest-models.model';
import { PostCommentsComponent } from '../../../users/components/post-comments/post-comments';
import { CreatePostDialog } from '../../dialogs/create-post-dialog/create-post-dialog';
import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
import { DIALOG_SIZE_POST_FORM } from '../../../../core/constants/dialog-sizes';
import { runInAngular } from '../../../../core/utils/run-in-angular';
import {
  normalizeSearchText,
  applyPaginationMeta,
  goPrevPage,
  goNextPage,
  resetToFirstPage,
} from '../../../../core/utils/pagination';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatTooltipModule, RouterLink, PostCommentsComponent],
  templateUrl: './posts-list.html',
  styleUrl: './posts-list.scss',
})
export class PostListComponent implements OnInit {
  private postsService = inject(PostsService);
  /* recupero il service post */
  private usersService = inject(UsersService);
  /* recupero service utenti per ottenere i nomi autore */
  private cdr = inject(ChangeDetectorRef);
  /* cdr mi permette di forzare il refresh del template quando serve */
  private ngZone = inject(NgZone);
  /* assicuro che gli update stato girino nel contesto Angular */
  private dialog = inject(MatDialog);
  /* mi serve per aprire la modale creazione/modifica post */

  private readonly requestTimeoutMs = 10000;
  /* timeout centrale (10 secondi) */
  private loadingGuardTimerId: ReturnType<typeof setTimeout> | null = null;
  /* evita spinner bloccato se la request resta pending */

  posts: Post[] = [];
  /* array con i post correnti mostrati in pagina */

  authorNameMap: Record<number, string> = {};
  likedPostIds = new Set<number>();

  isLoading = false;
  errorMessage = '';
  page = 1;
  pages = 1;
  perPage = 10;
  /* quanti post per pagina */

  total = 0;
  /* numero totale post dal server */
  searchText = '';
  isSearchMode = false;

  expandedPostId: number | null = null;
  /* id del post con sezione commenti aperta */

  ngOnInit(): void {
    /* carico la prima lista post */
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.clearLoadingGuard();

    this.loadingGuardTimerId = setTimeout(() => {
      /* se sono ancora in loading, lo spengo */
      if (!this.isLoading) return;

      runInAngular(this.ngZone, this.cdr, () => {
        this.isLoading = false;
        this.errorMessage = 'Errore caricamento post (timeout client).';
      });
    }, this.requestTimeoutMs + 1000);

    const cleanSearch = normalizeSearchText(this.searchText);

    const request$ = cleanSearch
      ? this.postsService.searchPosts(cleanSearch, this.page, this.perPage)
      : this.postsService.getPosts(this.page, this.perPage);
    /* scelgo una sola sorgente request in base alla ricerca */

    this.isSearchMode = !!cleanSearch;
    /* segno se sto usando filtro attivo */

    request$
      .pipe(
        timeout(this.requestTimeoutMs),
        /* se il server non risponde entro timeout */

        finalize(() => {
          runInAngular(this.ngZone, this.cdr, () => {
            this.clearLoadingGuard();
            this.isLoading = false;
          });
        })
      )
      .subscribe({
        next: (res: PaginatedResponse<Post>) => {
          runInAngular(this.ngZone, this.cdr, () => {
            /* salvo i dati */
            this.posts = Array.isArray(res.data) ? res.data : [];

            applyPaginationMeta(this, res);
          });

          this.hydrateAuthorNames(this.posts);
        },
        error: (err: unknown) => {
          runInAngular(this.ngZone, this.cdr, () => {
            this.errorMessage = buildHttpErrorMessage('caricamento post', err);
          });
        },
      });
  }

  private clearLoadingGuard(): void {
    if (!this.loadingGuardTimerId) return;

    clearTimeout(this.loadingGuardTimerId);
    this.loadingGuardTimerId = null;
  }

  private hydrateAuthorNames(posts: Post[]): void {

    const uniqueIds = Array.from(
      new Set(
        posts
          .map((post) => Number(post.user_id))
          .filter((id) => Number.isFinite(id) && id > 0)
      )
    );

    const idsToLoad = uniqueIds.filter((id) => !this.authorNameMap[id]);
    if (idsToLoad.length === 0) return;

    const requests = idsToLoad.map((id) =>
      this.usersService.getUserById(id).pipe(
        map((user) => ({
          id,
          name: user.name?.trim() || this.buildFallbackAuthorName(id),
        })),
        catchError(() =>
          of({
            id,
            name: this.buildFallbackAuthorName(id),
          })
        )
      )
    );

    forkJoin(requests).subscribe((loadedAuthors) => {
      runInAngular(this.ngZone, this.cdr, () => {
        const nextMap: Record<number, string> = { ...this.authorNameMap };

        loadedAuthors.forEach((author) => {
          nextMap[author.id] = author.name;
        });

        this.authorNameMap = nextMap;
      });
    });
  }

  private buildFallbackAuthorName(userId: number): string {
    /* fallback se nome utente non disponibile */
    return `Utente #${userId}`;
  }

  getAuthorName(post: Post): string {
    /* leggo il nome autore dalla cache, altrimenti fallback */
    return this.authorNameMap[post.user_id] || this.buildFallbackAuthorName(post.user_id);
  }

  getAuthorInitial(post: Post): string {
    /* prendo iniziale autore */
    return this.getAuthorName(post).trim().charAt(0).toUpperCase() || 'U';
  }

  toggleLike(postId: number): void {
    /* comportamento like locale: click alterna attivo/non attivo */
    if (this.likedPostIds.has(postId)) {
      this.likedPostIds.delete(postId);
      return;
    }

    this.likedPostIds.add(postId);
  }

  isLiked(postId: number): boolean {
    /* true se il post è nella lista like locale */
    return this.likedPostIds.has(postId);
  }

  toggleComments(postId: number): void {
    /* se clicco lo stesso post lo richiudo, altrimenti apro quel post */
    this.expandedPostId = this.expandedPostId === postId ? null : postId;
  }

  trackByPostId(index: number, post: Post): number {
    return post.id ?? index;
  }

  isExpanded(postId: number): boolean {
    /* true se questo post è quello aperto */
    return this.expandedPostId === postId;
  }

  goPrev(): void {
    if (!goPrevPage(this)) return;

    this.loadPosts();
    /* ricarico lista con nuova pagina */
  }

  goNext(): void {
    if (!goNextPage(this)) return;

    this.loadPosts();
  }

  applySearch(): void {
    resetToFirstPage(this);
    this.expandedPostId = null;
    this.loadPosts();
  }

  resetFilters(): void {
    this.searchText = '';
    resetToFirstPage(this);
    this.expandedPostId = null;
    this.loadPosts();
  }

  onPerPageChange(): void {
    resetToFirstPage(this);
    this.expandedPostId = null;
    this.loadPosts();
  }

  openCreatePostDialog(): void {
    /* apro dialog creazione post */
    const dialogRef = this.dialog.open(CreatePostDialog, {
      ...DIALOG_SIZE_POST_FORM,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((createdPost: Post | undefined) => {
      /* se chiudo senza creare, esco */
      if (!createdPost) return;

      /* dopo creazione:
         - svuoto filtro
         - torno in pagina 1
         - ricarico lista aggiornata */
      this.searchText = '';
      resetToFirstPage(this);
      this.expandedPostId = null;
      this.loadPosts();
    });
  }

  openEditPostDialog(post: Post): void {
    const dialogRef = this.dialog.open(CreatePostDialog, {
      ...DIALOG_SIZE_POST_FORM,
      disableClose: true,
      data: { post },
    });

    dialogRef.afterClosed().subscribe((updatedPost: Post | undefined) => {
      /* se chiudo senza salvare modifiche, esco */
      if (!updatedPost) return;

      this.expandedPostId = null;
      /* richiudo eventuali commenti aperti per evitare mismatch visuale */

      this.loadPosts();
      /* ricarico la pagina corrente con i dati aggiornati */
    });
  }
}
