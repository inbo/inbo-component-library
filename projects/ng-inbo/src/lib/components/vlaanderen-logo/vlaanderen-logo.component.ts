import { Component, input } from '@angular/core';

@Component({
  selector: 'inbo-vlaanderen-logo',
  templateUrl: 'vlaanderen-logo.component.html',
  standalone: true,
})
export class VlaanderenLogoComponent {
  height = input<string>('30px');
}
