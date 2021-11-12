import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuotaComponent } from './create-quota.component';

describe('CreateQuotaComponent', () => {
  let component: CreateQuotaComponent;
  let fixture: ComponentFixture<CreateQuotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateQuotaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateQuotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
