/* test unitari per UsersService */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { UsersService } from './users.service';
import { GorestApiService } from '../../../core/services/gorest-api';
import { CreateUserDto } from '../models/gorest-models.model';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;
  let gorestApi: GorestApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService, GorestApiService],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
    gorestApi = TestBed.inject(GorestApiService);
  });

  afterEach(() => {
    httpMock.verify();
    /* verifico che non restino chiamate HTTP pendenti */
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getUsers should call gorestApi.getPaginated with users resource', () => {
    const paginatedSpy = vi.spyOn(gorestApi, 'getPaginated').mockReturnValue(
      of({ data: [], page: 2, pages: 3, total: 30, limit: 10 })
    );

    service.getUsers(2, 10).subscribe();

    expect(paginatedSpy).toHaveBeenCalledTimes(1);
    expect(paginatedSpy.mock.calls[0][0]).toBe('users');
    expect(paginatedSpy.mock.calls[0][2]).toBe(2);
    expect(paginatedSpy.mock.calls[0][3]).toBe(10);
    expect(paginatedSpy.mock.calls[0][1]).toEqual(
      expect.any(HttpParams)
    );
  });

  it('searchUsers should set selected field when search text exists', () => {
    const paginatedSpy = vi.spyOn(gorestApi, 'getPaginated').mockReturnValue(
      of({ data: [], page: 1, pages: 1, total: 0, limit: 10 })
    );

    service.searchUsers('mario', 'name', 1, 10).subscribe();

    const params = paginatedSpy.mock.calls[0][1] as HttpParams;
    expect(params.get('name')).toBe('mario');
    expect(params.get('email')).toBeNull();
  });

  it('searchUsers should not set field when search is blank', () => {
    const paginatedSpy = vi.spyOn(gorestApi, 'getPaginated').mockReturnValue(
      of({ data: [], page: 1, pages: 1, total: 0, limit: 10 })
    );

    service.searchUsers('   ', 'email', 1, 10).subscribe();

    const params = paginatedSpy.mock.calls[0][1] as HttpParams;
    expect(params.get('email')).toBeNull();
  });

  it('getUserById should call GET /users/:id', () => {
    service.getUserById(99).subscribe();

    const req = httpMock.expectOne(
      'https://gorest.co.in/public/v2/users/99'
    );
    expect(req.request.method).toBe('GET');

    req.flush({ id: 99 });
  });

  it('createUser should call POST /users with payload', () => {
    const dto: CreateUserDto = {
      name: 'Mario Rossi',
      email: 'mario@example.com',
      gender: 'male',
      status: 'active',
    };

    service.createUser(dto).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush({ id: 1, ...dto });
  });

  it('updateUser should call PUT /users/:id with payload', () => {
    const dto: CreateUserDto = {
      name: 'Luca Bianchi',
      email: 'luca@example.com',
      gender: 'male',
      status: 'inactive',
    };

    service.updateUser(15, dto).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/15');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);

    req.flush({ id: 15, ...dto });
  });

  it('deleteUser should call DELETE /users/:id', () => {
    service.deleteUser(77).subscribe();

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users/77');
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });
});
