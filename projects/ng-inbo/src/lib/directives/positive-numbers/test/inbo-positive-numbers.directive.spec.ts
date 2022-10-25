import {InboPositiveNumbersDirective} from '../inbo-positive-numbers.directive';
import {instance, mock, spy, verify, when} from '@johanblumenberg/ts-mockito';
import {ElementRef, EventEmitter} from '@angular/core';

describe('InboPositiveNumbersDirective', () => {

  let elementRefMock: ElementRef<HTMLInputElement>;
  let ngModelChangeEventEmitterMock: EventEmitter<string>;

  let directiveUnderTest: InboPositiveNumbersDirective;

  beforeEach(() => {
    elementRefMock = mock(ElementRef<HTMLInputElement>);

    directiveUnderTest = new InboPositiveNumbersDirective(
      instance(elementRefMock),
    );
    ngModelChangeEventEmitterMock = spy(directiveUnderTest.ngModelChange) as any;
  });

  describe('handleInputEvent', () => {

    let inputElement: HTMLInputElement;

    beforeEach(() => {
      inputElement = {value: undefined} as any as HTMLInputElement;
      when(elementRefMock.nativeElement).thenReturn(inputElement);
    });

    it('should filter out all none positive number characters', () => {
      inputElement.value = '123f';

      directiveUnderTest.handleInputEvent();

      expect(inputElement.value).toEqual('123');
      verify(ngModelChangeEventEmitterMock.emit('123')).once();
    });

    it('should do nothing if the value is only positive number characters', () => {
      inputElement.value = '123';

      directiveUnderTest.handleInputEvent();

      expect(inputElement.value).toEqual('123');
      verify(ngModelChangeEventEmitterMock.emit('123')).once();
    });

    it('should do nothing if the value is an empty string', () => {
      inputElement.value = '';

      directiveUnderTest.handleInputEvent();

      verify(ngModelChangeEventEmitterMock.emit(undefined)).once();
    });
  });

});
