import {InboAutocompleteComponent} from '../inbo-autocomplete.component';
import {anything, deepEqual, fnmock, instance, spy, verify} from '@johanblumenberg/ts-mockito';

describe('InboAutocompleteComponent', () => {

  const displayPattern = '${propA} / ${propB} - ${propC}';
  const testObjectInstance = {
    propA: 'a',
    propB: 'b',
    propC: 0,
  };

  let componentUnderTest: InboAutocompleteComponent<TestObject>;

  beforeEach(() => {
    componentUnderTest = new InboAutocompleteComponent();
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

    it('should should do nothing if the value is nil', () => {
      componentUnderTest.value = undefined as any;

      verify(onChangeFn(undefined)).never();
      verify(onTouchedFn(undefined)).never();
    });

    it('should only set the internal value and call onchange and ontouch if the inputfield is null', () => {
      componentUnderTest.value = testObjectInstance;

      verify(onChangeFn(deepEqual(testObjectInstance))).once();
      verify(onTouchedFn(deepEqual(testObjectInstance))).once();
    });

    it('should set the internal value and call onchange and ontouch and set native element value of the inputfield element', () => {
      componentUnderTest.displayPattern = displayPattern;
      componentUnderTest.inputField = {nativeElement: {value: undefined} as any as HTMLInputElement};

      componentUnderTest.value = testObjectInstance;

      verify(onChangeFn(deepEqual(testObjectInstance))).once();
      verify(onTouchedFn(deepEqual(testObjectInstance))).once();
      expect(componentUnderTest.inputField.nativeElement.value).toEqual('a / b - 0');
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

    it('should not emit an event if the given string has a length of less than the minimum number of characters', () => {
      componentUnderTest.minNumberOfCharacters = 3;
      const searchQueryChangedEventEmitter = spy(componentUnderTest.searchQueryChange);

      componentUnderTest.inputChanged('aa');

      verify(searchQueryChangedEventEmitter.emit(anything())).never();
    });

    it('should emit an event if the given string has a length at least the minimum number of characters', () => {
      componentUnderTest.minNumberOfCharacters = 3;
      const searchQueryChangedEventEmitter = spy(componentUnderTest.searchQueryChange);

      componentUnderTest.inputChanged('aaa');

      verify(searchQueryChangedEventEmitter.emit('aaa')).once();
    });
  });

  describe('validateFieldValue', () => {

    it('should clear the input field if the value of the input field does not match the display value of the selected item', () => {
      componentUnderTest.value = testObjectInstance;
      componentUnderTest.inputField = {nativeElement: {value: 'something else'} as any as HTMLInputElement};

      componentUnderTest.validateFieldValue();

      expect(componentUnderTest.inputField.nativeElement.value).toEqual('');
    });

    it('should not clear the input field if the value of the input field matches the display value of the selected item', () => {
      componentUnderTest.value = testObjectInstance;
      componentUnderTest.displayPattern = displayPattern;
      componentUnderTest.inputField = {nativeElement: {value: 'a / b - 0'} as any as HTMLInputElement};

      componentUnderTest.validateFieldValue();

      expect(componentUnderTest.inputField.nativeElement.value).toEqual('a / b - 0');
    })
  });
});

interface TestObject {
  propA: string;
  propB: string;
  propC: number;
}
