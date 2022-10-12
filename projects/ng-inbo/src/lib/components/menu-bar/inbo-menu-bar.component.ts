import {Component, EventEmitter, Input, Output} from '@angular/core';
import {InboMenuItem} from './menu-item.model';

@Component({
  selector: 'inbo-menu-bar',
  templateUrl: 'inbo-menu-bar.component.html',
  styleUrls: ['inbo-menu-bar.component.scss'],
})
export class InboMenuBarComponent {

  @Input() menuItems: Array<InboMenuItem>;
  @Input() loggedInUserName: string;

  @Output() loginButtonClick = new EventEmitter<void>();
}
