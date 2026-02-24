/* esegue callback dentro NgZone e forza refresh della view con detectChanges */

import { ChangeDetectorRef, NgZone } from '@angular/core';

/* esegue una funzione dentro Angular zone e forza refresh della view */
export function runInAngular(
  ngZone: NgZone,
  cdr: ChangeDetectorRef,
  fn: () => void
): void {
  ngZone.run(() => {
    fn();
    cdr.detectChanges();
  });
}
