import {HttpContext, HttpHeaders, HttpParams} from '@angular/common/http';

export interface HttpRequestOptions {
  headers?: HttpHeaders | {
    [header: string]: string | Array<string>;
  };
  observe?: string;
  context?: HttpContext;
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}
