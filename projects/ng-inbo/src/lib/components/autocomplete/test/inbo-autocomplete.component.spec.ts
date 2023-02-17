import {InboAutocompleteComponent} from '../inbo-autocomplete.component';
import {anyString, deepEqual, fnmock, instance, mock, verify} from '@johanblumenberg/ts-mockito';
import {ChangeDetectorRef} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {RequestState} from '../../../services/api/request-state.enum';

describe('InboAutocompleteComponent', () => {

  const displayPattern = '${propA} / ${propB} - ${propC}';
  const testObjectInstance = {
    propA: 'a',
    propB: 'b',
    propC: 0,
  };

  let changeDetectorRef: ChangeDetectorRef;
  let mockSearchFunction: (val: string) => Observable<Array<TestObject>>;

  let componentUnderTest: InboAutocompleteComponent<TestObject>;

  beforeEach(() => {
    changeDetectorRef = mock(ChangeDetectorRefTestImpl);
    mockSearchFunction = fnmock();

    componentUnderTest = new InboAutocompleteComponent(
      instance(changeDetectorRef),
    );
    componentUnderTest.searchFunction = mockSearchFunction;
  });

  describe('set value', () => {
    let onChangeFn: (val: (TestObject | undefined)) => undefined;
    let onTouchedFn: (val: (TestObject | undefined)) => undefined;

    beforeEach(() => {
      onChangeFn = fnmock<(val: TestObject | undefined) => undefined>();
      onTouchedFn = fnmock<(val: TestObject | undefined) => undefined>();

      componentUnderTest.registerOnChange(instance(onChangeFn));
      componentUnderTest.registerOnTouched(instance(onTouchedFn));
    });

    it('should call onChange and onTouched if the value is undefined', () => {
      componentUnderTest.value = undefined as any;

      verify(onChangeFn(undefined)).once();
      verify(onTouchedFn(undefined)).once();
    });

    it('should only set the internal value and call onchange and ontouch if the inputfield is null', () => {
      componentUnderTest.value = testObjectInstance;

      verify(onChangeFn(deepEqual(testObjectInstance))).once();
      verify(onTouchedFn(deepEqual(testObjectInstance))).once();
    });

    it('should set the internal value and call onchange and ontouch and set native element value of the inputfield element', () => {
      componentUnderTest.displayPattern = displayPattern;

      componentUnderTest.value = testObjectInstance;

      verify(onChangeFn(deepEqual(testObjectInstance))).once();
      verify(onTouchedFn(deepEqual(testObjectInstance))).once();
      expect(componentUnderTest.displayValue).toEqual('a / b - 0');
    });
  });

  describe('getDisplayValue', () => {

    it('should interpolate the variables in the displayPattern', () => {
      componentUnderTest.displayPattern = displayPattern;

      const actual = componentUnderTest.getDisplayValue(testObjectInstance);

      expect(actual).toEqual('a / b - 0');
    });

    it('should return empty string of the displaypattern is undefined', () => {
      componentUnderTest.displayPattern = undefined;

      const actual = componentUnderTest.getDisplayValue(testObjectInstance);

      expect(actual).toEqual('');
    });

    it('should return empty string of the value is undefined', () => {
      componentUnderTest.displayPattern = displayPattern;

      const actual = componentUnderTest.getDisplayValue(undefined);

      expect(actual).toEqual('');
    });

    it('should return the given value as string if the value is a string', () => {
      componentUnderTest.displayPattern = displayPattern;

      const actual = componentUnderTest.getDisplayValue('bla' as any);

      expect(actual).toEqual('bla');
    });

    it('should return the given value as string if the value is a number', () => {
      componentUnderTest.displayPattern = displayPattern;

      const actual = componentUnderTest.getDisplayValue(5 as any);

      expect(actual).toEqual('5');
    });

    it('should return the given value as string if the value is a boolean', () => {
      componentUnderTest.displayPattern = displayPattern;

      const actual = componentUnderTest.getDisplayValue(true as any);

      expect(actual).toEqual('true');
    });
  });

  describe('inputChanged', () => {

    let itemsSubject: Subject<Array<TestObject>>;
    const resultWithTwoItems = [testObjectInstance, testObjectInstance];
    const validSearchQuery = 'aaa';

    beforeEach(() => {
      itemsSubject = new Subject<Array<TestObject>>();
      componentUnderTest.searchFunction = () => itemsSubject.asObservable();
    });

    it('should not do a search and set items to empty array if the given string has a length of less than the minimum number of characters', () => {
      componentUnderTest.minNumberOfCharacters = 3;
      componentUnderTest.items = resultWithTwoItems;

      componentUnderTest.inputChanged('aa');

      verify(mockSearchFunction(anyString())).never();
      expect(componentUnderTest.items).toEqual([]);
    });

    it('should do a search if the input is longer than min nr of characters and should update the request state to pending / success', () => {
      componentUnderTest.minNumberOfCharacters = 3;

      expect(componentUnderTest.requestState).toEqual(RequestState.DEFAULT);

      componentUnderTest.inputChanged(validSearchQuery);

      expect(componentUnderTest.requestState).toEqual(RequestState.PENDING);

      itemsSubject.next(resultWithTwoItems);
      itemsSubject.complete();

      expect(componentUnderTest.items).toEqual(resultWithTwoItems);
      verify(changeDetectorRef.detectChanges()).once();
      expect(componentUnderTest.requestState).toEqual(RequestState.SUCCESS);
    });

    it('should do a search if the input is longer than min nr of characters and should update the request state to pending / error when request fails', () => {
      componentUnderTest.minNumberOfCharacters = 3;

      expect(componentUnderTest.requestState).toEqual(RequestState.DEFAULT);

      componentUnderTest.inputChanged(validSearchQuery);

      expect(componentUnderTest.requestState).toEqual(RequestState.PENDING);

      itemsSubject.error(undefined);
      itemsSubject.complete();

      verify(changeDetectorRef.detectChanges()).once();
      expect(componentUnderTest.requestState).toEqual(RequestState.ERROR);
    });

    it('should do a search if the input is longer than min nr of characters and should update the request state to pending / empty when result is empty array', () => {
      componentUnderTest.minNumberOfCharacters = 3;
      const result: Array<TestObject> = [];

      expect(componentUnderTest.requestState).toEqual(RequestState.DEFAULT);

      componentUnderTest.inputChanged(validSearchQuery);

      expect(componentUnderTest.requestState).toEqual(RequestState.PENDING);

      itemsSubject.next(result);
      itemsSubject.complete();

      verify(changeDetectorRef.detectChanges()).once();
      expect(componentUnderTest.requestState).toEqual(RequestState.EMPTY);
    });
  });

  describe('validateFieldValue', () => {

    it('should clear the input field if the value of the input field does not match the display value of the selected item', () => {
      componentUnderTest.value = testObjectInstance;

      componentUnderTest.validateFieldValue();

      expect(componentUnderTest.displayValue).toEqual('');
    });

    it('should not clear the input field if the value of the input field matches the display value of the selected item', () => {
      componentUnderTest.value = testObjectInstance;
      componentUnderTest.displayPattern = displayPattern;
      componentUnderTest.displayValue = 'a / b - 0';

      componentUnderTest.validateFieldValue();

      expect(componentUnderTest.displayValue).toEqual('a / b - 0');
    });
  });
});

interface TestObject {
  propA: string;
  propB: string;
  propC: number;
}

// Creating a test implementation because ts-mockito cannot stub abstract methods from an abstract class.
class ChangeDetectorRefTestImpl extends ChangeDetectorRef {

  checkNoChanges(): void {
  }

  detach(): void {
  }

  detectChanges(): void {
  }

  markForCheck(): void {
  }

  reattach(): void {
  }

}
