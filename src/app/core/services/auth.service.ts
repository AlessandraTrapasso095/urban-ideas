/* salva/legge il token GoREST dal localStorage, controlla sessione attiva e gestisce logout */

import { Injectable } from '@angular/core';

const TOKEN_KEY = 'gorest_token'; /* chiave unica per localStorage: così non la ripeto in giro */

@Injectable({ providedIn: 'root' })
export class AuthService {
/* salvo il token */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /* leggo il token (se non esiste ritorna null) */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /* verifico se sono loggata: basta che esista un token */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /* logout = cancello token */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
