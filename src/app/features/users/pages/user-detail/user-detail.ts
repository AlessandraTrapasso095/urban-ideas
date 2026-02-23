/* pagina dettaglio utente: qui mostro i dettagli e poi i post/commenti */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
/* OnInit = eseguo codice quando la pagina si carica */
/* ChangeDetectorRef = forzo aggiornamento view dopo async */

import { CommonModule } from '@angular/common';
/* CommonModule = mi serve per *ngIf e *ngFor */

import { ActivatedRoute } from '@angular/router';
/* leggo parametro :id dall'URL */

import { UsersService } from '../../services/users.service';
/* chiamo API utenti */

import { PostsService } from '../../services/posts.service';
/* chiamo API post + commenti */

import { User, Post, Comment, CreateCommentDto } from '../../models/gorest-models.model';
/* tipi condivisi DRY */

import { finalize, timeout } from 'rxjs/operators';
/* timeout = se la risposta non arriva entro X secondi va in error */
/* finalize = codice che viene eseguito SEMPRE (sia in next che in error) */

import { Observable } from 'rxjs';
/* Observable = tipo delle chiamate http che useremo nel metodo DRY */

import { FormsModule } from '@angular/forms';
/* FormsModule = mi serve per [(ngModel)] nel form commenti */

import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
/* DRY: messaggi errore standard */

import { PostComments } from '../../components/post-comments/post-comments';

