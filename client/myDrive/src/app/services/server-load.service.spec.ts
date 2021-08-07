import { TestBed } from '@angular/core/testing';

import { ServerLoadService } from './server-load.service';

describe('ServerLoadService', () => {
  let service: ServerLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
