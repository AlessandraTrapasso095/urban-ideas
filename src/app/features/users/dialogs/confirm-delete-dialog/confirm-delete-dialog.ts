/* dialog di conferma eliminazione: mostra conferma e restituisce true/false al chiamante */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,

  imports: [CommonModule, MatDialogModule, MatButtonModule],
  /* import necessari per template */

  templateUrl: './confirm-delete-dialog.html',
  styleUrl: './confirm-delete-dialog.scss',
})
export class ConfirmDeleteDialog {
  /* dialog di conferma eliminazione */

  private dialogRef = inject(MatDialogRef<ConfirmDeleteDialog>);
  /* mi serve per chiudere il dialog */

  data = inject(MAT_DIALOG_DATA) as { name?: string; itemType?: 'utente' | 'post' };
  /* ricevo i dati (es. nome) dal chiamante */

  cancel(): void {
    /* annulla eliminazione */

    this.dialogRef.close(false);
    /* chiudo e restituisco false */
  }

  confirm(): void {
    /* conferma eliminazione */

    this.dialogRef.close(true);
    /* chiudo e restituisco true */
  }
}
