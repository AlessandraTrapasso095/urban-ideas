import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { PostListComponent } from './posts-list';
import { PostsService } from '../../../users/services/posts.service';
import { Post } from '../../../users/models/gorest-models.model';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;

  const samplePost: Post = {
    id: 10,
    user_id: 2,
    title: 'Titolo test',
    body: 'Body test',
  };

  const postsServiceMock = {
    getPosts: vi.fn(),
    searchPosts: vi.fn(),
    getPostComments: vi.fn(),
    createComment: vi.fn(),
    createPost: vi.fn(),
  };

  const dialogMock = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    postsServiceMock.getPosts.mockReturnValue(
      of({ data: [samplePost], page: 1, pages: 3, total: 30, limit: 10 })
    );

    postsServiceMock.searchPosts.mockReturnValue(
      of({ data: [samplePost], page: 1, pages: 1, total: 1, limit: 10 })
    );

    dialogMock.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });

    await TestBed.configureTestingModule({
      imports: [PostListComponent],
      providers: [
        { provide: PostsService, useValue: postsServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    (component as any).dialog = dialogMock;
    /* uso sempre il dialog mock sull'istanza */
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call loadPosts', () => {
    const spy = vi.spyOn(component, 'loadPosts').mockImplementation(() => {});

    component.ngOnInit();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('loadPosts should call getPosts when search is empty', () => {
    component.searchText = '   ';
    component.page = 2;
    component.perPage = 20;

    component.loadPosts();

    expect(postsServiceMock.getPosts).toHaveBeenCalledWith(2, 20);
    expect(postsServiceMock.searchPosts).not.toHaveBeenCalled();
    expect(component.isSearchMode).toBe(false);
    expect(component.posts.length).toBe(1);
    expect(component.isLoading).toBe(false);
  });

  it('loadPosts should call searchPosts when search has text', () => {
    component.searchText = 'verde';

    component.loadPosts();

    expect(postsServiceMock.searchPosts).toHaveBeenCalledWith('verde', 1, 10);
    expect(component.isSearchMode).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('loadPosts should set safe empty array when data is not an array', () => {
    postsServiceMock.getPosts.mockReturnValueOnce(
      of({ data: null, page: 1, pages: 1, total: 0, limit: 10 })
    );

    component.searchText = '';
    component.loadPosts();

    expect(component.posts).toEqual([]);
  });

  it('loadPosts should set errorMessage on error', () => {
    postsServiceMock.getPosts.mockReturnValueOnce(
      throwError(() => ({ status: 500 }))
    );

    component.searchText = '';
    component.loadPosts();

    expect(component.errorMessage).toContain('Errore caricamento post');
    expect(component.errorMessage).toContain('500');
    expect(component.isLoading).toBe(false);
  });

  it('toggleComments should open and close same post id', () => {
    component.toggleComments(10);
    expect(component.expandedPostId).toBe(10);

    component.toggleComments(10);
    expect(component.expandedPostId).toBeNull();
  });

  it('isExpanded should return true only for opened post', () => {
    component.expandedPostId = 10;

    expect(component.isExpanded(10)).toBe(true);
    expect(component.isExpanded(11)).toBe(false);
  });

  it('trackByPostId should return post id', () => {
    expect(component.trackByPostId(0, samplePost)).toBe(10);
  });

  it('goPrev should decrement page and call loadPosts', () => {
    const spy = vi.spyOn(component, 'loadPosts').mockImplementation(() => {});
    component.page = 3;

    component.goPrev();

    expect(component.page).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('goNext should increment page and call loadPosts', () => {
    const spy = vi.spyOn(component, 'loadPosts').mockImplementation(() => {});
    component.page = 1;
    component.pages = 4;

    component.goNext();

    expect(component.page).toBe(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('applySearch should reset page and expanded state then call loadPosts', () => {
    const spy = vi.spyOn(component, 'loadPosts').mockImplementation(() => {});

    component.page = 4;
    component.expandedPostId = 10;

    component.applySearch();

    expect(component.page).toBe(1);
    expect(component.expandedPostId).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('resetFilters should clear search and call loadPosts', () => {
    const spy = vi.spyOn(component, 'loadPosts').mockImplementation(() => {});

    component.searchText = 'abc';
    component.page = 2;
    component.expandedPostId = 10;

    component.resetFilters();

    expect(component.searchText).toBe('');
    expect(component.page).toBe(1);
    expect(component.expandedPostId).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('onPerPageChange should set page 1 and call loadPosts', () => {
    const spy = vi.spyOn(component, 'loadPosts').mockImplementation(() => {});
    component.page = 6;
    component.expandedPostId = 10;

    component.onPerPageChange();

    expect(component.page).toBe(1);
    expect(component.expandedPostId).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('openCreatePostDialog should reload list when dialog returns created post', () => {
    const spy = vi.spyOn(component, 'loadPosts').mockImplementation(() => {});

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(samplePost),
    });

    component.searchText = 'abc';
    component.page = 3;
    component.expandedPostId = 10;

    component.openCreatePostDialog();

    expect(component.searchText).toBe('');
    expect(component.page).toBe(1);
    expect(component.expandedPostId).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
