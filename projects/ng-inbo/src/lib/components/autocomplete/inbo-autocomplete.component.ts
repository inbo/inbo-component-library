import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {RequestState} from '../../services/api/request-state.enum';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {isNil} from 'lodash-es';

@Component({
  selector: 'inbo-autocomplete',
  templateUrl: 'inbo-autocomplete.component.html',
  styleUrls: ['inbo-autocomplete.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: InboAutocompleteComponent, multi: true}],
})
export class InboAutocompleteComponent<T extends Partial<{ [key: string]: any }>> implements ControlValueAccessor {

  readonly RequestState = RequestState;

  @ViewChild('inputField', {static: true}) inputField: ElementRef<HTMLInputElement>;

  @Input() placeholder: string;
  @Input() label: string;
  @Input() minNumberOfCharacters = 1;
  @Input() items: Array<T>;

  // Pattern can be any string where values from the value object are interpolated by marking them with ${<key>}
  // Default values for properties are used if the value from the display properties is null, undefined or a blank string. If no default is specified, it will just be an empty string.
  // Example: '${key1} - ${key2}' wit object {key1: 'value1', key2: 'value2} will be displayed as 'value1 - value2'
  @Input() displayPattern: string;
  @Input() disabled: boolean;
  @Input() requestState = RequestState.DEFAULT;

  @Output() searchQueryChange = new EventEmitter<string>();

  onChange: (value?: T) => void = () => undefined;
  onTouch: (value?: T) => void = () => undefined;

  private _value: T;


  get value(): T {
    return this._value;
  }

  set value(value: T) {
    if(isNil(value)) {
      return;
    }
    this._value = value;
    if (this.inputField) {
      this.inputField.nativeElement.value = this.getDisplayValue(value);
    }

    this.onChange(value);
    this.onTouch(value);
  }

  readonly getDisplayValue = (value: T): string => {
    if (isNil(value) || isNil(this.displayPattern)) {
      return '';
    }
    if (typeof value !== 'object') {
      return `${value}`;
    }
    let result = this.displayPattern;
    Object.keys(value as Partial<{ [key: string]: string }>)
      .forEach(
        key => {
          result = result.replace(`\$\{${key}\}`, `${value[key]}`);
        },
      );
    return result.replace(new RegExp(/\$\{\S*\}/, 'g'), '');
  };

  inputChanged(value: string) {
    if (value?.length >= this.minNumberOfCharacters) {
      this.searchQueryChange.emit(value);
    }
  }

  registerOnChange(onChangeFn: (val: T) => void): void {
    this.onChange = onChangeFn;
  }

  registerOnTouched(onTouchedFn: (val: T) => void): void {
    this.onTouch = onTouchedFn;
  }

  writeValue(obj: T): void {
    this.value = obj;
  }

  validateFieldValue(): void {
    if (this.inputField.nativeElement.value !== this.getDisplayValue(this.value)) {
      this.value = undefined;
      this.clear();
    }
  }

  clear(): void {
    this.inputField.nativeElement.value = '';
  }

  optionSelected(optionSelectedEvent: MatAutocompleteSelectedEvent) {
    this.value = optionSelectedEvent.option.value;
  }
}
