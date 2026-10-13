import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'inbo-vlaanderen-logo',
  templateUrl: 'vlaanderen-logo.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class VlaanderenLogoComponent {
  height = input<string>('30px');
}
