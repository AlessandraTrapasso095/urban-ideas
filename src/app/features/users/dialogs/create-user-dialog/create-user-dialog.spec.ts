import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateUserDialog } from './create-user-dialog';
import { UsersService } from '../../services/users.service';

describe('CreateUserDialog', () => {
  let component: CreateUserDialog;
  let fixture: ComponentFixture<CreateUserDialog>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: () => {},
    };
    /* mock minimo dialog */

    const usersServiceMock = {
      createUser: () => of({}),
      updateUser: () => of({}),
    };
    /* mock minimo service */

    await TestBed.configureTestingModule({
      imports: [CreateUserDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUserDialog);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
