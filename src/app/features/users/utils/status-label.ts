/* utility DRY: converto lo status API in etichetta leggibile per la UI */

export function getStatusLabel(status: string): 'Attivo' | 'Non attivo' {
  /* se arriva "active" mostro "Attivo", altrimenti fallback sicuro */
  return status === 'active' ? 'Attivo' : 'Non attivo';
}
