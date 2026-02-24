/* test unitari CreatePostDialog:
   verifico create/edit mode e invio form
   senza chiamate HTTP reali */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { CreatePostDialog } from './create-post-dialog';
import { PostsService } from '../../../users/services/posts.service';
import { Post } from '../../../users/models/gorest-models.model';

describe('CreatePostDialog', () => {
  let component: CreatePostDialog;
  let fixture: ComponentFixture<CreatePostDialog>;

  const dialogRefMock = {
    close: vi.fn(),
  };
  /* mock dialog: mi serve per verificare close senza aprire modali reali */

  const postsServiceMock = {
    createPost: vi.fn(),
    updatePost: vi.fn(),
  };
  /* mock service: evito HTTP reali e controllo quale metodo viene chiamato */

  const buildComponent = async (dialogData: { post?: Post } | null = null) => {
    await TestBed.configureTestingModule({
      imports: [CreatePostDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: PostsService, useValue: postsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePostDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    vi.clearAllMocks();

    postsServiceMock.createPost.mockReturnValue(
      of({ id: 91, user_id: 3, title: 'Titolo', body: 'Testo' })
    );

    postsServiceMock.updatePost.mockReturnValue(
      of({ id: 92, user_id: 3, title: 'Titolo edit', body: 'Testo edit' })
    );
  });

  it('should create', async () => {
    await buildComponent();
    expect(component).toBeTruthy();
  });

  it('submit should stop and mark controls when form is invalid', async () => {
    await buildComponent();

    const markAllAsTouchedSpy = vi.spyOn(component.form, 'markAllAsTouched');

    component.submit();

    expect(markAllAsTouchedSpy).toHaveBeenCalledTimes(1);
    expect(postsServiceMock.createPost).not.toHaveBeenCalled();
    expect(postsServiceMock.updatePost).not.toHaveBeenCalled();
  });

  it('submit should call createPost in create mode', async () => {
    await buildComponent();

    component.form.setValue({
      user_id: 7,
      title: 'Nuovo post',
      body: 'Contenuto nuovo post',
    });

    component.submit();

    expect(postsServiceMock.createPost).toHaveBeenCalledWith({
      user_id: 7,
      title: 'Nuovo post',
      body: 'Contenuto nuovo post',
    });
    expect(postsServiceMock.updatePost).not.toHaveBeenCalled();
  });

  it('submit should call updatePost in edit mode', async () => {
    const postToEdit: Post = {
      id: 45,
      user_id: 8,
      title: 'Titolo originale',
      body: 'Testo originale',
    };

    await buildComponent({ post: postToEdit });

    component.form.setValue({
      user_id: 8,
      title: 'Titolo aggiornato',
      body: 'Testo aggiornato',
    });

    component.submit();

    expect(postsServiceMock.updatePost).toHaveBeenCalledWith(45, {
      user_id: 8,
      title: 'Titolo aggiornato',
      body: 'Testo aggiornato',
    });
    expect(postsServiceMock.createPost).not.toHaveBeenCalled();
  });
});
