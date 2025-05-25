import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'inbo-loading-spinner',
  templateUrl: 'inbo-loading-spinner.component.html',
  styleUrls: ['inbo-loading-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatProgressSpinner],
})
export class InboLoadingSpinnerComponent {}
