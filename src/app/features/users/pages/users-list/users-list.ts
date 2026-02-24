/* pagina lista utenti: qui carico gli utenti da GoREST e li mostro */

import { Component, OnInit } from '@angular/core';
/* Component = definisco un componente Angular */
/* OnInit = interfaccia che mi permette di usare ngOnInit() */

import { CommonModule } from '@angular/common';
/* CommonModule = mi serve per usare *ngIf e *ngFor nel template */

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
/* MatTableModule = tabella Angular Material */
/* MatTableDataSource = oggetto che gestisce i dati mostrati nella tabella */

import { UsersService } from '../../services/users.service';
/* UsersService = fa le chiamate HTTP */

import { User, UserSearchField, PaginatedResponse } from '../../models/gorest-models.model';
/* User = tipo singolo utente */
/* UserSearchField = tipo per campo ricerca ('name' | 'email') */
/* PaginatedResponse = risposta con dati + info paginazione */

import { finalize } from 'rxjs/operators';
/* finalize = esegue codice sia in caso di successo che errore */

import { MatFormFieldModule } from '@angular/material/form-field';
/* wrapper per input Material */

import { MatInputModule } from '@angular/material/input';
/* input Material */

import { MatSelectModule } from '@angular/material/select';
/* select Material */

import { MatButtonModule } from '@angular/material/button';
/* bottoni Material */

import { MatTooltipModule } from '@angular/material/tooltip';
/* tooltip Material in overlay: evita che il testo venga tagliato nella tabella */

import { FormsModule } from '@angular/forms';
/* FormsModule = necessario per usare [(ngModel)] */

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
/* MatDialog = servizio per aprire finestre modali */
/* MatDialogModule = supporto dialog nei component standalone */

import { CreateUserDialog } from '../../dialogs/create-user-dialog/create-user-dialog';
/* dialog creazione utente */

import { ConfirmDeleteDialog } from '../../dialogs/confirm-delete-dialog/confirm-delete-dialog';
/* dialog conferma eliminazione */

import { Router } from '@angular/router';
/* Router = mi serve per navigare verso la pagina dettaglio utente */

import { RouterModule } from '@angular/router';

import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
/* DRY: messaggi errore standard */

import { getStatusLabel } from '../../utils/status-label';
/* DRY: helper condiviso per etichetta status */

import {
  DIALOG_SIZE_FORM,
  DIALOG_SIZE_CONFIRM,
} from '../../../../core/constants/dialog-sizes';
/* DRY: dimensioni dialog condivise */

import {
  normalizeSearchText,
  applyPaginationMeta,
  goPrevPage,
  goNextPage,
  resetToFirstPage,
} from '../../../../core/utils/pagination';
/* DRY: helper condivisi per ricerca e paginazione */

