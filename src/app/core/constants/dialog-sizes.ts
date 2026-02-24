/* costanti DRY: dimensioni dialog condivise tra le varie pagine */

export const DIALOG_SIZE_FORM = {
  width: 'min(680px, 92vw)',
  maxWidth: '92vw',
} as const;
/* dialog form grande (per creare/modificare utente) */

export const DIALOG_SIZE_POST_FORM = {
  width: 'min(560px, 92vw)',
  maxWidth: '92vw',
} as const;
/* dialog form per i post */

export const DIALOG_SIZE_CONFIRM = {
  width: 'min(420px, 92vw)',
  maxWidth: '92vw',
} as const;
/* dialog conferma azione */
