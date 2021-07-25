import { AfterViewInit, Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-file',
  templateUrl: './image-file.component.html',
  styleUrls: ['./image-file.component.scss']
})
export class ImageFileComponent implements AfterViewInit {

  @Input() title: string = "";
  @Input() content: string = "";

  constructor() { }

  ngAfterViewInit(): void {

    const div = document.getElementById("mainContent")
    const img = document.createElement("img")
    img.id = "main_image"
    img.src = `data:image/jpeg;base64, ${this.content}`
    img.style.borderRadius = "0.4em"
    img.style.height = "100%"
    img.style.maxWidth = "100%"

    div?.appendChild(img)
  }

  download() {
    // https://stackoverflow.com/questions/8126623/downloading-canvas-element-to-an-image
    let a = document.createElement("a");
    a.style.display = "none"
    a.download = this.title
    a.href = `data:image/jpeg;base64, ${this.content}`
    a.click()
  }

}
