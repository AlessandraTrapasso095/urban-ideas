/* centralizza baseUrl e gestione risposte leggendo i metadata dagli header HTTP */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PaginatedResponse } from '../../features/users/models/gorest-models.model';

@Injectable({ providedIn: 'root' })
export class GorestApiService {
  private readonly baseUrl = 'https://gorest.co.in/public/v2';

  constructor(private http: HttpClient) {}

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getPaginated<T>(
    resource: string,
    params: HttpParams,
    fallbackPage = 1,
    fallbackPerPage = 10
  ): Observable<PaginatedResponse<T>> {
    return this.http
      .get<T[]>(`${this.baseUrl}/${resource}`, {
        params,
        observe: 'response',
      })
      .pipe(
        map((res: HttpResponse<T[]>) => {
          const limit = Number(res.headers.get('x-pagination-limit') ?? fallbackPerPage);
          const page = Number(res.headers.get('x-pagination-page') ?? fallbackPage);
          const pages = Number(res.headers.get('x-pagination-pages') ?? 1);
          const total = Number(res.headers.get('x-pagination-total') ?? 0);

          return {
            data: res.body ?? [],
            page,
            pages,
            total,
            limit,
          };
        })
      );
  }
}
