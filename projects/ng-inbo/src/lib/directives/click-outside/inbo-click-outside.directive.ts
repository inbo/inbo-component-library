import {Directive, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output} from '@angular/core';
import {inRange} from 'lodash-es';
import {fromEvent, skip, Subject, takeUntil, tap} from 'rxjs';
import {DOCUMENT} from '@angular/common';

@Directive({selector: '[inboClickOutside]'})
export class InboClickOutsideDirective implements OnInit, OnDestroy {

  private unsubscribe = new Subject<void>();

  @Output() onClickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef<HTMLElement>,
              @Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit(): void {
    fromEvent<MouseEvent>(this.document, 'click')
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe),
        tap((event: MouseEvent) => {
          const clickX = event.x;
          const clickY = event.y;
          const elementRect = this.elementRef.nativeElement.getBoundingClientRect();
          if (!(inRange(clickX, elementRect.x, elementRect.x + elementRect.width) && inRange(clickY, elementRect.y, elementRect.y + elementRect.height))) {
            this.onClickOutside.emit();
          }
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
