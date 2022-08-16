import {NgModule} from '@angular/core';
import {InboHeaderComponent} from './components/inbo-header/inbo-header.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {VlaanderenLogoComponent} from './components/vlaanderen-logo/vlaanderen-logo.component';
import {CommonModule} from '@angular/common';


@NgModule({
  declarations: [
    InboHeaderComponent,
    VlaanderenLogoComponent,
  ],
  imports: [
    MatToolbarModule,
    CommonModule,
  ],
  exports: [
    InboHeaderComponent,
  ],
})
export class NgInboModule {
}
