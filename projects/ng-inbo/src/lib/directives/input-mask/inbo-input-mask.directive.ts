import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {NgControl} from '@angular/forms';
import {isNil} from 'lodash-es';

@Directive({
  selector: '[inboInputMask]',
  standalone: false
})
export class InboInputMaskDirective implements OnInit {
  @Input() inboInputMask: string;

  private previousValue: string = '';

  constructor(
    private elementRef: ElementRef<HTMLInputElement>,
    private ngControl: NgControl
  ) {}

  ngOnInit(): void {
    if (this.ngControl.value) {
      this.onInput();
    }
  }

  @HostListener('input')
  onInput(): void {
    if (!this.inboInputMask) {
      return;
    }

    const input = this.elementRef.nativeElement;
    const originalValue = input.value;
    const cursorPos = input.selectionStart;

    if (originalValue === this.previousValue) {
      return;
    }

    const cleanValue = originalValue.replace(/[^a-zA-Z0-9]/g, '');

    let result = '';
    let cleanIndex = 0;

    for (let i = 0; i < this.inboInputMask.length && cleanIndex < cleanValue.length; i++) {
      const maskChar = this.inboInputMask[i];

      if (maskChar === '-' || maskChar === ' ' || maskChar === '/') {
        // If it's a separator in the mask, add it to the result
        result += maskChar;
      } else {
        result += cleanValue[cleanIndex];
        cleanIndex++;
      }
    }

    if (result !== originalValue) {
      input.value = result;
      this.previousValue = result;

      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(result, { emitEvent: false });
      }

      const newCursorPos = this.calculateCursorPosition(originalValue, result, cursorPos);
      input.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      this.previousValue = originalValue;
    }
  }

  private calculateCursorPosition(oldValue: string, newValue: string, oldCursorPos: number): number {
    if (oldCursorPos === oldValue.length) {
      return newValue.length;
    }

    let newPos = oldCursorPos;
    for (let i = 0; i < Math.min(newValue.length, oldCursorPos); i++) {
      if (['-', ' ', '/'].includes(newValue[i]) &&
          (i >= oldValue.length || oldValue[i] !== newValue[i])) {
        newPos++;
      }
    }

    return Math.min(newPos, newValue.length);
  }
}
