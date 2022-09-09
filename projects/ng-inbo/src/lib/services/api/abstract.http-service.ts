import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, take} from 'rxjs';
import {HttpRequestOptions} from './http-request-options.model';
import {API_URL} from '../../injection-tokens.constants';

@Injectable({
  providedIn: 'root',
})
export abstract class AbstractHttpService {

  protected constructor(@Inject(API_URL) private apiUrl: string,
                        protected http: HttpClient) {
  }

  protected abstract basePath: string;

  getApiURL(): string {
    return `${this.apiUrl}/${this.basePath}`;
  }

  getSingleResponse<T>(url: string, options?: HttpRequestOptions): Observable<T> {
    if (options) {
      options = options.observe === undefined ? {...options, observe: 'body'} : options;
      return this.http.get<T>(url, options as any).pipe(take(1)) as unknown as Observable<T>;
    }
    return this.http.get<T>(url).pipe(take(1));
  }
}
