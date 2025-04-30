import {Component, TemplateRef, computed, viewChild, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PageEvent} from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import {BehaviorSubject, Observable, of, delay, filter, take} from 'rxjs';
import {
  ApiPage,
  InboDataTableColumnConfiguration,
  InboDataTableComponent,
  InboDatatableItem,
  RequestState
} from 'projects/ng-inbo/src/public-api';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';

interface SimpleAutocompleteOption {
  value: string;
  display: string;
}

interface DemoItem extends InboDatatableItem {
  id: number;
  name: string;
  description: string;
  date: Date;
  status: 'active' | 'inactive' | 'pending';
}

type DemoPageable = ApiPage<any>['pageable'];

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, InboDataTableComponent, MatButtonModule, MatIconModule, MatSlideToggleModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {

  statusCellTemplateRef = viewChild<TemplateRef<any>>('statusCellTemplate');

  private data: DemoItem[] = [];
  private currentPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 100,
    empty: false,
    first: true,
    last: false,
    sorted: false,
    totalPages: 10
  };

  currentSort: Sort = {active: 'name', direction: 'asc'};
  private currentRequestState = RequestState.PENDING;
  private currentFilters: Record<string, string> = {};

  private dataSubject = new BehaviorSubject<ApiPage<DemoItem> | null>(null);
  dataPage$: Observable<ApiPage<DemoItem> | null> = this.dataSubject.asObservable();

  private requestStateSubject = new BehaviorSubject<RequestState>(this.currentRequestState);
  dataRequestState$: Observable<RequestState> = this.requestStateSubject.asObservable();

  columnConfig: InboDataTableColumnConfiguration<DemoItem> = {
    id: {name: 'ID', sortablePropertyName: 'id'} as any,
    name: {
      name: 'Name (Text Filter)',
      sortablePropertyName: 'name',
      filterable: true,
      filterType: 'text'
    } as any,
    description: {
      name: 'Description (Autocomplete Filter)',
      sortablePropertyName: 'description',
      filterable: true,
      filterType: 'autocomplete',
      filterSearchFunction: (query: string) => this.searchDescriptions(query),
      filterDisplayPattern: (option: SimpleAutocompleteOption) => option?.display || ''
    } as any,
    date: {
      name: 'Date',
      sortablePropertyName: 'date',
      getValue: (value: Date) => value ? value.toLocaleDateString() : '',
      style: {'textAlign': 'right', 'width': '150px'}
    } as any,
  };

  private instantData: DemoItem[] = [];
  private instantCurrentPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 5,
    totalElements: 5,
    empty: false,
    first: true,
    last: true,
    sorted: false,
    totalPages: 1
  };
  private instantDataSubject = new BehaviorSubject<ApiPage<DemoItem> | null>(null);
  instantDataPage$: Observable<ApiPage<DemoItem> | null> = this.instantDataSubject.asObservable();
  private instantRequestStateSubject = new BehaviorSubject<RequestState>(RequestState.SUCCESS);
  instantDataRequestState$: Observable<RequestState> = this.instantRequestStateSubject.asObservable();

  instantColumnConfig: Signal<InboDataTableColumnConfiguration<DemoItem>> = computed(() => {
    const template = this.statusCellTemplateRef();
    const config: InboDataTableColumnConfiguration<DemoItem> = {
      id: {name: 'ID'} as any,
      name: {name: 'Name'} as any,
      status: {name: 'Status'} as any,
    };

    if (template) {
      config.status = {...config.status, cellTemplate: template};
    }
    return config;
  });

  constructor(private snackBar: MatSnackBar) {
    this.generateData();
    this.fetchData();
    this.initializeInstantData();
  }

  private generateData(): void {
    this.data = Array.from({length: this.currentPageable.totalElements}, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 1e12),
      isEditButtonDisabled: i % 5 === 0,
      isDeleteButtonDisabled: i % 3 === 0,
      isViewButtonDisabled: i % 7 === 0,
      status: ['active', 'inactive', 'pending'][i % 3] as 'active' | 'inactive' | 'pending'
    }));
    this.currentPageable.totalPages = Math.ceil(this.currentPageable.totalElements / this.currentPageable.pageSize);
  }

  private fetchData(): void {
    this.requestStateSubject.next(RequestState.PENDING);

    let filteredData = [...this.data];
    Object.keys(this.currentFilters).forEach(key => {
      const filterValue = this.currentFilters[key]?.toLowerCase();
      if (filterValue) {
        filteredData = filteredData.filter(item => {
          const itemValue = String(item[key as keyof DemoItem])?.toLowerCase();
          return itemValue.includes(filterValue);
        });
      }
    });

    const totalFilteredElements = filteredData.length;

    const start = this.currentPageable.pageNumber * this.currentPageable.pageSize;
    const end = start + this.currentPageable.pageSize;

    const sortedData = [...filteredData].sort((a, b) => {
      const isAsc = this.currentSort.direction === 'asc';
      const field = this.currentSort.active as keyof DemoItem;
      const valA = a[field];
      const valB = b[field];

      if (valA == null && valB == null) return 0;
      if (valA == null) return isAsc ? -1 : 1;
      if (valB == null) return isAsc ? 1 : -1;

      if (valA < valB) {
        return isAsc ? -1 : 1;
      } else if (valA > valB) {
        return isAsc ? 1 : -1;
      } else {
        return 0;
      }
    });

    const pageContent = sortedData.slice(start, end);

    const pageableForCurrentPage: DemoPageable = {
      ...this.currentPageable,
      totalElements: totalFilteredElements,
      totalPages: Math.ceil(totalFilteredElements / this.currentPageable.pageSize),
      empty: pageContent.length === 0,
      first: this.currentPageable.pageNumber === 0,
      last: this.currentPageable.pageNumber >= Math.ceil(totalFilteredElements / this.currentPageable.pageSize) - 1,
    };

    of({
      content: pageContent,
      pageable: pageableForCurrentPage,
    }).pipe(
      delay(1000)
    ).subscribe(page => {
      if (this.currentRequestState === RequestState.ERROR) {
        // Keep error state if manually set
        this.requestStateSubject.next(RequestState.ERROR);
        this.dataSubject.next(null);
      } else if (page.content.length === 0) {
        this.requestStateSubject.next(RequestState.EMPTY);
        this.dataSubject.next(page);
      } else {
        // Always set to SUCCESS on successful, non-empty fetch
        // unless error state was manually triggered before fetch completed.
        if (this.requestStateSubject.value !== RequestState.ERROR) {
          this.requestStateSubject.next(RequestState.SUCCESS);
        }
        this.dataSubject.next(page);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPageable.pageNumber = event.pageIndex;
    this.currentPageable.pageSize = event.pageSize;
    this.currentPageable.totalPages = Math.ceil(this.currentPageable.totalElements / this.currentPageable.pageSize);
    this.fetchData();
  }

  onSortChange(sort: Sort): void {
    console.log('Sort changed in demo:', sort);
    this.currentSort = sort;
    this.currentPageable.pageNumber = 0;
    this.fetchData();
  }

  onFilterChange(filters: Record<string, string>): void {
    this.currentFilters = filters;
    this.currentPageable.pageNumber = 0;
    this.fetchData();
  }

  onEditItem(item: DemoItem): void {
    this.snackBar.open(`Edit item: ${item.name}`, 'Close', {duration: 2000});
  }

  onDeleteItem(item: DemoItem): void {
    this.snackBar.open(`Delete item: ${item.name}`, 'Close', {duration: 2000});
    this.data = this.data.filter(d => d.id !== item.id);
    this.currentPageable.totalElements = this.data.length;
    this.currentPageable.totalPages = Math.ceil(this.currentPageable.totalElements / this.currentPageable.pageSize);
    if (this.currentPageable.pageNumber * this.currentPageable.pageSize >= this.currentPageable.totalElements) {
      this.currentPageable.pageNumber = Math.max(0, this.currentPageable.totalPages - 1);
    }
    this.fetchData();
  }

  onClickItem(item: DemoItem): void {
    this.snackBar.open(`Clicked item: ${item.name}`, 'Close', {duration: 2000});
  }

  toggleRequestState(): void {
    if (this.requestStateSubject.value === RequestState.SUCCESS) {
      this.currentRequestState = RequestState.PARTIAL_PENDING;
    } else if (this.requestStateSubject.value === RequestState.PARTIAL_PENDING) {
      this.currentRequestState = RequestState.PENDING;
    } else {
      this.currentRequestState = RequestState.SUCCESS;
    }
    this.fetchData();
  }

  toggleEmptyState(): void {
    if (this.requestStateSubject.value !== RequestState.EMPTY) {
      const originalData = [...this.data];
      const originalPageable = {...this.currentPageable};
      this.data = [];
      this.currentPageable.totalElements = 0;
      this.currentPageable.totalPages = 0;
      this.currentPageable.pageNumber = 0;
      this.fetchData();
      this.dataRequestState$.pipe(
        filter(s => s !== RequestState.PENDING),
        take(1)
      ).subscribe(() => {
        this.data = originalData;
        this.currentPageable = originalPageable;
      });
    } else {
      this.generateData();
      this.currentRequestState = RequestState.SUCCESS;
      this.fetchData();
    }
  }

  setErrorState(): void {
    this.currentRequestState = RequestState.ERROR;
    this.fetchData();
  }

  private initializeInstantData(): void {
    const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
    this.instantData = Array.from({length: this.instantCurrentPageable.totalElements}, (_, i) => ({
      id: 1000 + i + 1,
      name: `Instant Item ${i + 1}`,
      description: `Desc ${i + 1}`,
      date: new Date(),
      status: statuses[i % statuses.length]
    }));

    const page: ApiPage<DemoItem> = {
      content: this.instantData,
      pageable: this.instantCurrentPageable,
    };
    this.instantDataSubject.next(page);
    this.instantRequestStateSubject.next(RequestState.SUCCESS);
  }

  private searchDescriptions(query: string): Observable<SimpleAutocompleteOption[]> {
    const lowerQuery = query?.toLowerCase() || '';
    const uniqueDescriptions = [...new Set(this.data.map(item => item.description))];
    const filteredDescriptions = uniqueDescriptions
      .filter(desc => desc.toLowerCase().includes(lowerQuery))
      .slice(0, 10);

    const options: SimpleAutocompleteOption[] = filteredDescriptions.map(desc => ({
      value: desc,
      display: desc
    }));

    return of(options).pipe(delay(300));
  }
}
