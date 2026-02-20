import { Component, inject } from '@angular/core';
/* Component = definisco componente; inject = DI moderna */

import { CommonModule } from '@angular/common';
/* CommonModule = per *ngIf */

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
/* MatDialogModule = struttura dialog */
/* MatDialogRef = riferimento al dialog per chiuderlo */
/* MAT_DIALOG_DATA = dati passati dal chiamante */

import { MatButtonModule } from '@angular/material/button';
/* MatButtonModule = bottoni Material */

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  /* standalone = nessun NgModule */

  imports: [CommonModule, MatDialogModule, MatButtonModule],
  /* import necessari per template */

  templateUrl: './confirm-delete-dialog.html',
  styleUrl: './confirm-delete-dialog.scss',
})
export class ConfirmDeleteDialog {
  /* dialog di conferma eliminazione */

  private dialogRef = inject(MatDialogRef<ConfirmDeleteDialog>);
  /* mi serve per chiudere il dialog */

  data = inject(MAT_DIALOG_DATA) as { name?: string };
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
