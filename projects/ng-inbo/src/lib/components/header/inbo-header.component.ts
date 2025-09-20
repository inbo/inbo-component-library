import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { VlaanderenLogoComponent } from '../vlaanderen-logo/vlaanderen-logo.component';

@Component({
  selector: 'inbo-header',
  templateUrl: 'inbo-header.component.html',
  styleUrls: ['inbo-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VlaanderenLogoComponent, MatIconModule],
})
export class InboHeaderComponent {
  readonly titles = input<Array<string>>([]);
  readonly contactEmail = input('info@inbo.be');
  readonly contactPhoneNumber = input('+32 (0)2 430 26 37');
  readonly facebookLink = input('https://www.facebook.com/INBOVlaanderen/');
  readonly blueskyLink = input('https://bsky.app/profile/inbo.be');
  readonly instagramLink = input('https://instagram.com/inbovlaanderen');
  readonly vimeoLink = input('https://vimeo.com/inbo');
  readonly linkedinLink = input(
    'https://www.linkedin.com/company/inbo-research-institute-for-nature-and-forest'
  );
  readonly contactFormLink = input(
    'https://www.vlaanderen.be/inbo/contacteer-inbo/'
  );

  contactMenuOpen = signal(false);

  toggleContactMenu(): void {
    this.contactMenuOpen.update(value => !value);
  }
}
