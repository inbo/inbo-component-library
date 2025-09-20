import { Directive, ElementRef, HostListener, output } from '@angular/core';

@Directive({
  selector: '[inboPositiveNumbers]',
  standalone: true,
})
export class InboPositiveNumbersDirective {
  readonly ngModelChange = output<string | undefined>();

  constructor(private elementRef: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  handleInputEvent(): void {
    const inputElement = this.elementRef.nativeElement;
    const originalValue = inputElement.value;
    const newValue = originalValue.replace(/\D/g, '');

    if (originalValue !== newValue) {
      inputElement.value = newValue;
    }

    this.ngModelChange.emit(newValue.length === 0 ? undefined : newValue);
  }
}
