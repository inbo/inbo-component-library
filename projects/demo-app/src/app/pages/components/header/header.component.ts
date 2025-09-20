import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InboHeaderComponent } from 'projects/ng-inbo/src/public-api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, InboHeaderComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {}
