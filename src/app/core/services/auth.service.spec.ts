/* test AuthService: verifico salvataggio token, lettura token, stato login e logout */

import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
    /* pulisco storage prima di ogni test per evitare effetti tra test */
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setToken/getToken should save and read token', () => {
    /* salvo token e verifico lettura */
    service.setToken('abc123');

    expect(service.getToken()).toBe('abc123');
  });

  it('isLoggedIn should be false when token missing', () => {
    /* senza token l'utente non è loggato */
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn should be true when token exists', () => {
    /* con token esistente l'utente è loggato */
    service.setToken('valid-token');

    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout should remove token', () => {
    /* logout deve cancellare il token */
    service.setToken('to-remove');
    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
