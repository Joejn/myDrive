import { TestBed } from '@angular/core/testing';

import { ColorThemesService } from './color-themes.service';

describe('ColorThemesService', () => {
  let service: ColorThemesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorThemesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
