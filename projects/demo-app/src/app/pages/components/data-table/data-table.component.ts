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
    pageSize: 5,
    totalElements: 100,
    empty: false,
    first: true,
    last: false,
    sorted: false,
    totalPages: 20
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
      name: 'Name (Local Text Filter)',
      sortablePropertyName: 'name',
      filterable: true,
      filterType: 'text',
      filterMode: 'local',
      filterPlaceholder: 'Filter by name (local)'
    } as any,
    description: {
      name: 'Description (Remote Autocomplete)',
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

  private paginationDemoData: DemoItem[] = [];
  private paginationDemoPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 5,
    totalElements: 25,
    empty: false,
    first: true,
    last: false,
    sorted: false,
    totalPages: 5
  };
  private paginationDemoDataSubject = new BehaviorSubject<ApiPage<DemoItem> | null>(null);
  paginationDemoDataPage$: Observable<ApiPage<DemoItem> | null> = this.paginationDemoDataSubject.asObservable();
  private paginationDemoRequestStateSubject = new BehaviorSubject<RequestState>(RequestState.PENDING);
  paginationDemoDataRequestState$: Observable<RequestState> = this.paginationDemoRequestStateSubject.asObservable();
  paginationDemoColumnConfig: InboDataTableColumnConfiguration<DemoItem> = {
    id: {name: 'ID'} as any,
    name: {name: 'Name'} as any,
    description: {name: 'Description'} as any,
  };

  // Properties for the new "Local Filtering Showcase" table
  private localFilterAllData: DemoItem[] = [];
  private localFilterCurrentPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 5,
    totalElements: 25, // 25 items, 5 pages
    empty: false,
    first: true,
    last: false,
    sorted: false,
    totalPages: 5
  };
  currentLocalFilterSort: Sort = {active: 'name', direction: 'asc'}; // Added for local sort
  private localFilterDataSubject = new BehaviorSubject<ApiPage<DemoItem> | null>(null);
  localFilterDataPage$: Observable<ApiPage<DemoItem> | null> = this.localFilterDataSubject.asObservable();
  private localFilterRequestStateSubject = new BehaviorSubject<RequestState>(RequestState.SUCCESS); // No loading spinner
  localFilterDataRequestState$: Observable<RequestState> = this.localFilterRequestStateSubject.asObservable();

  localFilterColumnConfig: InboDataTableColumnConfiguration<DemoItem> = {
    id: { name: 'ID', sortablePropertyName: 'id' } as any, // Added sortablePropertyName
    name: {
      name: 'Name (Local Filter)',
      sortablePropertyName: 'name', // Added sortablePropertyName
      filterable: true,
      filterType: 'text',
      filterMode: 'local',
      filterPlaceholder: 'Filter name locally...'
    } as any,
    description: {
      name: 'Description (Local Filter)',
      sortablePropertyName: 'description', // Added sortablePropertyName
      filterable: true,
      filterType: 'text',
      filterMode: 'local',
      filterPlaceholder: 'Filter description locally...'
    } as any,
  };

  constructor(private snackBar: MatSnackBar) {
    this.generateData();
    this.fetchData();
    this.initializeInstantData();
    this.initializePaginationDemoData();
    this.fetchPaginationDemoData(this.paginationDemoPageable.pageNumber, this.paginationDemoPageable.pageSize);
    this.initializeLocalFilterData();
    this.updateLocalFilterDataView();
  }

  private generateData(): void {
    this.data = Array.from({length: 100}, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 1e12),
      isEditButtonDisabled: i % 5 === 0,
      isDeleteButtonDisabled: i % 3 === 0,
      isViewButtonDisabled: i % 7 === 0,
      status: ['active', 'inactive', 'pending'][i % 3] as 'active' | 'inactive' | 'pending'
    }));
    this.currentPageable.totalElements = this.data.length;
    this.currentPageable.totalPages = Math.ceil(this.currentPageable.totalElements / this.currentPageable.pageSize);
  }

  private initializePaginationDemoData(): void {
    this.paginationDemoData = Array.from({length: this.paginationDemoPageable.totalElements}, (_, i) => ({
      id: 2000 + i + 1,
      name: `Paginated Item ${i + 1}`,
      description: `This is paginated item ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 1e10),
      status: ['active', 'inactive', 'pending'][i % 3] as 'active' | 'inactive' | 'pending'
    }));
    this.paginationDemoPageable.totalPages = Math.ceil(this.paginationDemoData.length / this.paginationDemoPageable.pageSize);
  }

  private fetchPaginationDemoData(pageNumber: number, pageSize: number): void {
    this.paginationDemoRequestStateSubject.next(RequestState.PENDING);

    const start = pageNumber * pageSize;
    const end = start + pageSize;
    const pageContent = this.paginationDemoData.slice(start, end);

    this.paginationDemoPageable = {
      ...this.paginationDemoPageable,
      pageNumber,
      pageSize,
      totalElements: this.paginationDemoData.length,
      totalPages: Math.ceil(this.paginationDemoData.length / pageSize),
      empty: pageContent.length === 0,
      first: pageNumber === 0,
      last: pageNumber >= (Math.ceil(this.paginationDemoData.length / pageSize) -1)
    };

    of({
      content: pageContent,
      pageable: this.paginationDemoPageable,
    }).pipe(
      delay(500) // Simulate network delay
    ).subscribe(page => {
      if (page.content.length === 0) {
        this.paginationDemoRequestStateSubject.next(RequestState.EMPTY);
      } else {
        this.paginationDemoRequestStateSubject.next(RequestState.SUCCESS);
      }
      this.paginationDemoDataSubject.next(page);
    });
  }

  private fetchData(): void {
    this.requestStateSubject.next(RequestState.PENDING);

    let processedData = [...this.data];

    // Apply REMOTE filters from this.currentFilters
    Object.keys(this.currentFilters).forEach(key => {
      const filterValue = this.currentFilters[key]?.toLowerCase();
      const columnKey = key as keyof DemoItem;
      // Ensure columnConfig exists for the given key before trying to access its properties
      const config = this.columnConfig && this.columnConfig[columnKey]; 

      // Only apply filter here if it's a remote filter (or filterMode is not defined, default to remote)
      if (filterValue && config && (config.filterMode === 'remote' || !config.filterMode)) {
        processedData = processedData.filter(item => {
          // Using a flexible way to get item value, similar to how it might be in a real scenario
          const itemValue = String(item[columnKey] ?? '').toLowerCase(); 
          return itemValue.includes(filterValue);
        });
      }
    });

    const totalFilteredElements = processedData.length;

    const start = this.currentPageable.pageNumber * this.currentPageable.pageSize;
    const end = start + this.currentPageable.pageSize;

    const sortedData = [...processedData].sort((a, b) => {
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

  onPaginationDemoPageChange(event: PageEvent): void {
    this.fetchPaginationDemoData(event.pageIndex, event.pageSize);
  }

  private initializeLocalFilterData(): void {
    this.localFilterAllData = Array.from({ length: this.localFilterCurrentPageable.totalElements }, (_, i) => ({
      id: 3000 + i + 1,
      name: `Local Item ${i + 1}`,
      description: `Description for local item ${i + 1} - some have common words like 'example' or 'test'`,
      date: new Date(Date.now() - Math.random() * 1e11),
      status: ['active', 'inactive', 'pending'][i % 3] as 'active' | 'inactive' | 'pending'
    }));
    // Add some specific descriptions for testing filtering
    if (this.localFilterAllData.length > 5) this.localFilterAllData[2].description = "An example description";
    if (this.localFilterAllData.length > 10) this.localFilterAllData[7].description = "Another test case example";


    this.localFilterCurrentPageable.totalPages = Math.ceil(
      this.localFilterAllData.length / this.localFilterCurrentPageable.pageSize
    );
  }

  private updateLocalFilterDataView(): void {
    // Apply sorting to the full localFilterAllData set first
    const sortedData = [...this.localFilterAllData].sort((a, b) => {
      const isAsc = this.currentLocalFilterSort.direction === 'asc';
      const field = this.currentLocalFilterSort.active as keyof DemoItem;
      const valA = a[field];
      const valB = b[field];

      if (valA == null && valB == null) return 0;
      if (valA == null) return isAsc ? -1 : 1;
      if (valB == null) return isAsc ? 1 : -1;

      if (valA < valB) return isAsc ? -1 : 1;
      else if (valA > valB) return isAsc ? 1 : -1;
      else return 0;
    });
    
    const start = this.localFilterCurrentPageable.pageNumber * this.localFilterCurrentPageable.pageSize;
    const end = start + this.localFilterCurrentPageable.pageSize;
    const pageContent = sortedData.slice(start, end);

    this.localFilterCurrentPageable.totalElements = this.localFilterAllData.length; // Should be full data length
    this.localFilterCurrentPageable.totalPages = Math.ceil(
        this.localFilterAllData.length / this.localFilterCurrentPageable.pageSize
    );
    this.localFilterCurrentPageable.empty = pageContent.length === 0;
    this.localFilterCurrentPageable.first = this.localFilterCurrentPageable.pageNumber === 0;
    this.localFilterCurrentPageable.last = this.localFilterCurrentPageable.pageNumber >= (this.localFilterCurrentPageable.totalPages -1);


    const page: ApiPage<DemoItem> = {
      content: pageContent,
      pageable: { ...this.localFilterCurrentPageable } // Pass a copy
    };
    this.localFilterDataSubject.next(page);
    // No need to change requestStateSubject, it's already SUCCESS
  }

  // Handler for the new table's page changes
  onLocalFilterPageChange(event: PageEvent): void {
    this.localFilterCurrentPageable.pageNumber = event.pageIndex;
    this.localFilterCurrentPageable.pageSize = event.pageSize; // Though pageSize isn't changeable in this demo table
    this.updateLocalFilterDataView();
  }

  // Handler for the new table's sort changes
  onLocalFilterSortChange(sort: Sort): void {
    this.currentLocalFilterSort = sort;
    this.localFilterCurrentPageable.pageNumber = 0; // Reset to first page on sort
    this.updateLocalFilterDataView();
  }

  // Handler for the new table's filter changes (mostly for logging/observing)
  onLocalFilterFilterChange(filters: Record<string, string>): void {
    console.log('Local filter table filters changed:', filters);
    // Data view updates are handled by InboDataTableComponent's internal filtering
    // for 'local' mode filters. The `dataPage` input it receives from here
    // should be the paginated *original* data.
    // However, if filters affect totalElements for pagination, we might need to act.
    // But our InboDataTableComponent's local filtering does not re-emit to parent for re-pagination.
    // It filters the *current page* of data.
    // For this example, we will assume pagination remains on the full dataset.
  }
}
