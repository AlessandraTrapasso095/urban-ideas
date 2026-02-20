/* service per gestire le chiamate API degli utenti (GoREST) */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
/* tipo che Angular usa per gestire chiamate async via HttpClient */

import { map } from 'rxjs/operators';
/* trasformo la response (header + body) in un oggetto più comodo */

export type UserStatus = 'active' | 'inactive';
/* per lo status utente che GoREST usa (active/inactive) */

export type UserGender = 'male' | 'female';
export type UserSearchField = 'name' | 'email';
export interface User {
  /* interfaccia per tipizzare un utente come arriva da GoREST */

  id: number;
  /* id numerico dell'utente */

  name: string;
  /* nome completo */

  email: string;
  /* email */

  gender: UserGender;
  /* gender */

  status: UserStatus;
  /* status */
}

export type CreateUserDto = Omit<User, 'id'>;
/* tipo per creare utente: è un User senza id */

export interface PaginatedResponse<T> {
  data: T[]; /* dati reali (array utenti) */
  page: number; /* pagina corrente */
  pages: number; /* numero totale pagine */
  limit: number; /* perPage */
  total: number; /* totale record */
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = 'https://gorest.co.in/public/v2';
  /* base url comune a tutte le chiamate API */

  constructor(private http: HttpClient) {
    /* inietto HttpClient per fare chiamate HTTP */
  }

  private mapPaginatedResponse(
    res: HttpResponse<User[]>,
    page: number,
    perPage: number
  ): PaginatedResponse<User> {
    /* trasformo response in PaginatedResponse */

    const pageHeader = Number(res.headers.get('x-pagination-page') ?? page);

    const pagesHeader = Number(res.headers.get('x-pagination-pages') ?? 1);
    /* totale pagine dagli header */

    const limitHeader = Number(res.headers.get('x-pagination-limit') ?? perPage);
    /* limite per pagina dagli header */

    const totalHeader = Number(res.headers.get('x-pagination-total') ?? 0);
    /* totale record dagli header */

    return {
      data: res.body ?? [],
      /* body = array utenti */

      page: pageHeader,
      pages: pagesHeader,
      limit: limitHeader,
      total: totalHeader,
    };
  }

  getUsers(page = 1, perPage = 10): Observable<PaginatedResponse<User>> {
    /* prendo lista utenti + info paginazione dagli header */

    const params = new HttpParams()
      .set('page', String(page))

      .set('per_page', String(perPage));

    return this.http
      .get<User[]>(`${this.baseUrl}/users`, { params, observe: 'response' })

      .pipe(
        map((res: HttpResponse<User[]>) =>
          this.mapPaginatedResponse(res, page, perPage)
        )
      );
  }

  searchUsers(
    search: string,
    field: UserSearchField,
    page = 1,
    perPage = 10
  ): Observable<PaginatedResponse<User>> {
    /* cerco utenti per name o email + info paginazione */

    const cleaned = search.trim();

    let params = new HttpParams()
      .set('page', String(page))
      /* paginazione */

      .set('per_page', String(perPage));
      /* quanti risultati */

    if (cleaned) {
      /* aggiungo filtro solo se l'utente ha scritto qualcosa */
      params = params.set(field, cleaned);
    }

    return this.http
      .get<User[]>(`${this.baseUrl}/users`, { params, observe: 'response' })

      .pipe(
        map((res: HttpResponse<User[]>) =>
          this.mapPaginatedResponse(res, page, perPage)
        )
      );
  }

  createUser(data: CreateUserDto): Observable<User> {
    /* creo un nuovo utente data contiene name, email, gender, status */

    return this.http.post<User>(`${this.baseUrl}/users`, data);
    /* POST su /users */
  }

  updateUser(id: number, data: CreateUserDto): Observable<User> {
  /* aggiorno un utente esistente */
  /* id = id dell'utente da modificare */
  /* data = payload con name/email/gender/status */

    return this.http.put<User>(`${this.baseUrl}/users/${id}`, data);
    /* PUT su /users/:id */
    /* mi aspetto di ricevere in risposta l'utente aggiornato */
  }


  deleteUser(id: number): Observable<void> {
    /* elimino un utente dato il suo id */

    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
    /* DELETE su /users/:id */
  }
}
