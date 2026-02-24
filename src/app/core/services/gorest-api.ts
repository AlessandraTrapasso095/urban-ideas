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

import { PaginatedResponse } from '../../features/users/models/gorest-models.model';
/* tipo paginazione condiviso (generico) */

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

  private mapPaginatedResponse<T>(
    res: HttpResponse<T[]>,
    page: number,
    perPage: number
  ): PaginatedResponse<T> {
    /* trasformo response in PaginatedResponse<T> */

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
      /* body = array di elementi */

      page: pageHeader,
      pages: pagesHeader,
      limit: limitHeader,
      total: totalHeader,
    };
  }

  getPaginated<T>(
    resource: 'users' | 'posts',
    params: HttpParams,
    page: number,
    perPage: number
  ): Observable<PaginatedResponse<T>> {
    /* metodo DRY: fa la GET e mappa gli header di paginazione */

    return this.http
      .get<T[]>(`${this.baseUrl}/${resource}`, { params, observe: 'response' })
      /* faccio GET osservando tutta la response per leggere gli header */

      .pipe(map((res: HttpResponse<T[]>) => this.mapPaginatedResponse<T>(res, page, perPage)));
      /* trasformo HttpResponse<T[]> in PaginatedResponse<T> */
  }

  getUsersWithParams(
    params: HttpParams,
    page: number,
    perPage: number
  ): Observable<PaginatedResponse<any>> {
    /* compatibilità: se già lo usi da UsersService puoi lasciarlo */

    return this.getPaginated<any>('users', params, page, perPage);
  }
}
