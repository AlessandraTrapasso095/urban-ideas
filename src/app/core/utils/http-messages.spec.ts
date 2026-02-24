/* test utility buildHttpErrorMessage */

import { buildHttpErrorMessage } from './http-messages';

describe('buildHttpErrorMessage', () => {
  it('should include numeric status when available', () => {
    const message = buildHttpErrorMessage('caricamento utenti', { status: 500 });

    expect(message).toBe('Errore caricamento utenti (status: 500)');
  });

  it('should fallback to unknown when status missing', () => {
    const message = buildHttpErrorMessage('creazione post', { foo: 'bar' });

    expect(message).toBe('Errore creazione post (status: unknown)');
  });
});
