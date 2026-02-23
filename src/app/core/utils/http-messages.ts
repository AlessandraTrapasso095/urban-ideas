import { getHttpStatus } from './http-error';
/* riuso utility che estrae lo status dagli errori HTTP */

/**
 * Costruisce messaggi errore coerenti e DRY.
 * action = testo tipo "caricamento utenti", "creazione utente", ecc.
 */
export function buildHttpErrorMessage(action: string, err: unknown): string {
  const status = getHttpStatus(err);
  /* estraggo status in modo safe */

  return `Errore ${action} (status: ${status ?? 'unknown'})`;
  /* messaggio standard unico */
}
