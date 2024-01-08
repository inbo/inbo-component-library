import {ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {RequestState} from '../../services/api/request-state.enum';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {isNil} from 'lodash-es';
import {CustomErrorStateMatcher} from '../../utils/custom.error-state-matcher';
import {finalize, Observable, tap} from 'rxjs';

@Component({
  selector: 'inbo-autocomplete',
  templateUrl: 'inbo-autocomplete.component.html',
  styleUrls: ['inbo-autocomplete.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: InboAutocompleteComponent, multi: true},
  ],
})
export class InboAutocompleteComponent<T extends Partial<{ [key: string]: any }>> implements ControlValueAccessor {

  readonly RequestState = RequestState;

  @Output() onOptionSelected = new EventEmitter<T>();
  @Output() onValueCleared = new EventEmitter<T>();

  @Input() placeholder: string;
  @Input() label: string;
  @Input() minNumberOfCharacters = 1;
  @Input() searchFunction: (searchQuery: string) => Observable<Array<T>>;

  // Pattern can be any string where values from the value object are interpolated by marking them with ${<key>}
  // Default values for properties are used if the value from the display properties is null, undefined or a blank string. If no default is specified, it will just be an empty string.
  // Example: '${key1} - ${key2}' with object {key1: 'value1', key2: 'value2'} will be displayed as 'value1 - value2'
  @Input() displayPattern: string;
  @Input() disabled: boolean;
  @Input() showErrorMessage: boolean;
  @Input() showClearIcon: boolean = false;
  @Input() errorMessage: string;

  displayValue: string = '';
  requestState = RequestState.DEFAULT;
  items: Array<T>;
  errorStateMatcher = new CustomErrorStateMatcher(() => this.showErrorMessage);

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  private _value: T;

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    if (!isNil(value)) {
      this._value = value;
      this.displayValue = this.getDisplayValue(value);
    }
    this.onChange(value);
    this.onTouch(value);
  }

  onChange: (value?: T) => void = () => undefined;

  onTouch: (value?: T) => void = () => undefined;

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
    return result.replace(new RegExp(/\$\{\S*}/, 'g'), '');
  };

  inputChanged(value: string) {
    if (value?.length >= this.minNumberOfCharacters) {
      this.doSearch(value);
    } else {
      this.items = [];
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
    if (this.displayValue !== this.getDisplayValue(this.value)) {
      this.value = undefined;
      this.clear();
    }
  }

  clear(): void {
    this.displayValue = '';
  }

  clearValue(): void {
    this.displayValue = '';
    this._value = undefined;
    this.onValueCleared.emit();
    // clear value why is model not updated?
    this.onChange(undefined);
  }

  optionSelected(optionSelectedEvent: MatAutocompleteSelectedEvent) {
    this.value = optionSelectedEvent.option.value;
    this.onOptionSelected.emit(this.value);
  }

  private doSearch(searchQuery: string): void {
    if (!this.searchFunction) {
      console.error('No search function was provided. Don\'t forget to bind the component to the function you pass using a field with an arrow function or .bind(this)');
      this.items = [];
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.requestState = RequestState.PENDING;
    this.searchFunction(searchQuery)
      .pipe(
        tap(value => this.items = (value || [])),
        tap(items => this.requestState = this.getRequestStateForResults(items)),
        finalize(() => this.changeDetectorRef.detectChanges()),
      )
      .subscribe({
        error: () => this.requestState = RequestState.ERROR,
      });
  }

  private getRequestStateForResults(items: Array<any>): RequestState {
    return items?.length > 0 ? RequestState.SUCCESS : RequestState.EMPTY;
  }
}


