import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShareAccessComponent } from './edit-share-access.component';

describe('EditShareAccessComponent', () => {
  let component: EditShareAccessComponent;
  let fixture: ComponentFixture<EditShareAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditShareAccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditShareAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
