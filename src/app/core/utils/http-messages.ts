/* utility messaggi errore HTTP: crea testi coerenti in tutta l'app partendo da action + status code */

import { getHttpStatus } from './http-error';
/* riuso utility che estrae lo status dagli errori HTTP */


export function buildHttpErrorMessage(action: string, err: unknown): string {
  const status = getHttpStatus(err);
  /* estraggo status in modo safe */

  return `Errore ${action} (status: ${status ?? 'unknown'})`;
  /* messaggio standard unico */
}
