import {AbstractHttpService} from '../abstract.http-service';
import {deepEqual, instance, mock, when} from '@johanblumenberg/ts-mockito';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {HttpRequestOptions} from '../http-request-options.model';

describe('AbstractHttpService', () => {

  let httpClientMock: HttpClient;

  let serviceUnderTest: AbstractHttpServiceTestImpl;

  beforeEach(() => {
    httpClientMock = mock(HttpClient);

    serviceUnderTest = new AbstractHttpServiceTestImpl(
      'http://localhost:8080/api',
      instance(httpClientMock),
    );
  });

  describe('getApiUrl', () => {
    it('should return the right combination of the baseUrl and the base path', () => {
      const actual = serviceUnderTest.getApiURLForTestPurposes();

      expect(actual).toEqual('http://localhost:8080/api/bronnen');
    });
  });

  describe('getSingleResponse', () => {

    const url = 'someUrl';

    it('should return an observable which completes after one value is emitted', done => {
      when(httpClientMock.get(url)).thenReturn(of({}));

      serviceUnderTest
        .doGetSingleResponseForTestPurposes(url)
        .subscribe({
          complete: done,
        });
    });

    it('should set the correct options when options are given and return an observable which completes after one value is emitted', done => {
      const options: HttpRequestOptions = {
        params: new HttpParams().set('paramA', 'valueA').set('paramB', 'valueB'),
        headers: new HttpHeaders().set('Authorization', 'Bearer xxxx'),
      };

      when(httpClientMock.get(url, deepEqual({...options, observe: 'body'}))).thenReturn(of({}));

      serviceUnderTest
        .doGetSingleResponseForTestPurposes(url, options)
        .subscribe({
          complete: done,
        });
    });

    it('should not override the observe property on the options if it is given', done => {
      const options: HttpRequestOptions = {
        params: new HttpParams().set('paramA', 'valueA').set('paramB', 'valueB'),
        headers: new HttpHeaders().set('Authorization', 'Bearer xxxx'),
        observe: 'response',
      };

      when(httpClientMock.get(url, deepEqual({
        ...options,
        observe: 'response',
      }))).thenReturn(of(new HttpResponse<any>()));

      serviceUnderTest
        .doGetSingleResponseForTestPurposes(url, options)
        .subscribe({
          complete: done,
        });
    });
  });

});

class AbstractHttpServiceTestImpl extends AbstractHttpService {
  protected basePath = 'bronnen';

  getApiURLForTestPurposes(): string {
    return super.getApiURL();
  }

  doGetSingleResponseForTestPurposes(url: string, options?: HttpRequestOptions): Observable<any> {
    return this.getSingleResponse(url, options);
  }
}
