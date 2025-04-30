import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { NgInboModule } from 'projects/ng-inbo/src/public-api';
import {MatListItem, MatNavList} from "@angular/material/list";

@Component({
  selector: 'app-home',
  standalone: true,
    imports: [
        CommonModule,
        NgInboModule,
        RouterOutlet,
        RouterLink,
        MatNavList,
        MatListItem,
        RouterLinkActive
    ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  menuItems = [
    { label: 'Header', path: 'header' },
    { label: 'Autocomplete', path: 'autocomplete' },
    { label: 'Data Table', path: 'data-table' }
  ];
}
