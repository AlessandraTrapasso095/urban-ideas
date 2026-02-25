/* pagina lista utenti: qui carico gli utenti da GoREST e li mostro */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { UsersService } from '../../services/users.service';
import { User, UserSearchField, PaginatedResponse } from '../../models/gorest-models.model';
import { finalize } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateUserDialog } from '../../dialogs/create-user-dialog/create-user-dialog';
import { ConfirmDeleteDialog } from '../../dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { buildHttpErrorMessage } from '../../../../core/utils/http-messages';
import { getStatusLabel } from '../../utils/status-label';
import {
  DIALOG_SIZE_FORM,
  DIALOG_SIZE_CONFIRM,
} from '../../../../core/constants/dialog-sizes';

import {
  normalizeSearchText,
  applyPaginationMeta,
  goPrevPage,
  goNextPage,
  resetToFirstPage,
} from '../../../../core/utils/pagination';

@Component({
  selector: 'app-users-list',
  standalone: true,

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

  /* STATO DELLA PAGINA */

  dataSource = new MatTableDataSource<User>([]);
  /* inizializzo datasource vuota */

  isLoading = false;
  /* flag per mostrare loading */

  errorMessage = '';
  /* messaggio errore da mostrare in pagina */

  readonly displayedColumns: string[] = ['id', 'name', 'email', 'status', 'actions'];
  /* colonne mostrate nella tabella */

  readonly statusLabel = getStatusLabel;
  /* espongo helper al template */

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

  /* CREATE UTENTE */

  openCreateUserDialog(): void {
    /* apro dialog di creazione */

    const dialogRef = this.dialog.open(CreateUserDialog, {
      ...DIALOG_SIZE_FORM,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((createdUser: User | undefined) => {
      /* quando il dialog si chiude */

      if (!createdUser) return;
      /* se annullo non faccio nulla */

      resetToFirstPage(this);
      /* torno alla prima pagina */

      this.applySearch();
      /* ricarico la lista */
    });
  }

  openEditUserDialog(user: User): void {
  /* apro dialog in modalità edit */

  const dialogRef = this.dialog.open(CreateUserDialog, {
    ...DIALOG_SIZE_FORM,
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
  /* creo un nuovo array e sostituisco solo la riga con lo stesso id */
  /* cosi Angular vede l'array e la tabella si aggiorna subito */
 });
}

  goToDetail(user: User): void {
    /* navigo verso la pagina dettaglio utente */

    this.router.navigate(['/users', user.id]);
    /* creo l'URL /users/:id */
  }

  /* DELETE UTENTE */

  requestDelete(user: User): void {
    /* apro dialog di conferma */

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      ...DIALOG_SIZE_CONFIRM,
      disableClose: true,
      data: { name: user.name },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {

      if (!confirmed) return;
      /* se non confermo esco */

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
             /* aggiorno */

              if (this.dataSource.data.length === 0 && this.page > 1) {
              this.page -= 1;
             /* se ho svuotato la pagina corrente e non sono in pagina 1, torno indietro */
            }

             this.applySearch();
             /* poi ricarico dal server */
            },
            error: (err: unknown) => {
              this.errorMessage = buildHttpErrorMessage('eliminazione utente', err);
            },
          });

      }, 0);
    });
  }

  /* LISTA / SEARCH */

  applySearch(): void {
    /* carica utenti con o senza filtro ricerca */

    const cleaned = normalizeSearchText(this.searchText);

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
          /* sincronizzo meta paginazione */
        },
        error: (err: unknown) => {
         /* in errore mostro messaggio all'utente */
         this.errorMessage = buildHttpErrorMessage('nel caricamento', err);
        },
      });
  }

  /* PAGINAZIONE */

  goPrev(): void {
    if (!goPrevPage(this)) return;

    this.applySearch();
  }

  goNext(): void {
    if (!goNextPage(this)) return;

    this.applySearch();
  }

  resetFilters(): void {
    /* resetto tutti i filtri ai valori iniziali */
    this.searchText = '';
    this.searchField = 'name';
    this.perPage = 10;
    resetToFirstPage(this);
    this.applySearch();
  }

  onPerPageChange(): void {
    resetToFirstPage(this);
    this.applySearch();
  }
}
