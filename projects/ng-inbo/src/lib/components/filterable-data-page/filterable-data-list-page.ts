import {ActivatedRoute, Router} from '@angular/router';
import {isEmpty, isNil, omitBy} from 'lodash-es';
import {Observable, tap} from 'rxjs';
import {Directive, OnInit} from '@angular/core';
import {ApiPage} from '../../services/api/api-page.model';
import {RequestState} from '../../services/api/request-state.enum';

// This annotation is needed for abstract base classes that use angular functionality (https://angular.io/guide/migration-undecorated-classes)
@Directive()
export abstract class FilterableDataListPage<D, F> implements OnInit {

  filter: F;
  currentDataPage: ApiPage<D>;
  dataRequestState = RequestState.DEFAULT;

  protected abstract getDataFromBackend(pageIndex: number, filter?: F): Observable<ApiPage<D>>;

  abstract createEmptyFilterObject(): F;

  protected constructor(protected activatedRoute: ActivatedRoute,
                        protected router: Router) {
  }

  ngOnInit(): void {
    this.getFilterFromQueryParams();
    this.clearFilter();
  }

  getData(pageIndex: number): void {
    if (!this.currentDataPage) {
      this.dataRequestState = RequestState.PENDING;
    } else {
      this.dataRequestState = RequestState.PARTIAL_PENDING;
    }

    this.getDataFromBackend(pageIndex, this.filter)
      .pipe(
        tap(dataPage => this.currentDataPage = dataPage),
        tap(dataPage => this.dataRequestState = dataPage.content.length > 0 ? RequestState.SUCCESS : RequestState.EMPTY),
        tap(() => window.scrollTo({top: 0})),
        tap(() => this.addFiltersToUrl()),
      )
      .subscribe({
        error: () => this.dataRequestState = RequestState.ERROR,
      });
  }

  clearFilter(): void {
    this.filter = this.createEmptyFilterObject();
    this.getData(0);
  }

  protected addFiltersToUrl(): void {
    this.router.navigate([], {
      queryParams: omitBy(this.filter, val => isNil(val) || isEmpty(val)),
      replaceUrl: true,
    });
  }

  protected getFilterFromQueryParams(): void {
    if (isNil(this.filter)) {
      return null;
    }
    Object.keys(this.filter)
      .forEach(key => {
          const activatedRouteSnapshot = this.activatedRoute.snapshot;
          if (activatedRouteSnapshot.queryParamMap.has(key)) {
            this.filter = {...this.filter, [key]: activatedRouteSnapshot.queryParamMap.get(key)};
          }
        },
      );
  }
}
