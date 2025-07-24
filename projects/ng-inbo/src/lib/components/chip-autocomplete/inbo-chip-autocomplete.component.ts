import {
  Component,
  ContentChild,
  input,
  model,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InboDebouncedInputChangeDirective } from '../../directives/debounced-input-change/inbo-debounced-input-change.directive';
import { InboInputMaskDirective } from '../../directives/input-mask/inbo-input-mask.directive';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'inbo-chip-autocomplete',
  templateUrl: 'inbo-chip-autocomplete.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatAutocompleteModule,
    FormsModule,
    InboInputMaskDirective,
    InboDebouncedInputChangeDirective,
    MatProgressSpinnerModule,
    MatChipsModule,
    NgTemplateOutlet,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InboChipAutocompleteComponent,
      multi: true,
    },
  ],
  standalone: true,
})
export class InboChipAutocompleteComponent<
  T extends Partial<Record<string, unknown>>,
> implements ControlValueAccessor
{
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  readonly placeholder = input<string>();
  filteredValues = model<any[]>();
  input = model<string>();

  private _value: T[] = [];

  @ContentChild('selectedTemplate', { read: TemplateRef })
  selectedTemplate?: TemplateRef<any>;
  @ContentChild('optionTemplate', { read: TemplateRef })
  optionTemplate!: TemplateRef<any>;

  get value(): T[] {
    return this._value;
  }

  addValue(value: T) {
    if (value) {
      this._value = [...this._value, value];
      this.onChange(this._value);
      this.onTouch(this._value);
    }
  }

  removeValue(value: T) {
    this._value = [...this._value.filter(value1 => value1 != value)];
    this.onChange(this._value);
    this.onTouch(this._value);
  }

  setList(value: T[]) {
    this._value = value;
    this.onChange(this._value);
    this.onTouch(this._value);
  }

  onChange: (value?: T[]) => void = () => undefined;
  onTouch: (value?: T[]) => void = () => undefined;

  registerOnChange(onChangeFn: (val: T[]) => void): void {
    this.onChange = onChangeFn;
  }

  registerOnTouched(onTouchedFn: (val: T[]) => void): void {
    this.onTouch = onTouchedFn;
  }

  writeValue(obj: T[]): void {
    this.setList(obj);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.addValue(event.option.value.id);
    this.resetInput();
    event.option.deselect();
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const firstFilteredCounter = this.filteredValues()[0];
    if (value && firstFilteredCounter) {
      this.addValue(firstFilteredCounter.id);
    }
    this.resetInput();
  }

  remove(value: T): void {
    this.removeValue(value);
  }

  private resetInput(): void {
    this.input.set('');
  }
}
