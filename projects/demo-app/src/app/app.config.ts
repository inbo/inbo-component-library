import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideNgInboCore } from 'projects/ng-inbo/src/lib/ng-inbo.providers';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideNgInboCore({ apiUrl: 'http://localhost:4200/api' }),
  ],
};
