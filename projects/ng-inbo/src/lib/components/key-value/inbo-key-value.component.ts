import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'inbo-key-value',
  templateUrl: 'inbo-key-value.component.html',
  styleUrls: ['inbo-key-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboKeyValueComponent {

  @Input() key: string;
  @Input() value: string | number
  @Input() defaultValue: string | number;
}
