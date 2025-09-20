import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatNavList,
    MatListItem,
    RouterLinkActive,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  menuItems = [
    { label: 'Header', path: 'header' },
    { label: 'Autocomplete', path: 'autocomplete' },
    { label: 'Data Table', path: 'data-table' },
  ];
}
