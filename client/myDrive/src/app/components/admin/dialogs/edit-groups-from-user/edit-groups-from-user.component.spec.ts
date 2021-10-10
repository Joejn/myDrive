import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupsFromUserComponent } from './edit-groups-from-user.component';

describe('EditGroupsFromUserComponent', () => {
  let component: EditGroupsFromUserComponent;
  let fixture: ComponentFixture<EditGroupsFromUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditGroupsFromUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupsFromUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
