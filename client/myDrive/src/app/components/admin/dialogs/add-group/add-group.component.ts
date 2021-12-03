import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface Privilege {
  "id": number,
  "name": string
}

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit {

  options: Privilege[] = [{id: 1, name: "system"}, {id: 2, name: "administrator"}]
  mainControl = new FormControl()
  filteredOptions: Observable<Privilege[]> = new Observable
  selectedPrivileges: Privilege[] = []

  constructor() { }

  ngOnInit(): void {
    this.filteredOptions = this.mainControl.valueChanges.pipe(
      startWith(""),
      map(value => (typeof value === "string" ? value : value.name)),
      map(name => (name ? this._filter(name) : this.options.slice()))
    )
  }

  displayFn(privileges: string): string {
    return privileges
  }

  private _filter(name: string) {
    const filterValue = name.toLowerCase()

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue))
  }

  onAddClicked() {
    const privilege = this.mainControl.value
    console.log(privilege)
    if (this.options.includes(privilege) && !this.selectedPrivileges.includes(privilege)) {
      this.selectedPrivileges.push(privilege)
      this.mainControl.setValue("")
    }
  }

}
