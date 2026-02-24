/* leggo lo status code da un errore HTTP in modo safe */

export function getHttpStatus(err: unknown): number | undefined {
  /* err è unknown perché Angular può passarmi qualsiasi cosa in error */

  if (typeof err !== 'object' || err === null) {
    /* se non è un oggetto (o è null) non posso leggere proprietà */

    return undefined;
    /* niente status */
  }

  if (!('status' in err)) {
    /* se non esiste la property status, non è un HttpErrorResponse “compatibile” */

    return undefined;
    /* niente status */
  }

  const statusValue = (err as { status?: unknown }).status;
  /* leggo status come unknown (potrebbe non essere number) */

  if (typeof statusValue !== 'number') {
    /* se status non è numero, non lo considero valido */

    return undefined;
    /* niente status */
  }

  return statusValue;
  /* status ok */
}
