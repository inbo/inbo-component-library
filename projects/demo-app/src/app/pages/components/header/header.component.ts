import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgInboModule } from 'projects/ng-inbo/src/public-api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    NgInboModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {}
