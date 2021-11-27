import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Group } from 'src/app/interfaces/group';
import { GroupsService } from 'src/app/services/groups.service';

export interface GroupRow {
  id: number,
  name: string,
  privileges: string[]
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  @ViewChild(MatMenuTrigger)
  public contextMenu!: MatMenuTrigger

  @ViewChild(MatPaginator) paginator: any = ""

  contextMenuPosition = { x: "0px", y: "0px" }

  allGroups: GroupRow[] = []

  displayColumns: string[] = ["select", "id", "name", "privileges", "delete"]
  dataSource = new MatTableDataSource(this.allGroups)
  selection = new SelectionModel<GroupRow>(true, []);

  constructor(private groups: GroupsService) { }

  ngOnInit(): void {
    this.groups.getAllGroups().subscribe((data: Group[]) => {
      const tableData: GroupRow[] = []
      for (const item of data) {
        tableData.push({
          "id": item.id_group,
          "name": item.name_group,
          "privileges": [item.name_privilege]
        })
      }
      this.allGroups = tableData
      this.dataSource = new MatTableDataSource(tableData)
      this.dataSource.paginator = this.paginator
    })
  }

  onAddClicked() {

  }

  onChangeNameClicked() {

  }
  onDeleteClicked(group: GroupRow) {

  }

  onContextMenuDeleteClicked() {

  }

  onContextMenu(event: MouseEvent, element: GroupRow) {
    event.preventDefault()
    this.contextMenuPosition.x = event.clientX + "px"
    this.contextMenuPosition.y = event.clientY + "px"
    this.contextMenu.menuData = element
    this.contextMenu.menu.focusFirstItem("mouse")
    this.contextMenu.openMenu()
  }

  applyFilter(event: Event) {
    this.selection.clear()
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  // Source: https://material.angular.io/components/table/examples also used code from the same source in HTML file /////////////////////////////////////
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected == numRows
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear()
      return
    }

    this.selection.select(...this.dataSource.data)
  }

  checkboxLabel(row?: GroupRow): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.id + 1}`
  }

}
