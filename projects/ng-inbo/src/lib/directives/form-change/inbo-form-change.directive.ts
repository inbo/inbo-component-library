import {
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { isNil } from 'lodash-es';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[inboFormChange]',
  standalone: true,
})
export class InboFormChangeDirective<T> implements OnInit, OnDestroy {
  private destroy = new Subject<void>();

  @Input() inboFormChangeDebounceTime = 300;
  @Output() inboFormChange = new EventEmitter<T>();

  constructor(private ngForm: NgForm) {
    if (isNil(ngForm)) {
      throw new Error('This directive can only be used on a form');
    }
  }

  ngOnInit(): void {
    this.ngForm.valueChanges
      .pipe(
        takeUntil(this.destroy),
        debounceTime(this.inboFormChangeDebounceTime)
      )
      .subscribe((value) => this.inboFormChange.emit(value));
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
