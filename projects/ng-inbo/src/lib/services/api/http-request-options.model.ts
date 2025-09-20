import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export interface HttpRequestOptions {
  headers?: HttpHeaders | Record<string, string | Array<string>>;
  observe?: string;
  context?: HttpContext;
  params?:
    | HttpParams
    | Record<
        string,
        string | number | boolean | ReadonlyArray<string | number | boolean>
      >;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}
