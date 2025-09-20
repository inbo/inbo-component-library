import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  anyString,
  deepEqual,
  fnmock,
  instance,
  verify,
  when,
} from '@johanblumenberg/ts-mockito';
import { EMPTY, Observable, Subject } from 'rxjs';
import { RequestState } from '../../../services/api/request-state.enum';
import { InboAutocompleteComponent } from '../inbo-autocomplete.component';

// Define a Test Host Component
@Component({
  standalone: true,
  imports: [InboAutocompleteComponent],
  template: `
    <inbo-autocomplete
      [placeholder]="hostPlaceholder"
      [label]="hostLabel"
      [minNumberOfCharacters]="hostMinNumberOfCharacters"
      [searchFunction]="hostSearchFunction"
      [mask]="hostMask"
      [displayPattern]="hostDisplayPattern"
      [disabled]="hostDisabled"
      [showErrorMessage]="hostShowErrorMessage"
      [showClearIcon]="hostShowClearIcon"
      [errorMessage]="hostErrorMessage"
      (onOptionSelected)="hostOnOptionSelected($event)"></inbo-autocomplete>
  `,
})
class TestHostComponent {
  hostPlaceholder: string;
  hostLabel: string;
  hostMinNumberOfCharacters = 1;
  hostSearchFunction: (searchQuery: string) => Observable<Array<TestObject>>;
  hostMask: string;
  hostDisplayPattern: ((option: TestObject) => string) | string;
  hostDisabled: boolean;
  hostShowErrorMessage: boolean;
  hostShowClearIcon = false;
  hostErrorMessage: string;
  hostOnOptionSelected = fnmock<(value: TestObject) => void>();
}

