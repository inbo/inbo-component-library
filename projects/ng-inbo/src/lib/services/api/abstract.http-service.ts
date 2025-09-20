import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { API_URL } from '../../injection-tokens.constants';
import { HttpRequestOptions } from './http-request-options.model';

@Injectable({
  providedIn: 'root',
})
export abstract class AbstractHttpService {
  constructor(
    @Inject(API_URL) private apiUrl: string,
    protected http: HttpClient
  ) {}

  protected abstract basePath: string;

  protected getApiURL(): string {
    return `${this.apiUrl}/${this.basePath}`;
  }

  protected getSingleResponse<T>(
    url: string,
    options?: HttpRequestOptions
  ): Observable<T> {
    if (options) {
      options =
        options.observe === undefined
          ? { ...options, observe: 'body' }
          : options;
      return this.http
        .get<T>(url, options as unknown)
        .pipe(take(1)) as unknown as Observable<T>;
    }
    return this.http.get<T>(url).pipe(take(1));
  }
}
