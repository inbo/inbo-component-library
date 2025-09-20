import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_URL } from './injection-tokens.constants';

export interface NgInboCoreConfig {
  apiUrl: string;
}

export function provideNgInboCore(
  config: NgInboCoreConfig
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_URL, useValue: config.apiUrl },
    provideHttpClient(withInterceptorsFromDi()),
  ]);
}
