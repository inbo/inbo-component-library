import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InboMenuItem } from './menu-item.model';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {RouterLink} from "@angular/router";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatButton} from "@angular/material/button";
import {NgStringPipesModule} from "ngx-pipes";

@Component({
  selector: 'inbo-menu-bar',
  templateUrl: 'inbo-menu-bar.component.html',
  styleUrls: ['inbo-menu-bar.component.scss'],
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    RouterLink,
    MatMenuTrigger,
    MatButton,
    MatMenu,
    MatMenuItem,
    NgStringPipesModule
  ]
})
export class InboMenuBarComponent {
  @Input() menuItems: Array<InboMenuItem>;
  @Input() loggedInUserName: string;

  @Output() loginButtonClick = new EventEmitter<void>();
  @Output() logoutButtonClick = new EventEmitter<void>();
}
