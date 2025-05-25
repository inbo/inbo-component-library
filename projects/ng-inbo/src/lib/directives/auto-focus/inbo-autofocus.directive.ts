import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[inboAutofocus]',
  standalone: true,
})
export class InboAutofocusDirective implements OnInit {
  private inputElement: HTMLElement;

  constructor(private elementRef: ElementRef) {
    this.inputElement = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.inputElement.focus();
  }
}
