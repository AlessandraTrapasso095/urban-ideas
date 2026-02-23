/* service base DRY: baseUrl + helper paginazione per chiamate GoREST */

import { Injectable } from '@angular/core';

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
/* HttpClient = faccio richieste HTTP
   HttpParams = costruisco querystring
   HttpResponse = mi serve per leggere anche gli header */

import { Observable } from 'rxjs';
/* tipo che Angular usa per gestire chiamate async via HttpClient */

import { map } from 'rxjs/operators';
/* trasformo la response (header + body) in un oggetto più comodo */

import { PaginatedResponse, User } from '../../features/users/models/gorest-models.model';
/* importo i tipi (sono SOLO tipi, non servizi) */

@Injectable({
  providedIn: 'root',
})
export class GorestApiService {
  private readonly baseUrl = 'https://gorest.co.in/public/v2';
  /* base url comune a tutte le chiamate API */

  constructor(private http: HttpClient) {
    /* inietto HttpClient per fare chiamate HTTP */
  }

  getBaseUrl(): string {
    /* espongo baseUrl così altri service la riusano senza riscriverla */
    return this.baseUrl;
  }

  private mapPaginatedResponse(
    res: HttpResponse<User[]>,
    page: number,
    perPage: number
  ): PaginatedResponse<User> {
    /* trasformo response in PaginatedResponse */

    const pageHeader = Number(res.headers.get('x-pagination-page') ?? page);
    /* pagina corrente dagli header */

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

  getUsersWithParams(
    params: HttpParams,
    page: number,
    perPage: number
  ): Observable<PaginatedResponse<User>> {
    /* metodo DRY: fa la GET e mappa gli header di paginazione */

    return this.http
      .get<User[]>(`${this.baseUrl}/users`, { params, observe: 'response' })
      /* faccio GET osservando tutta la response per leggere gli header */

      .pipe(
        map((res: HttpResponse<User[]>) => this.mapPaginatedResponse(res, page, perPage))
      );
      /* trasformo HttpResponse<User[]> in PaginatedResponse<User> */
  }
}
