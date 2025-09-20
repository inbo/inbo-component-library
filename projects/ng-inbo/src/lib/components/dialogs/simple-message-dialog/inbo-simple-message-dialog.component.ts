import { Component, inject, output } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { SimpleMessageDialogData } from './simple-message-dialog-data.model';

@Component({
  selector: 'inbo-simple-message-dialog',
  templateUrl: 'simple-message-dialog.component.html',
  styleUrls: ['simple-message-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogContent,
    MatIcon,
    MatDialogTitle,
    MatDialogClose,
    MatIconButton,
    MatDialogActions,
    MatButton,
  ],
})
export class InboSimpleMessageDialogComponent {
  readonly continueButtonClicked = output<void>();
  readonly cancelButtonClicked = output<void>();

  data = inject<SimpleMessageDialogData>(MAT_DIALOG_DATA);
}
