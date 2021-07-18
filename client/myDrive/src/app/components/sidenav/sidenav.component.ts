import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

interface FlatNode {
  expandable: boolean,
  name: string,
  level: number
}

interface ItemNode {
  name: string;
  children?: ItemNode[];
}

const TREE_DATA: ItemNode[] = [
  {
    name: "myDrive",
    children: [
      {
        name: 'Images',
        children: [
          {name: 'img 1'},
          {name: 'img 2'},
          {name: 'img 3'},
        ]
      }, {
        name: 'Documents',
        children: [
          {
            name: 'privat',
            children: [
              {name: 'secret file'}
            ]
          }, {
            name: 'public',
            children: [
              {name: 'public file'},
            ]
          },
        ]
      },
    ]
  }
];

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit(): void {
  }

  private _transformer = (node: ItemNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level
    }
  }

  treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable)

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatNode) => node.expandable

}
