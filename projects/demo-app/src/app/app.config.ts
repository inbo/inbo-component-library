import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgInboModule } from 'projects/ng-inbo/src/public-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(NgInboModule.forRoot({ apiUrl: 'http://localhost:4200/api' }))
  ]
}; 