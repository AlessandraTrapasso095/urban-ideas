/* service per gestire le chiamate API dei post e commenti (GoREST) */

import { Injectable } from '@angular/core';
/* Injectable = dico ad Angular che questa classe è un service */

import { HttpClient } from '@angular/common/http';
/* HttpClient = faccio richieste HTTP */

import { Observable } from 'rxjs';
/* tipo che Angular usa per gestire chiamate async via HttpClient */

import { Post, Comment, CreateCommentDto } from '../models/gorest-models.model';
/* importo i tipi/DTO condivisi (DRY) */

import { GorestApiService } from '../../../core/services/gorest-api';
/* service base DRY per baseUrl */

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
    /* inietto service DRY che contiene baseUrl */
  ) {
    this.baseUrl = this.gorestApi.getBaseUrl();
    /* recupero baseUrl da service centrale per non ripeterlo */
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
}
