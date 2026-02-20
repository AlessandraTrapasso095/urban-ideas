/* pagina lista utenti: qui carico gli utenti da GoREST e li mostro */

import { Component, OnInit } from '@angular/core';
/* Component = definisco un componente Angular */
/* OnInit = interfaccia che mi permette di usare ngOnInit() */

import { CommonModule } from '@angular/common';
/* CommonModule = mi serve per usare *ngIf e *ngFor nel template */

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
/* MatTableModule = tabella Angular Material */
/* MatTableDataSource = oggetto che gestisce i dati mostrati nella tabella */

import {
  UsersService,
  User,
  UserSearchField,
  PaginatedResponse,
} from '../../services/users.service';
/* UsersService = fa le chiamate HTTP */
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

import { FormsModule } from '@angular/forms';
/* FormsModule = necessario per usare [(ngModel)] */

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
/* MatDialog = servizio per aprire finestre modali */
/* MatDialogModule = supporto dialog nei component standalone */

import { CreateUserDialog } from '../../create-user-dialog/create-user-dialog';
/* dialog creazione utente */

import { ConfirmDeleteDialog } from '../../confirm-delete-dialog/confirm-delete-dialog';
/* dialog conferma eliminazione */

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
    MatDialogModule,
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
    /* service per chiamate API */

    private dialog: MatDialog
    /* servizio per aprire dialog */
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
      width: '520px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((createdUser: User | undefined) => {
      /* quando il dialog si chiude */

      if (!createdUser) return;
      /* se annullo non faccio nulla */

      this.page = 1;
      /* torno alla prima pagina */

      this.applySearch();
      /* ricarico la lista */
    });
  }

  openEditUserDialog(user: User): void {
  /* apro dialog in modalità edit */

  const dialogRef = this.dialog.open(CreateUserDialog, {
    width: '520px',
    disableClose: true,
    data: { user },
    /* passo l'utente da modificare */
  });

  dialogRef.afterClosed().subscribe((updatedUser: User | undefined) => {
  if (!updatedUser) return;

  this.dataSource.data = this.dataSource.data.map((u) =>
    u.id === updatedUser.id ? updatedUser : u
   );
 });
}


  /* =========================
     DELETE UTENTE
  ========================== */

  requestDelete(user: User): void {
    /* apro dialog di conferma */

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '420px',
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

              this.applySearch();
              /* ricarico lista dal server */
            },
            error: (err: unknown) => {

              const status =
                typeof err === 'object' &&
                err !== null &&
                'status' in err
                  ? (err as { status?: number }).status
                  : undefined;

              this.errorMessage =
                `Errore eliminazione utente (status: ${status ?? 'unknown'})`;
            },
          });

      }, 0);
    });
  }

  /* =========================
     LISTA / SEARCH
  ========================== */

  applySearch(): void {

    const cleaned = this.searchText.trim();
    /* pulisco eventuali spazi */

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

          this.page = res.page;
          this.pages = res.pages;
          this.total = res.total;
          this.perPage = res.limit;
        },
        error: (err: unknown) => {

          const status =
            typeof err === 'object' &&
            err !== null &&
            'status' in err
              ? (err as { status?: number }).status
              : undefined;

          this.errorMessage =
            `Errore nel caricamento (status: ${status ?? 'unknown'})`;
        },
      });
  }

  /* =========================
     PAGINAZIONE
  ========================== */

  goPrev(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.applySearch();
  }

  goNext(): void {
    if (this.page >= this.pages) return;
    this.page += 1;
    this.applySearch();
  }

  resetFilters(): void {
    this.searchText = '';
    this.searchField = 'name';
    this.perPage = 10;
    this.page = 1;
    this.applySearch();
  }

  onPerPageChange(): void {
    this.page = 1;
    this.applySearch();
  }
}
