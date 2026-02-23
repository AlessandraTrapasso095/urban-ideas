/* service per gestire le chiamate API degli utenti (GoREST) */

import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
/* HttpClient = faccio richieste HTTP
   HttpParams = costruisco querystring */

import { Observable } from 'rxjs';
/* tipo che Angular usa per gestire chiamate async via HttpClient */

import {
  User,
  CreateUserDto,
  PaginatedResponse,
  UserSearchField,
} from '../models/gorest-models.model';
/* importo i tipi/DTO condivisi (DRY) */

import { GorestApiService } from '../../../core/services/gorest-api';
/* service base DRY per baseUrl + paginazione */

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl: string;
  /* base url comune a tutte le chiamate API */

  constructor(
    private http: HttpClient,
    /* inietto HttpClient per fare chiamate HTTP */

    private gorestApi: GorestApiService
    /* inietto service DRY che contiene baseUrl e utilità paginazione */
  ) {
    this.baseUrl = this.gorestApi.getBaseUrl();
    /* recupero baseUrl da service centrale per non ripeterlo */
  }

  getUsers(page = 1, perPage = 10): Observable<PaginatedResponse<User>> {
    /* prendo lista utenti + info paginazione dagli header */

    const params = new HttpParams()
      .set('page', String(page))
      /* pagina richiesta */

      .set('per_page', String(perPage));
    /* quanti utenti per pagina */

    return this.gorestApi.getPaginated<User>('users', params, page, perPage);
  }

  searchUsers(
    search: string,
    field: UserSearchField,
    page = 1,
    perPage = 10
  ): Observable<PaginatedResponse<User>> {
    /* cerco utenti per name o email + info paginazione */

    const cleaned = search.trim();
    /* pulisco spazi */

    let params = new HttpParams()
      .set('page', String(page))
      /* paginazione */

      .set('per_page', String(perPage));
    /* quanti risultati */

    if (cleaned) {
      params = params.set(field, cleaned);
      /* aggiungo filtro solo se c'è testo */
    }
    return this.gorestApi.getPaginated<User>('users', params, page, perPage);
  }

  getUserById(id: number): Observable<User> {
    /* prendo un singolo utente tramite il suo id */

    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
    /* GET su /users/:id */
  }

  createUser(data: CreateUserDto): Observable<User> {
    /* creo un nuovo utente */

    return this.http.post<User>(`${this.baseUrl}/users`, data);
    /* POST su /users */
  }

  updateUser(id: number, data: CreateUserDto): Observable<User> {
    /* aggiorno un utente esistente */

    return this.http.put<User>(`${this.baseUrl}/users/${id}`, data);
    /* PUT su /users/:id */
  }

  deleteUser(id: number): Observable<void> {
    /* elimino un utente dato il suo id */

    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
    /* DELETE su /users/:id */
  }
}
