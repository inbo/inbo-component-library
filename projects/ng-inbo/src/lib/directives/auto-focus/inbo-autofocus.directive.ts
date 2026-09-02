import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[inboAutofocus]',
  standalone: true,
})
export class InboAutofocusDirective implements OnInit {
  private elementRef = inject(ElementRef);

  private inputElement: HTMLElement;

  constructor() {
    this.inputElement = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.inputElement.focus();
  }
}
