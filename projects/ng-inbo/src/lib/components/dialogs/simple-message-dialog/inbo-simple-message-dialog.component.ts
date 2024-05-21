import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {SimpleMessageDialogData} from './simple-message-dialog-data.model';

@Component({
  selector: 'inbo-simple-message-dialog',
  templateUrl: 'simple-message-dialog.component.html',
  styleUrls: ['simple-message-dialog.component.scss'],
})
export class InboSimpleMessageDialogComponent {

  @Output() continueButtonClicked = new EventEmitter<void>();
  @Output() cancelButtonClicked = new EventEmitter<void>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: SimpleMessageDialogData) {
  }

}
