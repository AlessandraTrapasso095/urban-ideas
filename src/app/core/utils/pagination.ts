/* utility DRY: helper comuni per paginazione + ricerca testo */

type PaginationCursor = {
  page: number;
};

type PaginationBounds = PaginationCursor & {
  pages: number;
};

type PaginationWritable = PaginationBounds & {
  total: number;
  perPage: number;
};

type PaginationMeta = {
  page: number;
  pages: number;
  total: number;
  limit: number;
};

export function normalizeSearchText(value: string): string {
  /* pulisco spazi esterni e rendo la ricerca coerente in tutta l'app */
  return value.trim();
}

export function resetToFirstPage(cursor: PaginationCursor): void {
  /* uso un punto unico per riportare la paginazione alla pagina 1 */
  cursor.page = 1;
}

export function goPrevPage(cursor: PaginationCursor): boolean {
  /* se sono già alla prima pagina non posso tornare indietro */
  if (cursor.page <= 1) return false;

  cursor.page -= 1;
  return true;
}

export function goNextPage(cursor: PaginationBounds): boolean {
  /* se sono già all'ultima pagina non posso avanzare */
  if (cursor.page >= cursor.pages) return false;

  cursor.page += 1;
  return true;
}

export function applyPaginationMeta(
  target: PaginationWritable,
  meta: PaginationMeta
): void {
  /* sincronizzo stato locale con metadata paginazione ricevuti dalle API */
  target.page = meta.page;
  target.pages = meta.pages;
  target.total = meta.total;
  target.perPage = meta.limit;
}
