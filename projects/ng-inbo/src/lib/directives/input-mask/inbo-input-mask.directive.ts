import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[inboInputMask]',
  standalone: true,
})
export class InboInputMaskDirective implements OnInit {
  @Input() inboInputMask: string;

  private previousValue = '';

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

    for (let i = 0; i < this.inboInputMask.length; i++) {
      const maskChar = this.inboInputMask[i];

      if (maskChar === '-' || maskChar === ' ' || maskChar === '/') {
        if (cleanIndex < cleanValue.length) {
          result += maskChar;
        } else if (
          cleanIndex > 0 &&
          cleanIndex === cleanValue.length &&
          /[a-zA-Z0-9]/.test(this.inboInputMask[i - 1]) &&
          !(maskChar === ' ' && i === this.inboInputMask.length - 1)
        ) {
          result += maskChar;
        } else if (
          originalValue.length > result.length &&
          originalValue[result.length] === maskChar
        ) {
          result += maskChar;
        } else if (cleanIndex === cleanValue.length) {
          break;
        }
      } else {
        if (cleanIndex < cleanValue.length) {
          result += cleanValue[cleanIndex];
          cleanIndex++;
        } else {
          break;
        }
      }
    }

    if (result !== originalValue) {
      input.value = result;
      this.previousValue = result;

      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(result, { emitEvent: false });
      }

      const newCursorPos = this.calculateCursorPosition(
        originalValue,
        result,
        cursorPos
      );
      input.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      this.previousValue = originalValue;
    }
  }

  private calculateCursorPosition(
    oldValue: string,
    newValue: string,
    oldCursorPos: number
  ): number {
    if (oldCursorPos === oldValue.length) {
      return newValue.length;
    }

    let newPos = oldCursorPos;
    for (let i = 0; i < Math.min(newValue.length, oldCursorPos); i++) {
      if (
        ['-', ' ', '/'].includes(newValue[i]) &&
        (i >= oldValue.length || oldValue[i] !== newValue[i])
      ) {
        newPos++;
      }
    }

    return Math.min(newPos, newValue.length);
  }
}
