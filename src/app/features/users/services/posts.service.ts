/* service per gestire le chiamate API dei post e commenti (GoREST) */

import { Injectable } from '@angular/core';
/* Injectable = dico ad Angular che questa classe è un service */

import { HttpClient, HttpParams } from '@angular/common/http';
/* HttpClient = faccio richieste HTTP
   HttpParams = costruisco querystring */

import { Observable } from 'rxjs';
/* tipo che Angular usa per gestire chiamate async via HttpClient */

import {
  Post,
  Comment,
  CreateCommentDto,
  PaginatedResponse,
  CreatePostDto,
} from '../models/gorest-models.model';
/* importo i tipi/DTO condivisi (DRY) */

import { GorestApiService } from '../../../core/services/gorest-api';
/* service base DRY per baseUrl + paginazione */

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly baseUrl: string;
  /* base url comune a tutte le chiamate API */

  constructor(
    private http: HttpClient,
    /* inietto HttpClient per fare chiamate HTTP */

    private gorestApi: GorestApiService
    /* inietto service DRY che contiene baseUrl e helper paginazione */
  ) {
    this.baseUrl = this.gorestApi.getBaseUrl();
    /* recupero baseUrl da service centrale per non ripeterlo */
  }

  getPosts(page = 1, perPage = 10): Observable<PaginatedResponse<Post>> {
    /* prendo tutti i post + paginazione */

    const params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    return this.gorestApi.getPaginated<Post>('posts', params, page, perPage);
    /* DRY: uso helper paginato generico */
  }

  searchPosts(search: string, page = 1, perPage = 10): Observable<PaginatedResponse<Post>> {
    /* cerco post per title */

    const cleaned = search.trim();

    let params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    if (cleaned) {
      params = params.set('title', cleaned);
      /* GoREST supporta filtro title=... */
    }

    return this.gorestApi.getPaginated<Post>('posts', params, page, perPage);
    /* DRY: uso helper paginato generico */
  }

  getUserPosts(userId: number): Observable<Post[]> {
    /* prendo i post di un utente */

    return this.http.get<Post[]>(`${this.baseUrl}/users/${userId}/posts`);
    /* GET /users/:id/posts */
  }

  getPostComments(postId: number): Observable<Comment[]> {
    /* prendo i commenti di un post */

    return this.http.get<Comment[]>(`${this.baseUrl}/posts/${postId}/comments`);
    /* GET /posts/:id/comments */
  }

  createComment(postId: number, data: CreateCommentDto): Observable<Comment> {
    /* inserisco un commento su un post */

    return this.http.post<Comment>(`${this.baseUrl}/posts/${postId}/comments`, data);
    /* POST /posts/:id/comments */
  }

  createPost(data: CreatePostDto): Observable<Post> {
    /* inserisco un nuovo post */

    return this.http.post<Post>(`${this.baseUrl}/posts`, data);
    /* POST /posts */
  }
}
