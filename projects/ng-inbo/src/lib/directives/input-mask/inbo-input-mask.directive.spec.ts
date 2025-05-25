import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InboInputMaskDirective } from './inbo-input-mask.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InboInputMaskDirective],
  template: `<input
    type="text"
    [inboInputMask]="mask"
    [formControl]="control"
  />`,
})
class TestHostComponent {
  mask: string = '';
  control = new FormControl('');
}

describe('InboInputMaskDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputEl: DebugElement;
  let component: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  it('should create an instance', () => {
    const directive = new InboInputMaskDirective(inputEl, null!);
    expect(directive).toBeTruthy();
  });

  it('should apply mask on input', () => {
    component.mask = '00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '1234';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('12-34');
  });

  it('should handle empty mask', () => {
    component.mask = '';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '1234';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('1234');
  });

  it('should strip non-alphanumeric characters before applying mask', () => {
    component.mask = 'AAA-000';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = 'abc!@#123';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('abc-123');
  });

  it('should handle different separators: space', () => {
    component.mask = '000 000';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '123456';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('123 456');
  });

  it('should handle different separators: slash', () => {
    component.mask = '00/00/00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '123456';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('12/34/56');
  });

  it('should not change value if it already matches the mask structure', () => {
    component.mask = '00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '12-34';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('12-34');
  });

  it('should handle input shorter than mask', () => {
    component.mask = '00-00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '123';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('12-3');
  });

  it('should handle input longer than mask allows after cleaning', () => {
    component.mask = '00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '12345';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('12-34');
  });

  it('should format initial value from form control on ngOnInit', () => {
    component.control.setValue('1234');
    component.mask = '00-00';
    fixture.detectChanges();

    const inputElement = inputEl.nativeElement as HTMLInputElement;
    expect(inputElement.value).toBe('12-34');
  });

  it('should correctly set cursor position after formatting', () => {
    component.mask = '00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '12';
    inputElement.selectionStart = 2;
    inputElement.selectionEnd = 2;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-');
    expect(inputElement.selectionStart).toBe(3);

    inputElement.value = '123';
    inputElement.selectionStart = 4;
    inputElement.selectionEnd = 4;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-3');

    inputElement.value = '12-34';
    inputElement.selectionStart = 5;
    inputElement.selectionEnd = 5;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-34');
    expect(inputElement.selectionStart).toBe(5);
  });

  it('should update form control value', () => {
    component.mask = '00/00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '1234';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.control.value).toBe('12/34');
  });

  it('should not emit event when NgControl updates value programmatically', () => {
    component.mask = '00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    const spy = spyOn(component.control, 'setValue').and.callThrough();

    inputElement.value = '1234';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(spy.calls.mostRecent().args[1]).toEqual({ emitEvent: false });
  });

  it('should handle alphanumeric mask characters correctly', () => {
    component.mask = 'AA-00-aa';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = 'xy12zw';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('xy-12-zw');
  });

  it('should not re-evaluate if value has not changed from previous input event', () => {
    component.mask = '00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;
    const directiveInstance = inputEl.injector.get(InboInputMaskDirective);

    inputElement.value = '1234';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-34');

    const previousValue = inputElement.value;
    const previousSelectionStart = inputElement.selectionStart;

    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe(previousValue);
    expect(inputElement.selectionStart).toBe(previousSelectionStart);
  });

  it('should maintain cursor position at the end if typing at the end', () => {
    component.mask = '00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '1';
    inputElement.selectionStart = 1;
    inputElement.selectionEnd = 1;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('1');
    expect(inputElement.selectionStart).toBe(1);

    inputElement.value = '12';
    inputElement.selectionStart = 2;
    inputElement.selectionEnd = 2;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-');
    expect(inputElement.selectionStart).toBe(3);

    inputElement.value = '12-3';
    inputElement.selectionStart = 4;
    inputElement.selectionEnd = 4;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-3');
    expect(inputElement.selectionStart).toBe(4);

    inputElement.value = '12-34';
    inputElement.selectionStart = 5;
    inputElement.selectionEnd = 5;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-34');
    expect(inputElement.selectionStart).toBe(5);
  });

  it('should adjust cursor when a separator is auto-inserted before cursor', () => {
    component.mask = '00-00-00';
    fixture.detectChanges();
    const inputElement = inputEl.nativeElement as HTMLInputElement;

    inputElement.value = '12';
    inputElement.selectionStart = 2;
    inputElement.selectionEnd = 2;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-');
    expect(inputElement.selectionStart).toBe(3);

    inputElement.value = '12-3';
    inputElement.selectionStart = 4;
    inputElement.selectionEnd = 4;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-3');
    expect(inputElement.selectionStart).toBe(4);

    inputElement.value = '12-34';
    inputElement.selectionStart = 5;
    inputElement.selectionEnd = 5;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputElement.value).toBe('12-34-');
    expect(inputElement.selectionStart).toBe(6);
  });
});
