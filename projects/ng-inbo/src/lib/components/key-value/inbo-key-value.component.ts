import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'inbo-key-value',
  templateUrl: 'inbo-key-value.component.html',
  styleUrls: ['inbo-key-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboKeyValueComponent {

  readonly JSON = JSON;

  get value(): string | number | Array<string> {
    return this._value || this.defaultValue;
  }

  @Input()
  set value(value: string | number | Array<string>) {
    if (this.isArray(value) && this.asArray(value).length === 1) {
      this._value = this.asArray(value)[0];
    } else {
      this._value = value;
    }
  }

  @Input() key: string;
  @Input() defaultValue = '';
  @Input() showDanger: boolean;

  private _value: string | number | Array<string>;

  isArray(val: any): boolean {
    return val instanceof Array;
  }

  asArray(val: any): Array<string> {
    return <Array<string>>val;
  }
}
