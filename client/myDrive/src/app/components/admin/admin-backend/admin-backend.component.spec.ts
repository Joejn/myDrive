import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBackendComponent } from './admin-backend.component';

describe('AdminBackendComponent', () => {
  let component: AdminBackendComponent;
  let fixture: ComponentFixture<AdminBackendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminBackendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminBackendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
