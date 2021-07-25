import { Component, OnInit, Input } from '@angular/core';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-text-file',
  templateUrl: './text-file.component.html',
  styleUrls: ['./text-file.component.scss']
})
export class TextFileComponent implements OnInit {

  @Input() title: string = "";
  @Input() content: string = "";
  @Input() path: string = "";

  constructor( private file: FileService) { }

  ngOnInit(): void {
  }

  onChange() {
    console.log("Hallo")
  }

  onSaveButtonClicked( content: string ) {
    this.file.setFileContent(this.path, content).subscribe()
  }

}
