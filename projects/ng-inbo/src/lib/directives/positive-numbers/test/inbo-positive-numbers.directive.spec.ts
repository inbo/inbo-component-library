import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InboPositiveNumbersDirective } from '../inbo-positive-numbers.directive';

@Component({
  standalone: true,
  imports: [InboPositiveNumbersDirective],
  template: `<input
    type="text"
    inboPositiveNumbers
    (ngModelChange)="changedValue = $event"
  />`,
})
class TestHostComponent {
  changedValue: string | undefined;
}

describe('InboPositiveNumbersDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputEl: DebugElement;
  let component: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
    fixture.detectChanges();
  });

  it('should filter out all non-positive number characters', () => {
    const inputElement = inputEl.nativeElement as HTMLInputElement;
    inputElement.value = '123f';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toEqual('123');
    expect(component.changedValue).toEqual('123');
  });

  it('should do nothing if the value is only positive number characters', () => {
    const inputElement = inputEl.nativeElement as HTMLInputElement;
    inputElement.value = '123';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toEqual('123');
    expect(component.changedValue).toEqual('123');
  });

  it('should emit undefined if the value is an empty string after filtering', () => {
    const inputElement = inputEl.nativeElement as HTMLInputElement;
    inputElement.value = 'abc';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toEqual('');
    expect(component.changedValue).toBeUndefined();
  });

  it('should emit undefined if the value is initially an empty string', () => {
    const inputElement = inputEl.nativeElement as HTMLInputElement;
    inputElement.value = '';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toEqual('');
    expect(component.changedValue).toBeUndefined();
  });
});
