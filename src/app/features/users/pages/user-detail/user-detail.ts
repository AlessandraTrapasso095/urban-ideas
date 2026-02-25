/* pagina dettaglio utente: qui mostro i dettagli e poi i post */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { PostsService } from '../../services/posts.service';
import { User, Post } from '../../models/gorest-models.model';
import { finalize, timeout } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
import { PostCommentsComponent } from '../../components/post-comments/post-comments';
import { getStatusLabel } from '../../utils/status-label';

@Component({
  selector: 'app-user-detail',
  standalone: true,

  imports: [
    CommonModule,
    /* abilito direttive base nel template */

    MatTooltipModule,
    /* tooltip Material per i pallini status */

    PostCommentsComponent,
    /* componente figlio che gestisce commenti */
  ],

  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail implements OnInit {
  userId = 0;
  /* id letto dall'URL */

  user: User | null = null;
  /* utente caricato */

  isLoading = false;
  /* loading utente */

  errorMessage = '';
  /* errore utente */

  posts: Post[] = [];
  /* lista post utente */

  postsLoading = false;
  /* loading post */

  postsError = '';
  /* errore post */

  expandedPostId: number | null = null;
  /* id del post utente con pannello commenti aperto */

  readonly statusLabel = getStatusLabel;
  /* espongo helper al template */

  constructor(
    private route: ActivatedRoute,
    /* leggo parametro id dall'URL */

    private usersService: UsersService,
    /* chiamo le API per user */

    private postsService: PostsService,
    /* chiamo le API (post) */

    private cdr: ChangeDetectorRef
    /* forzo refresh view quando cambia lo state */
  ) {}

  private refreshView(): void {
    /* per forzare l'update della view */
    this.cdr.detectChanges();
  }

  private runRequest<T>(options: {
    /* per gestire loading + error + finalize + refreshView */

    request$: Observable<T>;
    /* la chiamata http */

    setLoading: (value: boolean) => void;
    /* come accendere/spegnere il loading del pezzo di UI */

    setError: (message: string) => void;
    /* come scrivere l'errore del pezzo di UI */

    actionLabel: string;

    onSuccess: (data: T) => void;
    /* cosa fare se arriva il risultato */
  }): void {
    options.setLoading(true);
    /* accendo loading del blocco giusto */

    options.setError('');
    /* reset errore del blocco giusto */

    this.refreshView();
    /* aggiorno view subito così si vede il loading */

    options.request$
      .pipe(
        finalize(() => {
          options.setLoading(false);
          /* spengo loading */

          this.refreshView();
          /* aggiorno view */
        })
      )
      .subscribe({
        next: (data: T) => {
          options.onSuccess(data);

          this.refreshView();
          /* aggiorno view dopo aver aggiornato lo state */
        },
        error: (err: unknown) => {
          options.setError(buildHttpErrorMessage(options.actionLabel, err));
          /* messaggio errore */

          this.refreshView();
          /* aggiorno view */
        },
      });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    /* prendo id dall'URL */

    this.userId = Number(idParam ?? 0);
    /* converto in numero */

    this.loadUser();
    /* carico utente */
  }

  loadUser(): void {
    /* carico utente */

    if (!this.userId) {
      this.errorMessage = 'ID utente non valido.';
      /* errore se id non valido */

      this.refreshView();
      /* aggiorno view */

      return;
    }

    this.user = null;
    /* reset utente */
    this.expandedPostId = null;
    /* reset eventuale pannello commenti aperto */

    this.runRequest<User>({
      /* uso helper */

      request$: this.usersService.getUserById(this.userId).pipe(timeout(8000)),

      setLoading: (v) => (this.isLoading = v),
      /* loading della parte utente */

      setError: (msg) => (this.errorMessage = msg),
      /* errore della parte utente */

      actionLabel: 'caricamento utente',

      onSuccess: (u) => {
        this.user = u;
        /* salvo utente */

        this.loadPosts();
        /* dopo utente carico i post */
      },
    });
  }

  loadPosts(): void {
    /* carico post utente */

    this.posts = [];
    /* reset lista post */

    this.runRequest<Post[]>({
      request$: this.postsService.getUserPosts(this.userId),
      setLoading: (v) => (this.postsLoading = v),
      setError: (msg) => (this.postsError = msg),
      actionLabel: 'caricamento post',
      onSuccess: (posts) => {
        this.posts = posts;
        this.expandedPostId = null;
        /* al refresh lista richiudo i commenti aperti */
      },
    });
  }

  getUserInitial(name: string | null | undefined): string {
    return (name ?? '').trim().charAt(0).toUpperCase() || 'U';
  }

  trackByPostId(index: number, post: Post): number {
    return post.id ?? index;
  }

  toggleComments(postId: number): void {
    /* click su commenti: apro/chiudo il pannello del singolo post */
    this.expandedPostId = this.expandedPostId === postId ? null : postId;
  }

  isExpanded(postId: number): boolean {
    /* true se il post ha commenti visibili */
    return this.expandedPostId === postId;
  }
}
