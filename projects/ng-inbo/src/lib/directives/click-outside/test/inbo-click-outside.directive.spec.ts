import {InboClickOutsideDirective} from '../inbo-click-outside.directive';
import {instance, mock, spy, verify, when} from '@johanblumenberg/ts-mockito';
import {ElementRef, EventEmitter} from '@angular/core';
import {HasEventTargetAddRemove} from 'rxjs/internal/observable/fromEvent';
import * as rxjs from 'rxjs';
import {Subject} from 'rxjs';

describe('InboClickOutsideDirective', () => {

  let directiveUnderTest: InboClickOutsideDirective;

  let elementRef: ElementRef<HTMLElement>;
  let nativeElementMock: HTMLElement;
  let documentMock: Document;
  let mouseEventSubject: Subject<MouseEvent>;
  let clickOutsideEventEmitter: EventEmitter<void>;

  beforeEach(() => {
    mouseEventSubject = new Subject<MouseEvent>();

    elementRef = mock(ElementRef<HTMLElement>);
    nativeElementMock = mock(HTMLElement);
    documentMock = mock(DocumentMock) as Document;

    directiveUnderTest = new InboClickOutsideDirective(
      instance(elementRef),
      instance(documentMock),
    );

    clickOutsideEventEmitter = spy(directiveUnderTest.onClickOutside);
    when(elementRef.nativeElement).thenReturn(instance(nativeElementMock));
    when(nativeElementMock.getBoundingClientRect()).thenReturn({x: 5, y: 10, width: 10, height: 5} as DOMRect);
    spyOnProperty(rxjs, 'fromEvent', 'get').and.returnValue(() => mouseEventSubject.asObservable());
  });

  describe('ngOnInit', () => {

    it('should listen for clicks on document and skip the first event', () => {
      directiveUnderTest.ngOnInit();

      mouseEventSubject.next({x: 10, y: 10} as MouseEvent);

      verify(nativeElementMock.getBoundingClientRect()).never();
    });

    it('should listen for clicks on document and not emit an event if the click is within the bounds of the element on which the directive has been placed', () => {
      directiveUnderTest.ngOnInit();

      mouseEventSubject.next({x: 0, y: 0} as MouseEvent); // First event that will be discarded
      mouseEventSubject.next({x: 10, y: 10} as MouseEvent);

      verify(clickOutsideEventEmitter.emit()).never();
    });

    it('should listen for clicks on document and emit an event if the click is outside the bounds of the element on which the directive has been placed', () => {
      directiveUnderTest.ngOnInit();

      mouseEventSubject.next({x: 0, y: 0} as MouseEvent); // First event that will be discarded
      mouseEventSubject.next({x: 20, y: 20} as MouseEvent);

      verify(clickOutsideEventEmitter.emit()).once();
    });
  });

  describe('OnDestroy', () => {
    it('should unsubscribe from the mouseEvents', () => {
      directiveUnderTest.ngOnInit();

      mouseEventSubject.next({x: 0, y: 0} as MouseEvent); // First event that will be discarded
      mouseEventSubject.next({x: 20, y: 20} as MouseEvent);

      verify(clickOutsideEventEmitter.emit()).once();

      directiveUnderTest.ngOnDestroy();

      mouseEventSubject.next({x: 20, y: 20} as MouseEvent);

      verify(clickOutsideEventEmitter.emit()).once();
    });
  });
});

class DocumentMock implements HasEventTargetAddRemove<any> {

  addEventListener(type: string, listener: ((evt: any) => void) | EventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
  }

  removeEventListener(type: string, listener: ((evt: any) => void) | EventListenerObject | null, options?: EventListenerOptions | boolean): void {
  }

}
