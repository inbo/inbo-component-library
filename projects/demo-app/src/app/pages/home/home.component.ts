import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgInboModule } from 'projects/ng-inbo/src/public-api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NgInboModule,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  menuItems = [
    { label: 'Header', path: 'header' },
    { label: 'Autocomplete', path: 'autocomplete' }
  ];
}
