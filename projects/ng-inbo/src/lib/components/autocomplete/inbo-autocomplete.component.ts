import {
  ChangeDetectorRef,
  Component,
  input,
  output,
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
import { MatIconButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { isNil } from 'lodash-es';
import { finalize, Observable, tap } from 'rxjs';
import { InboDebouncedInputChangeDirective } from '../../directives/debounced-input-change/inbo-debounced-input-change.directive';
import { InboInputMaskDirective } from '../../directives/input-mask/inbo-input-mask.directive';
import { RequestState } from '../../services/api/request-state.enum';
import { CustomErrorStateMatcher } from '../../utils/custom.error-state-matcher';

@Component({
  selector: 'inbo-autocomplete',
  templateUrl: 'inbo-autocomplete.component.html',
  styleUrls: ['inbo-autocomplete.component.scss'],
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
    MatIconButton,
    MatProgressSpinner,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InboAutocompleteComponent,
      multi: true,
    },
  ],
  standalone: true,
})
export class InboAutocompleteComponent<
  T extends Partial<Record<string, unknown>>,
> implements ControlValueAccessor
{
  readonly RequestState = RequestState;

  readonly optionSelected = output<T>();

  readonly placeholder = input<string>();
  readonly label = input<string>();
  readonly minNumberOfCharacters = input(1);
  readonly searchFunction =
    input<(searchQuery: string) => Observable<Array<T>>>();
  readonly mask = input<string>();

  // Pattern can be any string where values from the value object are interpolated by marking them with ${<key>}
  // Default values for properties are used if the value from the display properties is null, undefined or a blank string. If no default is specified, it will just be an empty string.
  // Example: '${key1} - ${key2}' with object {key1: 'value1', key2: 'value2'} will be displayed as 'value1 - value2'
  readonly displayPattern = input<((option: T) => string) | string>();
  readonly disabled = input<boolean>();
  readonly showErrorMessage = input<boolean>();
  readonly showClearIcon = input(false);
  readonly errorMessage = input<string>();

  displayValue = '';
  requestState = RequestState.DEFAULT;
  items: Array<T>;
  errorStateMatcher = new CustomErrorStateMatcher(() =>
    this.showErrorMessage()
  );

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  private _value: T;

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this.displayValue = this.getDisplayValue(value);
    this._value = value;
    this.onChange(value);
    this.onTouch(value);
  }

  onChange: (value?: T) => void = () => undefined;
  onTouch: (value?: T) => void = () => undefined;

  readonly getDisplayValue = (value: T): string => {
    if (isNil(value)) {
      return '';
    }

    if (typeof this.displayPattern() === 'function') {
      try {
        return (this.displayPattern() as (option: T) => string)(value) || '';
      } catch (e) {
        console.error('Error executing displayPattern function', e);
        return '[Error]';
      }
    } else if (
      typeof this.displayPattern() === 'string' &&
      typeof value === 'object'
    ) {
      let result = this.displayPattern() as string;
      Object.keys(value as Partial<Record<string, unknown>>).forEach(key => {
        result = result.replace(`$\{${key}}`, `${value[key] ?? ''}`);
      });
      return result.replace(new RegExp(/\$\{\S*}/, 'g'), '');
    }

    if (typeof value === 'object' && value !== null) {
      return '';
    }

    return `${value}`;
  };

  inputChanged(value: string) {
    this.displayValue = value;

    if (value?.length >= this.minNumberOfCharacters()) {
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
    }
  }

  clearValue(): void {
    this.value = undefined;
  }

  onOptionSelected(optionSelectedEvent: MatAutocompleteSelectedEvent) {
    this.value = optionSelectedEvent.option.value;
    this.optionSelected.emit(this.value);
  }

  private doSearch(searchQuery: string): void {
    if (!this.searchFunction()) {
      console.error('No search function was provided.');
      this.items = [];
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.requestState = RequestState.PENDING;
    this.searchFunction()!(searchQuery)
      .pipe(
        tap(value => (this.items = value || [])),
        tap(
          items => (this.requestState = this.getRequestStateForResults(items))
        ),
        finalize(() => {
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe({
        error: () => (this.requestState = RequestState.ERROR),
      });
  }

  private getRequestStateForResults(items: Array<unknown>): RequestState {
    return items?.length > 0 ? RequestState.SUCCESS : RequestState.EMPTY;
  }
}
