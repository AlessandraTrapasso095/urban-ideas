/* test componente commenti post */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { PostCommentsComponent } from './post-comments';
import { PostsService } from '../../services/posts.service';
import { Comment } from '../../models/gorest-models.model';

describe('PostCommentsComponent', () => {
  let component: PostCommentsComponent;
  let fixture: ComponentFixture<PostCommentsComponent>;

  const commentMock: Comment = {
    id: 1,
    post_id: 10,
    name: 'Anna',
    email: 'anna@example.com',
    body: 'Bel post!',
  };

  const postsServiceMock = {
    getPostComments: vi.fn(),
    createComment: vi.fn(),
  };
  /* mock service API commenti */

  beforeEach(async () => {
    postsServiceMock.getPostComments.mockReturnValue(of([commentMock]));
    postsServiceMock.createComment.mockReturnValue(of(commentMock));

    await TestBed.configureTestingModule({
      imports: [PostCommentsComponent],
      providers: [{ provide: PostsService, useValue: postsServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCommentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    /* pulisco tutti gli spy tra un test e l'altro */
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges should set error when postId is invalid', () => {
    component.postId = 0;

    component.ngOnChanges({
      postId: new SimpleChange(undefined, 0, true),
    });

    expect(component.errorMessage).toBe('Post non valido.');
    expect(component.comments).toEqual([]);
    expect(postsServiceMock.getPostComments).not.toHaveBeenCalled();
  });

  it('ngOnChanges should load comments when postId is valid', () => {
    component.postId = 10;

    component.ngOnChanges({
      postId: new SimpleChange(undefined, 10, true),
    });

    expect(postsServiceMock.getPostComments).toHaveBeenCalledWith(10);
    expect(component.comments.length).toBe(1);
    expect(component.isLoading).toBe(false);
  });

  it('ngOnChanges should handle error on comments load', () => {
    postsServiceMock.getPostComments.mockReturnValueOnce(
      throwError(() => ({ status: 404 }))
    );

    component.postId = 10;

    component.ngOnChanges({
      postId: new SimpleChange(undefined, 10, true),
    });

    expect(component.comments).toEqual([]);
    expect(component.errorMessage).toContain('Errore caricamento commenti');
    expect(component.errorMessage).toContain('404');
    expect(component.isLoading).toBe(false);
  });

  it('trackByCommentId should return comment id', () => {
    expect(component.trackByCommentId(0, commentMock)).toBe(1);
  });

  it('submit should stop when postId is invalid', () => {
    component.postId = 0;

    component.submit();

    expect(postsServiceMock.createComment).not.toHaveBeenCalled();
  });

  it('submit should set validation error when draft fields are missing', () => {
    component.postId = 10;
    component.draft = { name: '  ', email: '  ', body: '  ' };

    component.submit();

    expect(component.submitError).toBe('Compila tutti i campi.');
    expect(postsServiceMock.createComment).not.toHaveBeenCalled();
  });

  it('submit should create comment and prepend list on success', () => {
    component.postId = 10;
    component.comments = [];
    component.draft = {
      name: ' Mario ',
      email: ' mario@example.com ',
      body: ' Nuovo commento ',
    };

    component.submit();

    expect(postsServiceMock.createComment).toHaveBeenCalledWith(10, {
      name: 'Mario',
      email: 'mario@example.com',
      body: 'Nuovo commento',
    });

    expect(component.comments.length).toBe(1);
    expect(component.comments[0].id).toBe(1);
    expect(component.draft).toEqual({ name: '', email: '', body: '' });
    expect(component.isSubmitting).toBe(false);
  });

  it('submit should set submitError when createComment fails', () => {
    postsServiceMock.createComment.mockReturnValueOnce(
      throwError(() => ({ status: 422 }))
    );

    component.postId = 10;
    component.draft = {
      name: 'Mario',
      email: 'mario@example.com',
      body: 'test',
    };

    component.submit();

    expect(component.submitError).toContain('Errore invio commento');
    expect(component.submitError).toContain('422');
    expect(component.isSubmitting).toBe(false);
  });
});
