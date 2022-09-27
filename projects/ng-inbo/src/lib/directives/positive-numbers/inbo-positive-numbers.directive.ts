import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';
import {isNil, isEmpty} from 'lodash-es';

@Directive({
  selector: '[inboPositiveNumbers]',
})
export class InboPositiveNumbersDirective {

  @Output() ngModelChange = new EventEmitter<string>();

  constructor(private elementRef: ElementRef<HTMLInputElement>) {
  }

  @HostListener('input')
  handleInputEvent(): void {
    const currentValue = this.elementRef.nativeElement.value;
    if (isEmpty(currentValue) || isNil(currentValue)) {
      this.ngModelChange.emit(undefined);
      return;
    }
    if (!/^\d+$/.test(currentValue)) {
      this.elementRef.nativeElement.value = currentValue.slice(0, -1);
    }
    this.ngModelChange.emit(this.elementRef.nativeElement.value.length === 0 ? undefined : this.elementRef.nativeElement.value);
  }
}
