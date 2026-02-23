/* test base per PostsService */

import { TestBed } from '@angular/core/testing';
/* TestBed = crea modulo di test Angular */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
/* HttpClientTestingModule = mock HttpClient */
/* HttpTestingController = intercetto chiamate HTTP */

import { PostsService } from './posts.service';
/* service da testare */

import { GorestApiService } from '../../../core/services/gorest-api';
/* dipendenza che fornisce baseUrl */

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostsService, GorestApiService],
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    /* verifico che non restino chiamate pendenti */
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getPostComments should call correct url', () => {
    service.getPostComments(10).subscribe();
    /* avvio la chiamata */

    const req = httpMock.expectOne((r) => r.url.includes('/posts/10/comments'));
    /* intercetto richiesta */

    expect(req.request.method).toBe('GET');
    /* controllo metodo */

    req.flush([]);
    /* rispondo con array vuoto */
  });
});
