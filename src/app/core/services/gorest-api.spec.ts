/* test base gorest api service */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { GorestApiService } from './gorest-api';

describe('GorestApiService', () => {
  let service: GorestApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(GorestApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
