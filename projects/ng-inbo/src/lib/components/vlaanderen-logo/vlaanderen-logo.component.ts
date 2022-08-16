import {Component, Input} from '@angular/core';

@Component({
  selector: 'inbo-vlaanderen-logo',
  templateUrl: 'vlaanderen-logo.component.html',
})
export class VlaanderenLogoComponent {

  @Input() height: string = '30px';

}
