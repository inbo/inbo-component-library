import { DOCUMENT } from '@angular/common';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InboClickOutsideDirective } from '../inbo-click-outside.directive';

@Component({
  standalone: true,
  imports: [InboClickOutsideDirective],
  template: `<div inboClickOutside (onClickOutside)="onClickOutside()"></div>`,
})
class TestHostComponent {
  onClickOutside = jasmine.createSpy('onClickOutside');
}

describe('InboClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directiveElement: DebugElement;
  let testHostComponent: TestHostComponent;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(
      By.directive(InboClickOutsideDirective)
    );
    doc = TestBed.inject(DOCUMENT);

    spyOn(
      directiveElement.nativeElement,
      'getBoundingClientRect'
    ).and.returnValue({
      x: 5,
      y: 10,
      width: 10,
      height: 5,
    } as DOMRect);

    fixture.detectChanges();

    doc.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 })
    );
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should not emit an event if the click is within the bounds of the host element', () => {
      doc.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 })
      );
      fixture.detectChanges();
      expect(testHostComponent.onClickOutside).not.toHaveBeenCalled();
    });

    it('should emit an event if the click is outside the bounds of the host element', () => {
      doc.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 })
      );
      fixture.detectChanges();
      expect(testHostComponent.onClickOutside).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from mouse events', () => {
      doc.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 20, clientY: 20 })
      );
      fixture.detectChanges();
      expect(testHostComponent.onClickOutside).toHaveBeenCalledTimes(1);

      fixture.destroy();
      fixture.detectChanges();

      doc.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: 30, clientY: 30 })
      );
      fixture.detectChanges();
      expect(testHostComponent.onClickOutside).toHaveBeenCalledTimes(1);
    });
  });
});
