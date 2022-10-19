import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'inbo-header',
  templateUrl: 'inbo-header.component.html',
  styleUrls: ['inbo-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InboHeaderComponent {

  @Input() titles: Array<string> = [];

}