@Component({
  selector: 'app-users-list',
  standalone: true,
  /* standalone = non uso NgModule */

  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    RouterModule,
  ],

  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {

  /* =========================
     STATO DELLA PAGINA
  ========================== */

  dataSource = new MatTableDataSource<User>([]);
  /* inizializzo datasource vuota */

  isLoading = false;
  /* flag per mostrare loading */

  errorMessage = '';
  /* messaggio errore da mostrare in pagina */

  readonly displayedColumns: string[] = ['id', 'name', 'email', 'status', 'actions'];
  /* colonne mostrate nella tabella */

  readonly statusLabel = getStatusLabel;
  /* DRY: espongo helper al template per tooltip/aria-label */

  searchText = '';
  /* testo digitato dall’utente */

  searchField: UserSearchField = 'name';
  /* campo su cui cercare */

  perPage = 10;
  /* quanti risultati per pagina */

  page = 1;
  /* pagina corrente */

  pages = 1;
  /* numero totale pagine */

  total = 0;
  /* numero totale record */

  constructor(
    private usersService: UsersService,
    /* inietto il service per poter chiamare le API */

    private dialog: MatDialog,
    /* inietto MatDialog per aprire dialog create/edit/delete */

    private router: Router
    /* inietto Router per navigare al dettaglio utente */
  ) {}

  ngOnInit(): void {
    /* metodo che parte al caricamento del componente */

    this.applySearch();
    /* carico subito la lista utenti */
  }

  /* =========================
     CREATE UTENTE
  ========================== */

  openCreateUserDialog(): void {
    /* apro dialog di creazione */

    const dialogRef = this.dialog.open(CreateUserDialog, {
      ...DIALOG_SIZE_FORM,
      /* DRY: uso preset dimensioni dialog form */
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((createdUser: User | undefined) => {
      /* quando il dialog si chiude */

      if (!createdUser) return;
      /* se annullo non faccio nulla */

      resetToFirstPage(this);
      /* DRY: torno alla prima pagina */

      this.applySearch();
      /* ricarico la lista */
    });
  }

  openEditUserDialog(user: User): void {
  /* apro dialog in modalità edit */

  const dialogRef = this.dialog.open(CreateUserDialog, {
    ...DIALOG_SIZE_FORM,
    /* DRY: stesso preset del create */
    disableClose: true,
    data: { user },
    /* passo l'utente da modificare */
  });

  dialogRef.afterClosed().subscribe((updatedUser: User | undefined) => {
  /* quando chiudo il dialog posso ricevere l'utente aggiornato */

  if (!updatedUser) return;
  /* se annullo, esco */

  this.dataSource.data = this.dataSource.data.map((u) =>
    u.id === updatedUser.id ? updatedUser : u
  );
  /* creo un nuovo array e sostituisco SOLO la riga con lo stesso id */
  /* Angular vede l'array nuovo e la tabella si aggiorna subito */

  // this.applySearch();
  /* opzionale: se vuoi riallinearti al server (header pagination/total), puoi ricaricare */
 });
}

  goToDetail(user: User): void {
    /* navigo verso la pagina dettaglio utente */

    this.router.navigate(['/users', user.id]);
    /* creo l'URL /users/:id */
  }

  /* =========================
     DELETE UTENTE
  ========================== */

  requestDelete(user: User): void {
    /* apro dialog di conferma */

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      ...DIALOG_SIZE_CONFIRM,
      /* DRY: preset dimensioni dialog conferma */
      disableClose: true,
      data: { name: user.name },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {

      if (!confirmed) return;
      /* se non confermo esco */

      /* FIX NG0100:
         uso setTimeout(0) per rimandare la delete al ciclo successivo
      */
      setTimeout(() => {

        this.isLoading = true;
        /* accendo loading */

        this.errorMessage = '';
        /* reset errore */

        this.usersService
          .deleteUser(user.id)
          /* chiamo API DELETE */

          .pipe(
            finalize(() => {
              this.isLoading = false;
              /* spengo loading sempre */
            })
          )
          .subscribe({
            next: () => {
              /* delete ok */

              this.dataSource.data = this.dataSource.data.filter((u) => u.id !== user.id);
              /* tolgo subito la riga dalla tabella */

              this.total = Math.max(0, this.total - 1);
             /* aggiorno il totale client-side per coerenza visiva */

              if (this.dataSource.data.length === 0 && this.page > 1) {
              this.page -= 1;
             /* se ho svuotato la pagina corrente e non sono in pagina 1, torno indietro */
            }

             this.applySearch();
             /* poi ricarico dal server per riallineare paginazione vera dagli header */
            },
            error: (err: unknown) => {
              this.errorMessage = buildHttpErrorMessage('eliminazione utente', err);
            },
          });

      }, 0);
    });
  }

  /* =========================
     LISTA / SEARCH
  ========================== */

  applySearch(): void {

    const cleaned = normalizeSearchText(this.searchText);
    /* DRY: pulisco eventuali spazi con helper condiviso */

    this.isLoading = true;
    this.errorMessage = '';

    const request$ = cleaned
      ? this.usersService.searchUsers(
          cleaned,
          this.searchField,
          this.page,
          this.perPage
        )
      : this.usersService.getUsers(this.page, this.perPage);

    request$
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (res: PaginatedResponse<User>) => {

          this.dataSource.data = res.data;
          /* aggiorno tabella */

          applyPaginationMeta(this, res);
          /* DRY: sincronizzo metadati paginazione */
        },
        error: (err: unknown) => {
         this.errorMessage = buildHttpErrorMessage('nel caricamento', err);
        },
      });
  }

  /* =========================
     PAGINAZIONE
  ========================== */

  goPrev(): void {
    if (!goPrevPage(this)) return;
    /* DRY: guardia + decremento pagina in un unico helper */

    this.applySearch();
  }

  goNext(): void {
    if (!goNextPage(this)) return;
    /* DRY: guardia + incremento pagina in un unico helper */

    this.applySearch();
  }

  resetFilters(): void {
    this.searchText = '';
    this.searchField = 'name';
    this.perPage = 10;
    resetToFirstPage(this);
    /* DRY: reset pagina */
    this.applySearch();
  }

  onPerPageChange(): void {
    resetToFirstPage(this);
    /* DRY: reset pagina quando cambia perPage */
    this.applySearch();
  }
}
