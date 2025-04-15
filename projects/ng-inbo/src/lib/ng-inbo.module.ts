import {ModuleWithProviders, NgModule} from '@angular/core';
import {InboHeaderComponent} from './components/header/inbo-header.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {VlaanderenLogoComponent} from './components/vlaanderen-logo/vlaanderen-logo.component';
import {CommonModule} from '@angular/common';
import {InboDataTableComponent} from './components/data-table/inbo-data-table.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import {InboAutocompleteComponent} from './components/autocomplete/inbo-autocomplete.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {InboDebouncedInputChange} from './directives/debounced-input-change/inbo-debounced-input-change.directive';
import {InboAutofocusDirective} from './directives/auto-focus/inbo-autofocus.directive';
import {MatDialogModule} from '@angular/material/dialog';
import {
  InboSimpleMessageDialogComponent
} from './components/dialogs/simple-message-dialog/inbo-simple-message-dialog.component';
import {InboInputMaskDirective} from './directives/input-mask/inbo-input-mask.directive';

const componentsToExport = [
  //Components
  InboHeaderComponent,
  InboDataTableComponent,
  InboKeyValueComponent,
  InboLoadingSpinnerComponent,
  InboMenuBarComponent,
  InboButtonGroupComponent,
  InboAutocompleteComponent,
  InboSimpleMessageDialogComponent,
  //Directives
  InboPositiveNumbersDirective,
  InboClickOutsideDirective,
  InboFormChangeDirective,
  InboDebouncedInputChange,
  InboAutofocusDirective,
  InboInputMaskDirective,
  // Pipes
];

@NgModule({ declarations: [
        VlaanderenLogoComponent,
        ...componentsToExport,
    ],
    exports: [
        ...componentsToExport,
    ], imports: [MatToolbarModule,
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        RouterLink,
        NgPipesModule,
        MatAutocompleteModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
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
