import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersList } from './users-list';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/gorest-models.model';

describe('UsersList', () => {
  let component: UsersList;
  let fixture: ComponentFixture<UsersList>;

  const sampleUser: User = {
    id: 1,
    name: 'Mario Rossi',
    email: 'mario@example.com',
    gender: 'male',
    status: 'active',
  };

  const usersServiceMock = {
    getUsers: vi.fn(),
    searchUsers: vi.fn(),
    deleteUser: vi.fn(),
  };

  const dialogMock = {
    open: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    usersServiceMock.getUsers.mockReturnValue(
      of({ data: [sampleUser], page: 1, pages: 3, total: 30, limit: 10 })
    );
    usersServiceMock.searchUsers.mockReturnValue(
      of({ data: [sampleUser], page: 1, pages: 1, total: 1, limit: 10 })
    );
    usersServiceMock.deleteUser.mockReturnValue(of(undefined));

    dialogMock.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    routerMock.navigate.mockReturnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [UsersList],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersList);
    component = fixture.componentInstance;
    (component as any).dialog = dialogMock;
    /* forzo mock dialog sull'istanza:
       evito uso di MatDialog reale nei test metodi */
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call applySearch', () => {
    const spy = vi.spyOn(component, 'applySearch');

    component.ngOnInit();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('applySearch should call getUsers when search is empty', () => {
    component.searchText = '   ';
    component.page = 2;
    component.perPage = 20;

    component.applySearch();

    expect(usersServiceMock.getUsers).toHaveBeenCalledWith(2, 20);
    expect(usersServiceMock.searchUsers).not.toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.page).toBe(1);
    expect(component.pages).toBe(3);
    expect(component.total).toBe(30);
    expect(component.perPage).toBe(10);
    expect(component.isLoading).toBe(false);
  });

  it('applySearch should call searchUsers when search has text', () => {
    component.searchText = 'mario';
    component.searchField = 'name';
    component.page = 1;
    component.perPage = 10;

    component.applySearch();

    expect(usersServiceMock.searchUsers).toHaveBeenCalledWith('mario', 'name', 1, 10);
    expect(usersServiceMock.getUsers).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('applySearch should set errorMessage on error', () => {
    usersServiceMock.getUsers.mockReturnValueOnce(
      throwError(() => ({ status: 500 }))
    );

    component.searchText = '';
    component.applySearch();

    expect(component.errorMessage).toContain('Errore nel caricamento');
    expect(component.errorMessage).toContain('500');
    expect(component.isLoading).toBe(false);
  });

  it('goPrev should not change page when already on first page', () => {
    const spy = vi.spyOn(component, 'applySearch');
    component.page = 1;

    component.goPrev();

    expect(component.page).toBe(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it('goPrev should decrement page and call applySearch', () => {
    const spy = vi.spyOn(component, 'applySearch').mockImplementation(() => {});
    component.page = 3;

    component.goPrev();

    expect(component.page).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('goNext should not change page when already on last page', () => {
    const spy = vi.spyOn(component, 'applySearch');
    component.page = 2;
    component.pages = 2;

    component.goNext();

    expect(component.page).toBe(2);
    expect(spy).not.toHaveBeenCalled();
  });

  it('goNext should increment page and call applySearch', () => {
    const spy = vi.spyOn(component, 'applySearch').mockImplementation(() => {});
    component.page = 1;
    component.pages = 4;

    component.goNext();

    expect(component.page).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('resetFilters should restore defaults and call applySearch', () => {
    const spy = vi.spyOn(component, 'applySearch');

    component.searchText = 'abc';
    component.searchField = 'email';
    component.perPage = 50;
    component.page = 3;

    component.resetFilters();

    expect(component.searchText).toBe('');
    expect(component.searchField).toBe('name');
    expect(component.perPage).toBe(10);
    expect(component.page).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('onPerPageChange should set page to 1 and call applySearch', () => {
    const spy = vi.spyOn(component, 'applySearch');
    component.page = 5;

    component.onPerPageChange();

    expect(component.page).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('goToDetail should navigate to user detail route', () => {
    component.goToDetail(sampleUser);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/users', 1]);
  });

  it('openCreateUserDialog should reload list when user is created', () => {
    const applySpy = vi.spyOn(component, 'applySearch');

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(sampleUser),
    });

    component.page = 4;
    component.openCreateUserDialog();

    expect(component.page).toBe(1);
    expect(applySpy).toHaveBeenCalledTimes(1);
  });

  it('openEditUserDialog should update row with returned user', () => {
    component.dataSource.data = [sampleUser];

    const updatedUser: User = {
      ...sampleUser,
      name: 'Mario Aggiornato',
    };

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(updatedUser),
    });

    component.openEditUserDialog(sampleUser);

    expect(component.dataSource.data[0].name).toBe('Mario Aggiornato');
  });

  it('requestDelete should stop when dialog is not confirmed', () => {
    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(false),
    });

    component.requestDelete(sampleUser);

    expect(usersServiceMock.deleteUser).not.toHaveBeenCalled();
  });

  it('requestDelete should remove row and call applySearch when confirmed', () => {
    vi.useFakeTimers();

    const applySpy = vi.spyOn(component, 'applySearch').mockImplementation(() => {});
    component.dataSource.data = [sampleUser];
    component.total = 1;
    component.page = 2;

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(true),
    });

    usersServiceMock.deleteUser.mockReturnValueOnce(of(undefined));

    component.requestDelete(sampleUser);
    vi.runAllTimers();

    expect(usersServiceMock.deleteUser).toHaveBeenCalledWith(1);
    expect(component.dataSource.data.length).toBe(0);
    expect(component.total).toBe(0);
    expect(component.page).toBe(1);
    expect(applySpy).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBe(false);
  });

  it('requestDelete should set errorMessage when delete fails', () => {
    vi.useFakeTimers();

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(true),
    });

    usersServiceMock.deleteUser.mockReturnValueOnce(
      throwError(() => ({ status: 422 }))
    );

    component.requestDelete(sampleUser);
    vi.runAllTimers();

    expect(component.errorMessage).toContain('Errore eliminazione utente');
    expect(component.errorMessage).toContain('422');
    expect(component.isLoading).toBe(false);
  });
});
