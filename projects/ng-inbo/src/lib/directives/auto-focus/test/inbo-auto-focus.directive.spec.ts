import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fnmock, instance, verify } from '@johanblumenberg/ts-mockito';
import { InboAutofocusDirective } from '../inbo-autofocus.directive';

describe('InboAutofocusDirective', () => {
  let focusMethodMock: (...args: Array<unknown>) => void;

  let directiveUnderTest: InboAutofocusDirective;

  beforeEach(() => {
    focusMethodMock = fnmock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRef,
          useValue: { nativeElement: { focus: instance(focusMethodMock) } },
        },
      ],
    });

    directiveUnderTest = TestBed.runInInjectionContext(
      () => new InboAutofocusDirective()
    );
  });

  describe('ngOnInit', () => {
    it('should call the focus method', () => {
      directiveUnderTest.ngOnInit();

      verify(focusMethodMock()).once();
    });
  });
});
