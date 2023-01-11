import {InboAutofocusDirective} from '../inbo-autofocus.directive';
import {fnmock, instance, verify} from '@johanblumenberg/ts-mockito';

describe('InboAutofocusDirective', () => {

  let focusMethodMock: (...args: any[]) => void;

  let directiveUnderTest: InboAutofocusDirective;

  beforeEach(() => {
    focusMethodMock = fnmock();

    directiveUnderTest = new InboAutofocusDirective(
      {
        nativeElement: {
          focus: instance(focusMethodMock),
        },
      },
    );
  });

  describe('ngOnInit', () => {
    it('should call the focus method', () => {
      directiveUnderTest.ngOnInit();

      verify(focusMethodMock()).once();
    });
  });

});
