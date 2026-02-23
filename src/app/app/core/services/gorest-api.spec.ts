import { TestBed } from '@angular/core/testing';

import { GorestApi } from './gorest-api';

describe('GorestApi', () => {
  let service: GorestApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GorestApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
