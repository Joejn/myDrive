import { TestBed } from '@angular/core/testing';

import { AdministratorsGroupGuard } from './administrators-group.guard';

describe('AdministratorsGroupGuard', () => {
  let guard: AdministratorsGroupGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdministratorsGroupGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
