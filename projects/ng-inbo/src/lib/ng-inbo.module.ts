import {ModuleWithProviders, NgModule} from '@angular/core';
import {InboHeaderComponent} from './components/header/inbo-header.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {VlaanderenLogoComponent} from './components/vlaanderen-logo/vlaanderen-logo.component';
import {CommonModule} from '@angular/common';
import {InboDataTableComponent} from './components/data-table/inbo-data-table.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {HttpClientModule} from '@angular/common/http';
import {API_URL} from './injection-tokens.constants';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {InboKeyValueComponent} from './components/key-value/inbo-key-value.component';
import {InboLoadingSpinnerComponent} from './components/loading-spinner/inbo-loading-spinner.component';
import {InboPositiveNumbersDirective} from './directives/positive-numbers/inbo-positive-numbers.directive';
import {InboMenuBarComponent} from './components/menu-bar/inbo-menu-bar.component';
import {MatMenuModule} from '@angular/material/menu';
import {RouterLink} from '@angular/router';
import {NgPipesModule} from 'ngx-pipes';
import {InboButtonGroupComponent} from './components/button-group/inbo-button-group.component';
import {InboClickOutsideDirective} from './directives/click-outside/inbo-click-outside.directive';
import {InboFormChangeDirective} from './directives/form-change/inbo-form-change.directive';

const componentsToExport = [
  //Components
  InboHeaderComponent,
  InboDataTableComponent,
  InboKeyValueComponent,
  InboLoadingSpinnerComponent,
  InboMenuBarComponent,
  InboButtonGroupComponent,
  //Directives
  InboPositiveNumbersDirective,
  InboClickOutsideDirective,
  InboFormChangeDirective,
  // Pipes
];

@NgModule({
  declarations: [
    VlaanderenLogoComponent,
    ...componentsToExport,
  ],
  imports: [
    MatToolbarModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterLink,
    NgPipesModule,
  ],
  exports: [
    ...componentsToExport,
  ],
})
export class NgInboModule {

  static forRoot(configuration: { apiUrl: string }): ModuleWithProviders<NgInboModule> {
    return {
      ngModule: NgInboModule,
      providers: [
        {provide: API_URL, useValue: configuration.apiUrl},
      ],
    };
  }
}
