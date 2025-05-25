import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgStringPipesModule } from 'ngx-pipes';

@Component({
  selector: 'inbo-key-value',
  templateUrl: 'inbo-key-value.component.html',
  styleUrls: ['inbo-key-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgStringPipesModule],
})
export class InboKeyValueComponent {
  readonly JSON = JSON;

  key = input<string>();
  defaultValue = input<string | number | Array<string>>('');
  value = input<
    string | number | Array<string> | undefined | null,
    string | number | Array<string> | undefined | null
  >(undefined, {
    transform: (value: string | number | Array<string> | undefined | null) => {
      if (this.isArray(value) && this.asArray(value).length === 1) {
        return this.asArray(value)[0];
      }
      return value;
    },
  });

  processedValue = computed(() => this.value() || this.defaultValue());

  isArray(val: any): val is Array<any> {
    return Array.isArray(val);
  }

  asArray(val: any): Array<string> {
    return val as Array<string>;
  }
}
