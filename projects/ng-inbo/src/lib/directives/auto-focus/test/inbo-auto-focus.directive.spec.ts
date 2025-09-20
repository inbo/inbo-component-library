import { fnmock, instance, verify } from '@johanblumenberg/ts-mockito';
import { InboAutofocusDirective } from '../inbo-autofocus.directive';

describe('InboAutofocusDirective', () => {
  let focusMethodMock: (...args: Array<unknown>) => void;

  let directiveUnderTest: InboAutofocusDirective;

  beforeEach(() => {
    focusMethodMock = fnmock();

    directiveUnderTest = new InboAutofocusDirective({
      nativeElement: {
        focus: instance(focusMethodMock),
      },
    });
  });

  describe('ngOnInit', () => {
    it('should call the focus method', () => {
      directiveUnderTest.ngOnInit();

      verify(focusMethodMock()).once();
    });
  });
});
