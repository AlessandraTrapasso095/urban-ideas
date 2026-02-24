/* test unitari per PostsService */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PostsService } from './posts.service';
import { GorestApiService } from '../../../core/services/gorest-api';
import { CreateCommentDto, CreatePostDto } from '../models/gorest-models.model';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;
  let gorestApi: GorestApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostsService, GorestApiService],
    });

    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
    gorestApi = TestBed.inject(GorestApiService);
  });

  afterEach(() => {
    httpMock.verify();
    /* verifico che non restino richieste appese */
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getPosts should call gorestApi.getPaginated with posts resource', () => {
    const paginatedSpy = vi.spyOn(gorestApi, 'getPaginated').mockReturnValue(
      of({ data: [], page: 1, pages: 1, total: 0, limit: 10 })
    );

    service.getPosts(1, 10).subscribe();

    expect(paginatedSpy).toHaveBeenCalledTimes(1);
    expect(paginatedSpy.mock.calls[0][0]).toBe('posts');
    expect(paginatedSpy.mock.calls[0][1]).toEqual(
      expect.any(HttpParams)
    );
  });

  it('searchPosts should set title param when search exists', () => {
    const paginatedSpy = vi.spyOn(gorestApi, 'getPaginated').mockReturnValue(
      of({ data: [], page: 1, pages: 1, total: 0, limit: 10 })
    );

    service.searchPosts('ambiente', 1, 10).subscribe();

    const params = paginatedSpy.mock.calls[0][1] as HttpParams;
    expect(params.get('title')).toBe('ambiente');
  });

  it('searchPosts should not set title param when search is blank', () => {
    const paginatedSpy = vi.spyOn(gorestApi, 'getPaginated').mockReturnValue(
      of({ data: [], page: 1, pages: 1, total: 0, limit: 10 })
    );

    service.searchPosts('   ', 1, 10).subscribe();

    const params = paginatedSpy.mock.calls[0][1] as HttpParams;
    expect(params.get('title')).toBeNull();
  });

  it('getUserPosts should call GET /users/:id/posts', () => {
    service.getUserPosts(8).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/8/posts');
    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('getPostComments should call GET /posts/:id/comments', () => {
    service.getPostComments(10).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/10/comments');
    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('createComment should call POST /posts/:id/comments with payload', () => {
    const dto: CreateCommentDto = {
      name: 'Anna',
      email: 'anna@example.com',
      body: 'Bel progetto!',
    };

    service.createComment(11, dto).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/11/comments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush({ id: 1, ...dto });
  });

  it('createPost should call POST /posts with payload', () => {
    const dto: CreatePostDto = {
      user_id: 3,
      title: 'Nuova idea urbana',
      body: 'Testo del post',
    };

    service.createPost(dto).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush({ id: 99, ...dto });
  });

  it('updatePost should call PUT /posts/:id with payload', () => {
    const dto: CreatePostDto = {
      user_id: 3,
      title: 'Titolo aggiornato',
      body: 'Testo aggiornato',
    };

    service.updatePost(99, dto).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/posts/99');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);

    req.flush({ id: 99, ...dto });
  });
});
