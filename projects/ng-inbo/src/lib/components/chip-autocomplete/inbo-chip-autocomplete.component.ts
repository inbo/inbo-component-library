import {
  Component,
  computed,
  ContentChild,
  input,
  model,
  signal,
  TemplateRef,
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
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'inbo-chip-autocomplete',
  templateUrl: 'inbo-chip-autocomplete.component.html',
  styleUrl: 'inbo-chip-autocomplete.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    NgTemplateOutlet,
    FormsModule,
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
  U extends Partial<Record<keyof U, U[keyof U]>>, // option object
  T extends keyof U = keyof U, // value
> implements ControlValueAccessor
{
  readonly separatorKeysCodes: Array<number> = [ENTER, COMMA];

  readonly placeholder = input<string>();
  readonly label = input<string>();
  readonly isLoading = input<boolean>(false);
  readonly isDisabled = signal<boolean>(false);

  filteredValues = model<Array<U>>();
  inputText = model<string>('');
  valueProperty = input<T>('id' as T);

  value = signal<Array<T>>([]);

  hasValues = computed(() => this.value().length > 0);
  firstFilteredValue = computed(() => this.filteredValues()?.[0]);

  @ContentChild('selectedTemplate', { read: TemplateRef })
  selectedTemplate?: TemplateRef<{ $implicit: T }>;
  @ContentChild('optionTemplate', { read: TemplateRef })
  optionTemplate!: TemplateRef<{ $implicit: U }>;

  addValue(value: T) {
    if (value) {
      const newValue = [...this.value(), value];
      this.value.set(newValue);
      this.onChange(newValue);
      this.onTouch(newValue);
    }
  }

  removeValue(value: T) {
    const newValue = this.value().filter(value1 => value1 !== value);
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouch(newValue);
  }

  setList(value: Array<T>) {
    this.value.set(value);
    this.onChange(value);
    this.onTouch(value);
  }

  onChange: (value?: Array<T>) => void = () => undefined;
  onTouch: (value?: Array<T>) => void = () => undefined;

  registerOnChange(onChangeFn: (val: Array<T>) => void): void {
    this.onChange = onChangeFn;
  }

  registerOnTouched(onTouchedFn: (val: Array<T>) => void): void {
    this.onTouch = onTouchedFn;
  }

  writeValue(obj: Array<T>): void {
    this.setList(obj);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.addValue(event.option.value.id);
    this.resetInput();
    event.option.deselect();
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const firstFilteredOption = this.firstFilteredValue();
    if (value && firstFilteredOption) {
      const extractedValue = firstFilteredOption[
        this.valueProperty()
      ] as unknown as T;
      this.addValue(extractedValue);
    }
    this.resetInput();
  }

  remove(value: T): void {
    this.removeValue(value);
  }

  private resetInput(): void {
    this.inputText.set('');
  }

  getAriaLabel(value: T): string {
    return `Remove ${String(value)}`;
  }

  getSelectedAriaLabel(value: T): string {
    return `Selected: ${String(value)}`;
  }

  getValueAsString(value: T): string {
    return String(value);
  }
}