@Component({
  selector: 'app-user-detail',
  standalone: true,

  imports: [
    CommonModule,
    /* abilito direttive base nel template */

    FormsModule,
    /* abilito ngModel nel template */

    PostComments,
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

  commentsByPostId: Record<number, Comment[]> = {};
  /* commenti per post */

  commentsLoadingByPostId: Record<number, boolean> = {};
  /* loading commenti */

  commentsErrorByPostId: Record<number, string> = {};
  /* errore commenti */

  commentsOpenByPostId: Record<number, boolean> = {};
  /* stato apertura commenti */

  commentDraftByPostId: Record<number, { name: string; email: string; body: string }> = {};
  /* bozza commento per ogni post */

  commentSubmittingByPostId: Record<number, boolean> = {};
  /* loading invio commento per singolo post */

  commentSubmitErrorByPostId: Record<number, string> = {};
  /* errore invio commento per singolo post */

  constructor(
    private route: ActivatedRoute,
    /* leggo parametro id dall'URL */

    private usersService: UsersService,
    /* chiamo le API (solo user) */

    private postsService: PostsService,
    /* chiamo le API (post + commenti) */

    private cdr: ChangeDetectorRef
    /* forzo refresh view quando cambia lo state */
  ) {}

  private refreshView(): void {
    /* DRY: metodo unico per forzare l'update della view */
    this.cdr.detectChanges();
  }

  private runRequest<T>(options: {
    /* DRY: helper unico per gestire loading + error + finalize + refreshView */

    request$: Observable<T>;
    /* la chiamata http */

    setLoading: (value: boolean) => void;
    /* come accendere/spegnere il loading del pezzo di UI giusto */

    setError: (message: string) => void;
    /* come scrivere l'errore del pezzo di UI giusto */

    actionLabel: string;
    /* testo per buildHttpErrorMessage: es. "caricamento utente" */

    onSuccess: (data: T) => void;
    /* cosa fare se arriva il risultato */
  }): void {
    options.setLoading(true);
    /* accendo loading del blocco giusto */

    options.setError('');
    /* reset errore del blocco giusto */

    this.refreshView();
    /* aggiorno view subito (così si vede il loading) */

    options.request$
      .pipe(
        finalize(() => {
          options.setLoading(false);
          /* spengo loading SEMPRE */

          this.refreshView();
          /* aggiorno view SEMPRE */
        })
      )
      .subscribe({
        next: (data: T) => {
          options.onSuccess(data);
          /* eseguo logica specifica */

          this.refreshView();
          /* aggiorno view dopo aver aggiornato lo state */
        },
        error: (err: unknown) => {
          options.setError(buildHttpErrorMessage(options.actionLabel, err));
          /* DRY: messaggio errore standard */

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

    this.runRequest<User>({
      /* uso helper DRY */

      request$: this.usersService.getUserById(this.userId).pipe(timeout(8000)),
      /* GET /users/:id con timeout */

      setLoading: (v) => (this.isLoading = v),
      /* loading della parte utente */

      setError: (msg) => (this.errorMessage = msg),
      /* errore della parte utente */

      actionLabel: 'caricamento utente',
      /* etichetta per buildHttpErrorMessage */

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
      /* uso helper DRY */

      request$: this.postsService.getUserPosts(this.userId),
      /* GET /users/:id/posts */

      setLoading: (v) => (this.postsLoading = v),
      /* loading post */

      setError: (msg) => (this.postsError = msg),
      /* errore post */

      actionLabel: 'caricamento post',
      /* etichetta per buildHttpErrorMessage */

      onSuccess: (posts) => {
        this.posts = posts;
        /* salvo lista post */
      },
    });
  }

  toggleComments(postId: number): void {
    /* apro/chiudo commenti di un post */

    const isOpen = this.commentsOpenByPostId[postId] ?? false;
    /* se non esiste ancora considero chiuso */

    this.commentsOpenByPostId[postId] = !isOpen;
    /* toggle */

    this.refreshView();
    /* aggiorno view */

    if (!this.commentsOpenByPostId[postId]) {
      /* se ho appena chiuso, non faccio altro */
      return;
    }

    this.ensureDraft(postId);
    /* preparo il form commento */

    if (this.commentsByPostId[postId]) {
      /* se li ho già caricati, non li ricarico */
      return;
    }

    this.loadComments(postId);
    /* al primo open, carico commenti */
  }

  loadComments(postId: number): void {
    /* carico commenti del post */

    this.runRequest<Comment[]>({
      /* uso helper DRY */

      request$: this.postsService.getPostComments(postId),
      /* GET /posts/:id/comments */

      setLoading: (v) => (this.commentsLoadingByPostId[postId] = v),
      /* loading commenti SOLO di quel post */

      setError: (msg) => (this.commentsErrorByPostId[postId] = msg),
      /* errore commenti SOLO di quel post */

      actionLabel: 'caricamento commenti',
      /* etichetta per buildHttpErrorMessage */

      onSuccess: (comments) => {
        this.commentsByPostId[postId] = comments;
        /* salvo commenti caricati */
      },
    });
  }

  private ensureDraft(postId: number): void {
    /* creo una bozza se non esiste */

    if (!this.commentDraftByPostId[postId]) {
      this.commentDraftByPostId[postId] = {
        name: '',
        email: '',
        body: '',
      };
      /* valori iniziali */
    }
  }

  submitComment(postId: number): void {
    /* invio un commento per un post */

    this.ensureDraft(postId);
    /* mi assicuro che la bozza esista */

    const draft = this.commentDraftByPostId[postId];
    /* recupero valori inseriti */

    const dto: CreateCommentDto = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      body: draft.body.trim(),
    };
    /* pulisco gli spazi */

    if (!dto.name || !dto.email || !dto.body) {
      this.commentSubmitErrorByPostId[postId] = 'Compila tutti i campi.';
      /* validazione base */

      this.refreshView();
      /* aggiorno view */

      return;
    }

    this.runRequest<Comment>({
      /* uso helper DRY */

      request$: this.postsService.createComment(postId, dto),
      /* POST /posts/:id/comments */

      setLoading: (v) => (this.commentSubmittingByPostId[postId] = v),
      /* loading invio SOLO di quel post */

      setError: (msg) => (this.commentSubmitErrorByPostId[postId] = msg),
      /* errore invio SOLO di quel post */

      actionLabel: 'invio commento',
      /* etichetta per buildHttpErrorMessage */

      onSuccess: (created) => {
        /* commento creato correttamente */

        if (!this.commentsByPostId[postId]) {
          this.commentsByPostId[postId] = [];
          /* se non avevo mai caricato commenti, creo array */
        }

        this.commentsByPostId[postId] = [created, ...this.commentsByPostId[postId]];
        /* aggiungo il nuovo commento in cima */

        this.commentDraftByPostId[postId] = { name: '', email: '', body: '' };
        /* reset form */
      },
    });
  }
}
