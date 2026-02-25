/* service per gestire le chiamate API dei post e commenti (GoREST) */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Post,
  Comment,
  CreateCommentDto,
  PaginatedResponse,
  CreatePostDto,
} from '../models/gorest-models.model';
import { GorestApiService } from '../../../core/services/gorest-api';

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
    }

    return this.gorestApi.getPaginated<Post>('posts', params, page, perPage);
  }

  getUserPosts(userId: number): Observable<Post[]> {
    /* prendo i post di un utente */

    return this.http.get<Post[]>(`${this.baseUrl}/users/${userId}/posts`);
  }

  getPostComments(postId: number): Observable<Comment[]> {
    /* prendo i commenti di un post */

    return this.http.get<Comment[]>(`${this.baseUrl}/posts/${postId}/comments`);
  }

  createComment(postId: number, data: CreateCommentDto): Observable<Comment> {
    /* inserisco un commento su un post */

    return this.http.post<Comment>(`${this.baseUrl}/posts/${postId}/comments`, data);
  }

  createPost(data: CreatePostDto): Observable<Post> {
    /* inserisco un nuovo post */

    return this.http.post<Post>(`${this.baseUrl}/posts`, data);
  }

  updatePost(id: number, data: CreatePostDto): Observable<Post> {
    /* aggiorno un post esistente */

    return this.http.put<Post>(`${this.baseUrl}/posts/${id}`, data);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/posts/${id}`);
  }
}
