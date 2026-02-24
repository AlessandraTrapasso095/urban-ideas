import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import { CreatePostDialog } from './create-post-dialog';
import { PostsService } from '../../../users/services/posts.service';

describe('CreatePostDialog', () => {
  let component: CreatePostDialog;
  let fixture: ComponentFixture<CreatePostDialog>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: () => {},
    };
    /* mock minimo del dialog */

    const postsServiceMock = {
      createPost: () => of({}),
    };
    /* mock minimo service per evitare chiamate HTTP reali */

    await TestBed.configureTestingModule({
      imports: [CreatePostDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: PostsService, useValue: postsServiceMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePostDialog);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
