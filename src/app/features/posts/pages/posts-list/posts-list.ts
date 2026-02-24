/* pagina lista post: carico i post da GoREST e gestisco apertura commenti */

import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
/* Component = definisco componente Angular
   OnInit = mi permette di usare ngOnInit */

import { CommonModule } from '@angular/common';
/* CommonModule = mi serve per *ngIf e *ngFor */
import { FormsModule } from '@angular/forms';
/* FormsModule = mi serve per usare [(ngModel)] nella barra filtri */
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
/* MatDialog = apro dialog creazione post
   MatDialogModule = supporto dialog in componente standalone */

import { finalize, timeout } from 'rxjs';
/* finalize = spengo loading sempre
   timeout = evito loading infinito se una chiamata resta appesa */

import { PostsService } from '../../../users/services/posts.service';
/* service che chiama le API dei post */

import { Post, PaginatedResponse } from '../../../users/models/gorest-models.model';
/* tipi condivisi (DRY) */

import { PostCommentsComponent } from '../../../users/components/post-comments/post-comments';
/* componente che mostra i commenti del singolo post */
import { CreatePostDialog } from '../../dialogs/create-post-dialog/create-post-dialog';
/* dialog per inserire un nuovo post */

import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
/* utility DRY per messaggi errore coerenti */

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, PostCommentsComponent],
  templateUrl: './posts-list.html',
  styleUrl: './posts-list.scss',
})
export class PostListComponent implements OnInit {
  private postsService = inject(PostsService);
  /* inject = recupero il service senza constructor */
  private cdr = inject(ChangeDetectorRef);
  /* cdr = mi permette di forzare il refresh del template quando serve */
  private ngZone = inject(NgZone);
  /* ngZone = assicuro che gli update stato girino nel contesto Angular */
  private dialog = inject(MatDialog);
  /* dialog = mi serve per aprire la modale di creazione post */

  private readonly requestTimeoutMs = 10000;
  /* timeout centrale (10 secondi) per non ripetere numeri magici */
  private loadingGuardTimerId: ReturnType<typeof setTimeout> | null = null;
  /* timer di sicurezza UI: evita spinner bloccato se la request resta pending */

  posts: Post[] = [];
  /* array con i post correnti mostrati in pagina */

  isLoading = false;
  /* true mentre sto caricando dati */

  errorMessage = '';
  /* testo errore da mostrare in pagina */

  page = 1;
  /* pagina corrente */

  pages = 1;
  /* numero totale pagine */

  perPage = 10;
  /* quanti post per pagina */

  total = 0;
  /* numero totale post dal server */
  searchText = '';
  /* testo ricerca per titolo post */
  isSearchMode = false;
  /* true quando sto usando filtro ricerca */

  expandedPostId: number | null = null;
  /* id del post con sezione commenti aperta */

  ngOnInit(): void {
    /* al mount del componente carico la prima lista post */
    this.loadPosts();
  }

  loadPosts(): void {
    /* preparo stato UI prima della chiamata */
    this.isLoading = true;
    this.errorMessage = '';
    this.clearLoadingGuard();
    /* se avevo un vecchio timer attivo, lo pulisco prima di ripartire */

    this.loadingGuardTimerId = setTimeout(() => {
      /* fallback extra difensivo: se sono ancora in loading, lo spengo */
      if (!this.isLoading) return;

      this.runInAngular(() => {
        this.isLoading = false;
        this.errorMessage = 'Errore caricamento post (timeout client).';
      });
    }, this.requestTimeoutMs + 1000);

    const cleanSearch = this.searchText.trim();
    /* pulisco spazi per evitare filtri sporchi */

    const request$ = cleanSearch
      ? this.postsService.searchPosts(cleanSearch, this.page, this.perPage)
      : this.postsService.getPosts(this.page, this.perPage);
    /* DRY: scelgo una sola sorgente request in base alla ricerca */

    this.isSearchMode = !!cleanSearch;
    /* segno se sto usando filtro attivo */

    request$
      /* passo pagina e limite correnti */
      .pipe(
        timeout(this.requestTimeoutMs),
        /* se il server non risponde entro timeout, vado in errore controllato */

        finalize(() => {
          /* questo blocco gira sempre: success o error */
          this.runInAngular(() => {
            this.clearLoadingGuard();
            this.isLoading = false;
          });
        })
      )
      .subscribe({
        next: (res: PaginatedResponse<Post>) => {
          this.runInAngular(() => {
            /* salvo i dati in modo safe */
            this.posts = Array.isArray(res.data) ? res.data : [];

            /* aggiorno metadati paginazione dal backend */
            this.page = res.page;
            this.pages = res.pages;
            this.total = res.total;
            this.perPage = res.limit;
          });
        },
        error: (err: unknown) => {
          this.runInAngular(() => {
            /* costruisco messaggio errore uniforme (DRY) */
            this.errorMessage = buildHttpErrorMessage('caricamento post', err);
          });
        },
      });
  }

  private runInAngular(fn: () => void): void {
    /* utility DRY:
       1) eseguo aggiornamenti dentro Angular zone
       2) forzo un refresh della view */
    this.ngZone.run(() => {
      fn();
      this.cdr.detectChanges();
    });
  }

  private clearLoadingGuard(): void {
    /* utility DRY: pulizia timer di sicurezza per evitare leak */
    if (!this.loadingGuardTimerId) return;

    clearTimeout(this.loadingGuardTimerId);
    this.loadingGuardTimerId = null;
  }

  toggleComments(postId: number): void {
    /* se clicco lo stesso post lo richiudo, altrimenti apro quel post */
    this.expandedPostId = this.expandedPostId === postId ? null : postId;
  }

  trackByPostId(index: number, post: Post): number {
    /* trackBy: aiuta Angular a renderizzare righe in modo stabile */
    return post.id ?? index;
  }

  isExpanded(postId: number): boolean {
    /* true se questo post è quello aperto */
    return this.expandedPostId === postId;
  }

  goPrev(): void {
    /* guardia: se sono già a pagina 1 non faccio nulla */
    if (this.page <= 1) return;

    this.page -= 1;
    /* torno alla pagina precedente */

    this.loadPosts();
    /* ricarico lista con nuova pagina */
  }

  goNext(): void {
    /* guardia: se sono già all'ultima pagina non faccio nulla */
    if (this.page >= this.pages) return;

    this.page += 1;
    /* avanzo alla pagina successiva */

    this.loadPosts();
    /* ricarico lista con nuova pagina */
  }

  applySearch(): void {
    /* applico filtro titolo: torno sempre alla prima pagina */
    this.page = 1;
    this.expandedPostId = null;
    this.loadPosts();
  }

  resetFilters(): void {
    /* reset DRY: riporto barra filtri e paginazione ai default */
    this.searchText = '';
    this.page = 1;
    this.expandedPostId = null;
    this.loadPosts();
  }

  onPerPageChange(): void {
    /* quando cambio dimensione pagina riparto da pagina 1 */
    this.page = 1;
    this.expandedPostId = null;
    this.loadPosts();
  }

  openCreatePostDialog(): void {
    /* apro dialog creazione post */
    const dialogRef = this.dialog.open(CreatePostDialog, {
      width: '560px',
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
      this.page = 1;
      this.expandedPostId = null;
      this.loadPosts();
    });
  }
}
