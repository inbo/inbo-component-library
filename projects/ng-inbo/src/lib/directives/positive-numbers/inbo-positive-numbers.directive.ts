import {
  Directive,
  ElementRef,
  HostListener,
  output,
  inject,
} from '@angular/core';

@Directive({
  selector: '[inboPositiveNumbers]',
  standalone: true,
})
export class InboPositiveNumbersDirective {
  private elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  readonly ngModelChange = output<string | undefined>();

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
