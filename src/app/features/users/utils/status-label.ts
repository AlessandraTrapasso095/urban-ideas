/* converto lo status API in etichetta per la UI */

export function getStatusLabel(status: string): 'Attivo' | 'Non attivo' {
  /* se arriva "active" mostro "Attivo", altrimenti fallback */
  return status === 'active' ? 'Attivo' : 'Non attivo';
}
