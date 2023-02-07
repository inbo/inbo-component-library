import {Directive, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {NgModel} from '@angular/forms';
import {debounceTime, Subject, takeUntil} from 'rxjs';
import {isNil} from 'lodash-es';

@Directive({selector: '[inboDebouncedInputChange]'})
export class InboDebouncedInputChange<T> implements OnInit, OnDestroy {

  private destroy = new Subject<void>();

  @Input() inboFormChangeDebounceTime = 300;
  @Output() inboDebouncedInputChange = new EventEmitter<T>();

  constructor(private ngModel: NgModel) {
    if (isNil(ngModel)) {
      throw new Error('This directive can only be used on an input element');
    }
  }

  ngOnInit(): void {
    this.ngModel
      .valueChanges
      .pipe(
        takeUntil(this.destroy),
        debounceTime(this.inboFormChangeDebounceTime),
      ).subscribe(
      value => this.inboDebouncedInputChange.emit(value),
    );
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
