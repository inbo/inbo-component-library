import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InboHeaderComponent } from 'projects/ng-inbo/src/public-api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [InboHeaderComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {}
