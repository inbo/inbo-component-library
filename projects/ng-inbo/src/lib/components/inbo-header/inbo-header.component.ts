import {Component, Input} from '@angular/core';

@Component({
  selector: 'inbo-header',
  templateUrl: 'inbo-header.component.html',
  styleUrls: ['inbo-header.component.scss'],
})
export class InboHeaderComponent {

  @Input() titles: Array<string> = [];

}