describe('InboAutocompleteComponent', () => {
  const displayPattern = '${propA} / ${propB} - ${propC}';
  const testObjectInstance = {
    propA: 'a',
    propB: 'b',
    propC: 0,
  };

  let hostFixture: ComponentFixture<TestHostComponent>;
  let testHostComponent: TestHostComponent;
  let componentUnderTest: InboAutocompleteComponent<TestObject>;
  let mockSearchFunction: (val: string) => Observable<Array<TestObject>>;

  beforeEach(async () => {
    mockSearchFunction = fnmock();
    when(mockSearchFunction(anyString())).thenReturn(EMPTY);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = hostFixture.componentInstance;
    testHostComponent.hostSearchFunction = instance(mockSearchFunction);
    hostFixture.detectChanges();

    componentUnderTest = hostFixture.debugElement.query(
      By.directive(InboAutocompleteComponent)
    ).componentInstance;
  });

  describe('set value', () => {
    let onChangeFn: (val: TestObject | undefined) => undefined;
    let onTouchedFn: (val: TestObject | undefined) => undefined;

    beforeEach(() => {
      onChangeFn = fnmock<(val: TestObject | undefined) => undefined>();
      onTouchedFn = fnmock<(val: TestObject | undefined) => undefined>();

      componentUnderTest.registerOnChange(instance(onChangeFn));
      componentUnderTest.registerOnTouched(instance(onTouchedFn));
    });

    it('should call onChange and onTouched if the value is undefined', () => {
      componentUnderTest.value = undefined;
      hostFixture.detectChanges();

      verify(onChangeFn(undefined)).once();
      verify(onTouchedFn(undefined)).once();
    });

    it('should only set the internal value and call onchange and ontouch if the inputfield is null', () => {
      componentUnderTest.value = testObjectInstance;
      hostFixture.detectChanges();

      verify(onChangeFn(deepEqual(testObjectInstance))).once();
      verify(onTouchedFn(deepEqual(testObjectInstance))).once();
    });

    it('should set the internal value and call onchange and ontouch and set native element value of the inputfield element', () => {
      testHostComponent.hostDisplayPattern = displayPattern;
      hostFixture.detectChanges();

      componentUnderTest.value = testObjectInstance;
      hostFixture.detectChanges();

      verify(onChangeFn(deepEqual(testObjectInstance))).once();
      verify(onTouchedFn(deepEqual(testObjectInstance))).once();
      expect(componentUnderTest.displayValue).toEqual('a / b - 0');
    });
  });

  describe('getDisplayValue', () => {
    it('should interpolate the variables in the displayPattern', () => {
      testHostComponent.hostDisplayPattern = displayPattern;
      hostFixture.detectChanges();

      const actual = componentUnderTest.getDisplayValue(testObjectInstance);
      expect(actual).toEqual('a / b - 0');
    });

    it('should return empty string of the displaypattern is undefined', () => {
      testHostComponent.hostDisplayPattern = undefined;
      hostFixture.detectChanges();

      const actual = componentUnderTest.getDisplayValue(testObjectInstance);
      expect(actual).toEqual('');
    });

    it('should return empty string of the value is undefined', () => {
      testHostComponent.hostDisplayPattern = displayPattern;
      hostFixture.detectChanges();

      const actual = componentUnderTest.getDisplayValue(undefined);
      expect(actual).toEqual('');
    });

    it('should return the given value as string if the value is a string', () => {
      testHostComponent.hostDisplayPattern = displayPattern;
      hostFixture.detectChanges();

      const actual = componentUnderTest.getDisplayValue(
        'bla' as unknown as TestObject
      );
      expect(actual).toEqual('bla');
    });

    it('should return the given value as string if the value is a number', () => {
      testHostComponent.hostDisplayPattern = displayPattern;
      hostFixture.detectChanges();

      const actual = componentUnderTest.getDisplayValue(
        5 as unknown as TestObject
      );
      expect(actual).toEqual('5');
    });

    it('should return the given value as string if the value is a boolean', () => {
      testHostComponent.hostDisplayPattern = displayPattern;
      hostFixture.detectChanges();

      const actual = componentUnderTest.getDisplayValue(
        true as unknown as TestObject
      );
      expect(actual).toEqual('true');
    });
  });

  describe('inputChanged', () => {
    let itemsSubject: Subject<Array<TestObject>>;
    const resultWithTwoItems = [testObjectInstance, testObjectInstance];
    const validSearchQuery = 'aaa';
    let specificMockSearchFunction: (
      searchQuery: string
    ) => Observable<Array<TestObject>>;

    beforeEach(() => {
      itemsSubject = new Subject<Array<TestObject>>();
      specificMockSearchFunction =
        fnmock<(searchQuery: string) => Observable<Array<TestObject>>>();
      when(specificMockSearchFunction(anyString())).thenReturn(
        itemsSubject.asObservable()
      );

      testHostComponent.hostSearchFunction = instance(
        specificMockSearchFunction
      );
      hostFixture.detectChanges();
    });

    it('should not do a search and set items to empty array if the given string has a length of less than the minimum number of characters', () => {
      testHostComponent.hostMinNumberOfCharacters = 3;
      hostFixture.detectChanges();
      componentUnderTest.items = resultWithTwoItems;

      componentUnderTest.inputChanged('aa');
      hostFixture.detectChanges();

      verify(specificMockSearchFunction(anyString())).never();
      expect(componentUnderTest.items).toEqual([]);
    });

    it('should do a search if the input is longer than min nr of characters and should update the request state to pending / success', () => {
      testHostComponent.hostMinNumberOfCharacters = 3;
      hostFixture.detectChanges();

      expect(componentUnderTest.requestState).toEqual(RequestState.DEFAULT);

      componentUnderTest.inputChanged(validSearchQuery);
      hostFixture.detectChanges();
      expect(componentUnderTest.requestState).toEqual(RequestState.PENDING);
      verify(specificMockSearchFunction(validSearchQuery)).once();

      itemsSubject.next(resultWithTwoItems);
      itemsSubject.complete();
      hostFixture.detectChanges();

      expect(componentUnderTest.items).toEqual(resultWithTwoItems);
      expect(componentUnderTest.requestState).toEqual(RequestState.SUCCESS);
    });

    it('should do a search if the input is longer than min nr of characters and should update the request state to pending / error when request fails', () => {
      testHostComponent.hostMinNumberOfCharacters = 3;
      hostFixture.detectChanges();

      expect(componentUnderTest.requestState).toEqual(RequestState.DEFAULT);

      componentUnderTest.inputChanged(validSearchQuery);
      hostFixture.detectChanges();
      expect(componentUnderTest.requestState).toEqual(RequestState.PENDING);
      verify(specificMockSearchFunction(validSearchQuery)).once();

      itemsSubject.error(undefined);
      itemsSubject.complete();
      hostFixture.detectChanges();

      expect(componentUnderTest.requestState).toEqual(RequestState.ERROR);
    });

    it('should do a search if the input is longer than min nr of characters and should update the request state to pending / empty when result is empty array', () => {
      testHostComponent.hostMinNumberOfCharacters = 3;
      const result: Array<TestObject> = [];
      hostFixture.detectChanges();

      expect(componentUnderTest.requestState).toEqual(RequestState.DEFAULT);

      componentUnderTest.inputChanged(validSearchQuery);
      hostFixture.detectChanges();
      expect(componentUnderTest.requestState).toEqual(RequestState.PENDING);
      verify(specificMockSearchFunction(validSearchQuery)).once();

      itemsSubject.next(result);
      itemsSubject.complete();
      hostFixture.detectChanges();

      expect(componentUnderTest.requestState).toEqual(RequestState.EMPTY);
    });
  });

  describe('validateFieldValue', () => {
    it('should clear the input field if the value of the input field does not match the display value of the selected item', () => {
      componentUnderTest.value = testObjectInstance;
      hostFixture.detectChanges();

      componentUnderTest.displayValue = 'something else';

      componentUnderTest.validateFieldValue();
      hostFixture.detectChanges();

      expect(componentUnderTest.displayValue).toEqual('');
    });

    it('should not clear the input field if the value of the input field matches the display value of the selected item', () => {
      testHostComponent.hostDisplayPattern = displayPattern;
      hostFixture.detectChanges();
      componentUnderTest.value = testObjectInstance;
      hostFixture.detectChanges();

      componentUnderTest.validateFieldValue();
      hostFixture.detectChanges();

      expect(componentUnderTest.displayValue).toEqual('a / b - 0');
    });
  });

  describe('Masking functionality', () => {
    it('should apply mask pattern correctly for alphanumeric values', () => {
      testHostComponent.hostMask = 'XX-XX-XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'ABC123';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('AB-C1-23');
    });

    it('should handle mask with spaces', () => {
      testHostComponent.hostMask = 'XX XX XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'ABC123';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('AB C1 23');
    });

    it('should handle mask with slashes', () => {
      testHostComponent.hostMask = 'XX/XX/XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'ABC123';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('AB/C1/23');
    });

    it('should handle mixed mask characters', () => {
      testHostComponent.hostMask = 'XX-XX/XX XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'ABC123';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('AB-C1/23 ');
    });

    it('should handle input shorter than mask', () => {
      testHostComponent.hostMask = 'XX-XX-XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'AB';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('AB-');
    });

    it('should handle empty input', () => {
      testHostComponent.hostMask = 'XX-XX-XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('');
    });

    it('should apply mask during input change', () => {
      testHostComponent.hostMask = 'XX-XX-XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'ABC123';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('AB-C1-23');
    });

    it('should not apply mask when no mask is set', () => {
      testHostComponent.hostMask = undefined;
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'ABC123';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('ABC123');
    });

    it('should handle special characters in input', () => {
      testHostComponent.hostMask = 'XX-XX-XX';
      hostFixture.detectChanges();
      const inputElement = hostFixture.debugElement.query(By.css('input'))
        .nativeElement as HTMLInputElement;
      inputElement.value = 'A@B#C$1%2^3';
      inputElement.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      expect(componentUnderTest.displayValue).toBe('AB-C1-23');
    });
  });
});

interface TestObject {
  propA: string;
  propB: string;
  propC: number;
  [key: string]: string | number;
}

// Removed ChangeDetectorRefTestImpl as TestBed will handle ChangeDetectorRef
