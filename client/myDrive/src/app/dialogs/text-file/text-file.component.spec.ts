import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextFileComponent } from './text-file.component';

describe('TextFileComponent', () => {
  let component: TextFileComponent;
  let fixture: ComponentFixture<TextFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
