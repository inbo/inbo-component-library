import {ChangeDetectionStrategy, Component, ElementRef, Inject, Input} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Component({
    selector: 'inbo-header',
    templateUrl: 'inbo-header.component.html',
    styleUrls: ['inbo-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InboHeaderComponent {

  @Input() titles: Array<string> = [];
  @Input() contactEmail = 'info@inbo.be';
  @Input() contactPhoneNumber = '+32 (0)2 430 26 37';
  @Input() facebookLink = 'https://www.facebook.com/INBOVlaanderen/';
  @Input() blueskyLink = 'https://bsky.app/profile/inbo.be';
  @Input() instagramLink = 'https://instagram.com/inbovlaanderen';
  @Input() vimeoLink = 'https://vimeo.com/inbo';
  @Input() linkedinLink = 'https://www.linkedin.com/company/inbo-research-institute-for-nature-and-forest';
  @Input() contactFormLink = 'https://www.vlaanderen.be/inbo/contacteer-inbo/';

  contactMenuOpen = false;

  toggleContactMenu(): void {
    this.contactMenuOpen = !this.contactMenuOpen;
  }
}
