import { CommonModule } from '@angular/common';
import {
  Component,
  Signal,
  TemplateRef,
  computed,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import {
  FilterMode,
  FilterType,
} from 'projects/ng-inbo/src/lib/components/data-table/column-configuration.model';
import {
  ApiPage,
  InboDataTableColumnConfiguration,
  InboDataTableComponent,
  InboDatatableItem,
  RequestState,
} from 'projects/ng-inbo/src/public-api';
import { BehaviorSubject, Observable, delay, filter, of, take } from 'rxjs';

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
  isActive: boolean;
  randomDetail?: string;
}

type DemoPageable = ApiPage<DemoItem>['pageable'];

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    InboDataTableComponent,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  statusCellTemplateRef = viewChild<TemplateRef<unknown>>('statusCellTemplate');

  private data: Array<DemoItem> = [];
  private currentPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 5,
    totalElements: 100,
    empty: false,
    first: true,
    last: false,
    sorted: false,
    totalPages: 20,
  };

  currentSort: Sort = { active: 'name', direction: 'asc' };
  private currentRequestState = RequestState.PENDING;
  private currentFilters: Record<string, string> = {};

  private dataSubject = new BehaviorSubject<ApiPage<DemoItem> | null>(null);
  dataPage$: Observable<ApiPage<DemoItem> | null> =
    this.dataSubject.asObservable();

  private requestStateSubject = new BehaviorSubject<RequestState>(
    this.currentRequestState
  );
  dataRequestState$: Observable<RequestState> =
    this.requestStateSubject.asObservable();

  columnConfig: InboDataTableColumnConfiguration<DemoItem> = {
    id: { name: 'ID', sortablePropertyName: 'id' },
    name: {
      name: 'Name (Local Text Filter)',
      sortablePropertyName: 'name',
      filterable: true,
      filterType: FilterType.Text,
      filterMode: FilterMode.Local,
      filterPlaceholder: 'Filter by name (local)',
    },
    description: {
      name: 'Description (Remote Autocomplete)',
      sortablePropertyName: 'description',
      filterable: true,
      filterType: FilterType.Autocomplete,
      filterSearchFunction: (query: string) => this.searchDescriptions(query),
      filterDisplayPattern: (option: string) => option || '',
      filterValueSelector: (option: string) => option,
    },
    date: {
      name: 'Date',
      sortablePropertyName: 'date',
      getValue: (value: Date) => (value ? value.toLocaleDateString() : ''),
      style: { textAlign: 'right', width: '150px' },
    },
  };

  private instantData: Array<DemoItem> = [];
  private instantCurrentPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 5,
    totalElements: 5,
    empty: false,
    first: true,
    last: true,
    sorted: false,
    totalPages: 1,
  };
  private instantDataSubject = new BehaviorSubject<ApiPage<DemoItem> | null>(
    null
  );
  instantDataPage$: Observable<ApiPage<DemoItem> | null> =
    this.instantDataSubject.asObservable();
  private instantRequestStateSubject = new BehaviorSubject<RequestState>(
    RequestState.SUCCESS
  );
  instantDataRequestState$: Observable<RequestState> =
    this.instantRequestStateSubject.asObservable();

  instantColumnConfig: Signal<InboDataTableColumnConfiguration<DemoItem>> =
    computed(() => {
      const template = this.statusCellTemplateRef();
      const config: InboDataTableColumnConfiguration<DemoItem> = {
        id: { name: 'ID' },
        name: { name: 'Name' },
        randomDetail: { name: '' },
        status: { name: 'Status' },
      };

      if (template) {
        config.status = { ...config.status, cellTemplate: template };
      }
      return config;
    });

  private paginationDemoData: Array<DemoItem> = [];
  private paginationDemoPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 5,
    totalElements: 25,
    empty: false,
    first: true,
    last: false,
    sorted: false,
    totalPages: 5,
  };
  private paginationDemoDataSubject =
    new BehaviorSubject<ApiPage<DemoItem> | null>(null);
  paginationDemoDataPage$: Observable<ApiPage<DemoItem> | null> =
    this.paginationDemoDataSubject.asObservable();
  private paginationDemoRequestStateSubject = new BehaviorSubject<RequestState>(
    RequestState.PENDING
  );
  paginationDemoDataRequestState$: Observable<RequestState> =
    this.paginationDemoRequestStateSubject.asObservable();
  paginationDemoColumnConfig: InboDataTableColumnConfiguration<DemoItem> = {
    id: { name: 'ID' },
    name: { name: 'Name' },
    description: { name: 'Description' },
  };

  // Properties for the new "Local Filtering Showcase" table
  private localFilterAllData: Array<DemoItem> = [];
  private localFilterCurrentPageable: DemoPageable = {
    pageNumber: 0,
    pageSize: 5,
    totalElements: 25, // 25 items, 5 pages
    empty: false,
    first: true,
    last: false,
    sorted: false,
    totalPages: 5,
  };
  currentLocalFilterSort: Sort = { active: 'name', direction: 'asc' }; // Added for local sort
  private localFilterDataSubject =
    new BehaviorSubject<ApiPage<DemoItem> | null>(null);
  localFilterDataPage$: Observable<ApiPage<DemoItem> | null> =
    this.localFilterDataSubject.asObservable();
  private localFilterRequestStateSubject = new BehaviorSubject<RequestState>(
    RequestState.SUCCESS
  ); // No loading spinner
  localFilterDataRequestState$: Observable<RequestState> =
    this.localFilterRequestStateSubject.asObservable();

  localFilterColumnConfig: InboDataTableColumnConfiguration<DemoItem> = {
    id: { name: 'ID', sortablePropertyName: 'id' },
    name: {
      name: 'Name (Local Filter)',
      sortablePropertyName: 'name',
      filterable: true,
      filterType: FilterType.Text,
      filterMode: FilterMode.Local,
      filterPlaceholder: 'Filter name locally...',
    },
    description: {
      name: 'Description (Local Autocomplete Filter)',
      sortablePropertyName: 'description',
      filterable: true,
      filterType: FilterType.Autocomplete,
      filterMode: FilterMode.Local,
      filterPlaceholder: 'Filter description locally...',
      filterSearchFunction: (query: string) =>
        this.searchLocalDescriptions(query),
      filterDisplayPattern: (option: string) => option || '',
      filterValueSelector: (option: string) => option,
    },
    randomDetail: { name: '' },
    isActive: {
      name: 'Active Status (Boolean Filter)',
      sortablePropertyName: 'isActive',
      filterable: true,
      filterType: FilterType.Boolean,
      filterMode: FilterMode.Local,
      filterPlaceholder: 'Filter by active status',
      booleanFilterTrueLabel: 'Currently Active',
      booleanFilterFalseLabel: 'Currently Inactive',
      booleanFilterBothLabel: 'Any Status',
    },
  };

  constructor(private snackBar: MatSnackBar) {
    this.generateData();
    this.fetchData();
    this.initializeInstantData();
    this.initializePaginationDemoData();
    this.fetchPaginationDemoData(
      this.paginationDemoPageable.pageNumber,
      this.paginationDemoPageable.pageSize
    );
    this.initializeLocalFilterData();
    this.updateLocalFilterDataView();
  }

  private generateData(): void {
    this.data = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 1e12),
      isEditButtonDisabled: i % 5 === 0,
      isDeleteButtonDisabled: i % 3 === 0,
      isViewButtonDisabled: i % 7 === 0,
      status: ['active', 'inactive', 'pending'][i % 3] as
        | 'active'
        | 'inactive'
        | 'pending',
      isActive: i % 2 === 0,
    }));
    this.currentPageable.totalElements = this.data.length;
    this.currentPageable.totalPages = Math.ceil(
      this.currentPageable.totalElements / this.currentPageable.pageSize
    );
  }

  private initializePaginationDemoData(): void {
    this.paginationDemoData = Array.from(
      { length: this.paginationDemoPageable.totalElements },
      (_, i) => ({
        id: 2000 + i + 1,
        name: `Paginated Item ${i + 1}`,
        description: `This is paginated item ${i + 1}`,
        date: new Date(Date.now() - Math.random() * 1e10),
        status: ['active', 'inactive', 'pending'][i % 3] as
          | 'active'
          | 'inactive'
          | 'pending',
        isActive: i % 2 === 0,
      })
    );
    this.paginationDemoPageable.totalPages = Math.ceil(
      this.paginationDemoData.length / this.paginationDemoPageable.pageSize
    );
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
      last:
        pageNumber >= Math.ceil(this.paginationDemoData.length / pageSize) - 1,
    };

    of({
      content: pageContent,
      pageable: this.paginationDemoPageable,
    })
      .pipe(
        delay(500) // Simulate network delay
      )
      .subscribe(page => {
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
      if (
        filterValue &&
        config &&
        (config.filterMode === 'remote' || !config.filterMode)
      ) {
        processedData = processedData.filter(item => {
          // Using a flexible way to get item value, similar to how it might be in a real scenario
          const itemValue = String(item[columnKey] ?? '').toLowerCase();
          return itemValue.includes(filterValue);
        });
      }
    });

    const totalFilteredElements = processedData.length;

    const start =
      this.currentPageable.pageNumber * this.currentPageable.pageSize;
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
      totalPages: Math.ceil(
        totalFilteredElements / this.currentPageable.pageSize
      ),
      empty: pageContent.length === 0,
      first: this.currentPageable.pageNumber === 0,
      last:
        this.currentPageable.pageNumber >=
        Math.ceil(totalFilteredElements / this.currentPageable.pageSize) - 1,
    };

    of({
      content: pageContent,
      pageable: pageableForCurrentPage,
    })
      .pipe(delay(1000))
      .subscribe(page => {
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
    this.currentPageable.totalPages = Math.ceil(
      this.currentPageable.totalElements / this.currentPageable.pageSize
    );
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
    this.snackBar.open(`Edit item: ${item.name}`, 'Close', { duration: 2000 });
  }

  onDeleteItem(item: DemoItem): void {
    this.snackBar.open(`Delete item: ${item.name}`, 'Close', {
      duration: 2000,
    });
    this.data = this.data.filter(d => d.id !== item.id);
    this.currentPageable.totalElements = this.data.length;
    this.currentPageable.totalPages = Math.ceil(
      this.currentPageable.totalElements / this.currentPageable.pageSize
    );
    if (
      this.currentPageable.pageNumber * this.currentPageable.pageSize >=
      this.currentPageable.totalElements
    ) {
      this.currentPageable.pageNumber = Math.max(
        0,
        this.currentPageable.totalPages - 1
      );
    }
    this.fetchData();
  }

  onClickItem(item: DemoItem): void {
    this.snackBar.open(`Clicked item: ${item.name}`, 'Close', {
      duration: 2000,
    });
  }

  toggleRequestState(): void {
    if (this.requestStateSubject.value === RequestState.SUCCESS) {
      this.currentRequestState = RequestState.PARTIAL_PENDING;
    } else if (
      this.requestStateSubject.value === RequestState.PARTIAL_PENDING
    ) {
      this.currentRequestState = RequestState.PENDING;
    } else {
      this.currentRequestState = RequestState.SUCCESS;
    }
    this.fetchData();
  }

  toggleEmptyState(): void {
    if (this.requestStateSubject.value !== RequestState.EMPTY) {
      const originalData = [...this.data];
      const originalPageable = { ...this.currentPageable };
      this.data = [];
      this.currentPageable.totalElements = 0;
      this.currentPageable.totalPages = 0;
      this.currentPageable.pageNumber = 0;
      this.fetchData();
      this.dataRequestState$
        .pipe(
          filter(s => s !== RequestState.PENDING),
          take(1)
        )
        .subscribe(() => {
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
    const statuses: Array<'active' | 'inactive' | 'pending'> = [
      'active',
      'inactive',
      'pending',
    ];
    this.instantData = Array.from(
      { length: this.instantCurrentPageable.totalElements },
      (_, i) => ({
        id: 1000 + i + 1,
        name: `Instant Item ${i + 1}`,
        description: `Desc ${i + 1}`,
        date: new Date(),
        status: statuses[i % statuses.length],
        isActive: i % 2 === 0,
        randomDetail: `RND-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
      })
    );

    const page: ApiPage<DemoItem> = {
      content: this.instantData,
      pageable: this.instantCurrentPageable,
    };
    this.instantDataSubject.next(page);
    this.instantRequestStateSubject.next(RequestState.SUCCESS);
  }

  private searchDescriptions(
    query: string
  ): Observable<Array<SimpleAutocompleteOption>> {
    const lowerQuery = query?.toLowerCase() || '';
    const uniqueDescriptions = [
      ...new Set(this.data.map(item => item.description)),
    ];
    const filteredDescriptions = uniqueDescriptions
      .filter(desc => desc.toLowerCase().includes(lowerQuery))
      .slice(0, 10);

    const options: Array<SimpleAutocompleteOption> = filteredDescriptions.map(
      desc => ({
        value: desc,
        display: desc,
      })
    );

    return of(options).pipe(delay(300));
  }

  private searchLocalDescriptions(
    query: string
  ): Observable<Array<SimpleAutocompleteOption>> {
    const lowerQuery = query?.toLowerCase() || '';
    // Search against the full local dataset for the showcase table
    const uniqueDescriptions = [
      ...new Set(this.localFilterAllData.map(item => item.description)),
    ];
    const filteredDescriptions = uniqueDescriptions
      .filter(desc => desc.toLowerCase().includes(lowerQuery))
      .slice(0, 10); // Limit to 10 suggestions for performance

    const options: Array<SimpleAutocompleteOption> = filteredDescriptions.map(
      desc => ({
        value: desc, // The value to filter by will be the description string itself
        display: desc, // How it's displayed in the autocomplete dropdown
      })
    );

    return of(options).pipe(delay(200)); // Shorter delay for local search
  }

  onPaginationDemoPageChange(event: PageEvent): void {
    this.fetchPaginationDemoData(event.pageIndex, event.pageSize);
  }

  private initializeLocalFilterData(): void {
    this.localFilterAllData = Array.from(
      { length: this.localFilterCurrentPageable.totalElements },
      (_, i) => ({
        id: 3000 + i + 1,
        name: `Local Item ${i + 1}`,
        description: `Description for local item ${
          i + 1
        } - some have common words like 'example' or 'test'. Item index: ${i}`,
        date: new Date(Date.now() - Math.random() * 1e11),
        status: ['active', 'inactive', 'pending'][i % 3] as
          | 'active'
          | 'inactive'
          | 'pending',
        isActive: i % 2 === 0,
        randomDetail: `RND_LOCAL-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`, // Populate for local filter data
      })
    );
    if (this.localFilterAllData.length > 5)
      this.localFilterAllData[2].description =
        'An example description. Item index: 2';
    if (this.localFilterAllData.length > 10)
      this.localFilterAllData[7].description =
        'Another test case example. Item index: 7';

    // No need to calculate totalPages here as it will be based on the full list passed to the table
    // which then does its own pagination if clientSideProcessing=true
    this.updateLocalFilterDataView(); // Initial call to populate the view
  }

  private updateLocalFilterDataView(): void {
    // When clientSideProcessing is true for the inbo-data-table,
    // we provide the *entire* dataset. The table will handle sorting, filtering, and pagination internally.
    // The `currentLocalFilterSort` is passed as an input to the table for initial sort.

    const allData = [...this.localFilterAllData];
    const totalElements = allData.length;

    const pageableForClientProcessing: DemoPageable = {
      first: true,
      last: true,
      empty: totalElements === 0,
      pageNumber: 0,
      pageSize: 2000, // As per user example for a single page containing all data
      totalPages: 1, // All data is on this one page
      totalElements: totalElements,
      sorted: false, // As per user example, initial sort driven by [sort] input on table
    };

    const page: ApiPage<DemoItem> = {
      content: allData, // Pass the full, unsorted (by parent) data
      pageable: pageableForClientProcessing,
    };

    this.localFilterDataSubject.next(page);
    this.localFilterRequestStateSubject.next(RequestState.SUCCESS); // Assuming data is always ready
  }

  // Handler for the new table's page changes
  onLocalFilterPageChange(event: PageEvent): void {
    // This might not be called if clientSideProcessing=true, as table handles its own pagination
    console.log(
      'Local Filter Showcase: PageChange event from table (should not happen with clientSideProcessing=true):',
      event
    );
    this.localFilterCurrentPageable.pageNumber = event.pageIndex;
    // updateLocalFilterDataView() would typically be called here if parent managed pagination
  }

  // Handler for the new table's sort changes
  onLocalFilterSortChange(sort: Sort): void {
    this.currentLocalFilterSort = sort;
    // When clientSideProcessing=true, the inbo-data-table handles its own sorting using this.currentLocalFilterSort as its initial state.
    // No need to call updateLocalFilterDataView() to re-sort and re-page, as the table does it.
    console.log(
      'Local Filter Showcase: Sort changed, new initial sort for table:',
      sort
    );
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
