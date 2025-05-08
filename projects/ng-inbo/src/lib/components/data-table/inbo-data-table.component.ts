import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  input,
  InputSignal,
  Output,
  Renderer2,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
  NgZone,
  effect
} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {InboDataTableColumn, InboDataTableColumnConfiguration, FilterType} from './column-configuration.model';
import {ApiPage} from '../../services/api/api-page.model';
import {RequestState} from '../../services/api/request-state.enum';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableModule
} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgIf, NgStyle, NgTemplateOutlet, AsyncPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, startWith, catchError } from 'rxjs/operators';
import {NgInboModule} from "../../ng-inbo.module";
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

export interface InboDatatableItem {
  isViewButtonDisabled?: boolean;
  isDeleteButtonDisabled?: boolean;
  isEditButtonDisabled?: boolean;
}

@Component({
  selector: 'inbo-data-table',
  templateUrl: 'inbo-data-table.component.html',
  styleUrls: ['inbo-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    NgStyle,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSortModule,
    MatAutocompleteModule,
    NgTemplateOutlet,
    AsyncPipe
  ]
})
export class InboDataTableComponent<T extends InboDatatableItem> implements AfterViewChecked {
  @ViewChild(MatTable, {static: false}) tableRef: MatTable<T>;
  @ViewChild(MatTable, { static: false, read: ElementRef }) tableElementRef: ElementRef<HTMLTableElement>;
  @ViewChild(MatPaginator, { static: false, read: ElementRef }) paginatorElementRef: ElementRef<HTMLElement>;

  readonly RequestState = RequestState;
  readonly DETAIL_COLUMN = 'detailColumn';
  readonly EDIT_COLUMN = 'editColumn';
  readonly DELETE_COLUMN = 'deleteColumn';

  dataPage: InputSignal<ApiPage<T>> = input.required<ApiPage<T>>();
  dataRequestState: InputSignal<RequestState> = input.required<RequestState>();
  columnConfiguration: InputSignal<InboDataTableColumnConfiguration<T>> = input.required<InboDataTableColumnConfiguration<T>>();
  rowHeight: InputSignal<string> = input('48px');
  sort: InputSignal<Sort | undefined> = input<Sort | undefined>(undefined);
  clientSideProcessing: InputSignal<boolean> = input(false);
  clientPageSize: InputSignal<number | undefined> = input(undefined);

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() editItem = new EventEmitter<T>();
  @Output() deleteItem = new EventEmitter<T>();
  @Output() clickItem = new EventEmitter<T>();
  @Output() sortChanged = new EventEmitter<Sort>();
  @Output() filterChanged = new EventEmitter<Record<string, string>>();

  filterValues: WritableSignal<Record<string, any>> = signal({});
  temporaryFilterValues: WritableSignal<Record<string, any>> = signal({});

  private internalClientSort: WritableSignal<Sort | undefined> = signal(undefined);
  private currentPageIndexForLocalFiltering: WritableSignal<number> = signal(0);

  private debouncedApplyFilters = new Subject<string>();
  autocompleteOptionStreams: WritableSignal<Record<string, Observable<any[]>>> = signal({});

  readonly DEFAULT_CLIENT_PAGE_SIZE = 5;

  effectivePageSizeForDisplay: Signal<number> = computed(() => {
    if (this.clientSideProcessing()) {
      return this.clientPageSize() ?? this.DEFAULT_CLIENT_PAGE_SIZE;
    }
    return this.dataPage()?.pageable.pageSize ?? this.DEFAULT_CLIENT_PAGE_SIZE;
  });

  activeSortConfigurationForTable: Signal<Sort | undefined> = computed(() => {
    return this.clientSideProcessing() ? this.internalClientSort() : this.sort();
  });

  private processedDataMasterList: Signal<T[]> = computed(() => {
    const pageContent = this.dataPage()?.content ?? [];
    let dataToProcess: T[] = [...pageContent]; 

    if (this.clientSideProcessing()) {
      dataToProcess = this.applyLocalSort(dataToProcess, this.internalClientSort());
      dataToProcess = this.applyLocalFilters(dataToProcess, this.filterValues(), true);
    } else {
      dataToProcess = this.applyLocalFilters(dataToProcess, this.filterValues(), false);
    }
    return dataToProcess;
  });

  dataForRender: Signal<T[]> = computed(() => {
    if (this.clientSideProcessing()) {
      const fullList = this.processedDataMasterList();
      const pageSize = this.effectivePageSizeForDisplay();
      const startIndex = this.currentPageIndexForLocalFiltering() * pageSize;
      const endIndex = startIndex + pageSize;
      return fullList.slice(startIndex, endIndex);
    } else {
      return this.processedDataMasterList(); 
    }
  });

  paginatorLength: Signal<number> = computed(() => {
    if (this.clientSideProcessing()) {
      return this.processedDataMasterList().length;
    } else {
      if (this.isAnyLocalFilterActive()) {
        return this.processedDataMasterList().length; 
      }
      return this.dataPage()?.pageable?.totalElements ?? 0;
    }
  });

  paginatorPageIndex: Signal<number> = computed(() => {
    if (this.clientSideProcessing()) {
      return this.currentPageIndexForLocalFiltering();
    } else {
      if (this.isAnyLocalFilterActive()) {
        return 0;
      }
      return this.dataPage()?.pageable?.pageNumber ?? 0;
    }
  });

  isAnyLocalFilterActive: Signal<boolean> = computed(() => {
    const filters = this.filterValues();
    const colConfig = this.columnConfiguration();
    if (!filters || !colConfig) {
      return false;
    }
    return Object.keys(filters).some(key => {
      const filterValue = filters[key];
      if (filterValue === undefined || filterValue === null || (typeof filterValue === 'string' && filterValue.trim() === '')) {
        return false;
      }
      const config = colConfig[key as keyof T];
      return config?.filterMode === 'local';
    });
  });

  constructor(private renderer: Renderer2, private zone: NgZone) {
    effect(() => {
      if (this.clientSideProcessing()) {
        this.internalClientSort.set(this.sort());
        this.currentPageIndexForLocalFiltering.set(0); // Reset page on mode switch or initial sort set
      } else {
        // Optionally, reset internalClientSort if switching away from client-side processing
        this.internalClientSort.set(undefined);
      }
    });

    effect(() => {
      // Effect to reset local pagination if data source changes during client-side processing
      this.dataPage(); // Depend on dataPage
      if (this.clientSideProcessing()) {
        this.currentPageIndexForLocalFiltering.set(0);
      }
    });

    this.debouncedApplyFilters.pipe(
      debounceTime(300)
    ).subscribe(columnKey => {
      this.zone.run(() => {
        this.applyFilter(columnKey);
      });
    });
  }

  displayedColumns: Signal<Array<keyof T & string>> = computed(() => {
    const config = this.columnConfiguration();
    return config ? (Object.keys(config) as Array<keyof T & string>) : [];
  });

  hasAnyFilterableColumn: Signal<boolean> = computed(() => {
    const config = this.columnConfiguration();
    return !!config && Object.values(config).some(col => col?.filterable);
  });

  allDisplayedColumns: Signal<Array<string>> = computed(() => {
    const configColumns = this.displayedColumns();

    const actionColumns: string[] = [];
    if (this.editItem.observed) {
      actionColumns.push(this.EDIT_COLUMN);
    }
    if (this.clickItem.observed) {
      actionColumns.push(this.DETAIL_COLUMN);
    }
    if (this.deleteItem.observed) {
      actionColumns.push(this.DELETE_COLUMN);
    }
    return [...configColumns, ...actionColumns];
  });

  getColumnStyles(key: keyof Partial<T>): Partial<CSSStyleDeclaration> {
    const config = this.getColumnConfigurationForKey(key);
    const styles: Partial<CSSStyleDeclaration> = { ...config?.style };
    if (config?.width !== undefined) {
      styles.width = `${config.width}px`;
    }
    return styles;
  }

  getFilterType(key: keyof Partial<T>): FilterType {
    return this.getColumnConfigurationForKey(key)?.filterType ?? 'text';
  }

  getFilterDisplayPattern(key: keyof Partial<T>): ((option: any) => string) | undefined {
    return this.getColumnConfigurationForKey(key)?.filterDisplayPattern;
  }

  getFilterSearchFunction(key: keyof Partial<T>): ((query: string) => Observable<Array<unknown>>) | undefined {
    return this.getColumnConfigurationForKey(key)?.filterSearchFunction;
  }

  getFilterPlaceholder(key: keyof Partial<T>): string | undefined {
    return this.getColumnConfigurationForKey(key)?.filterPlaceholder;
  }

  getColumnConfigurationForKey<P>(
    key: keyof Partial<T>
  ): InboDataTableColumn<T[keyof T]> | undefined {
    return this.columnConfiguration()[key];
  }

  onAutocompleteInputTextChanged(columnKey: string, event: Event): void {
    const value = (event.target as HTMLInputElement)?.value;
    const searchFn = this.getFilterSearchFunction(columnKey as keyof T);
    if (searchFn && typeof value === 'string' && value.trim() !== '') {
      this.autocompleteOptionStreams.update(streams => ({
        ...streams,
        [columnKey]: searchFn(value).pipe(
          startWith([]),
          catchError(err => {
            console.error('Error fetching autocomplete options:', err);
            return of([]);
          })
        )
      }));
    } else {
      this.autocompleteOptionStreams.update(streams => {
        const newStreams = {...streams};
        newStreams[columnKey] = of([]);
        return newStreams;
      });
    }
  }

  getOptionDisplayText(columnKey: keyof Partial<T>, option: any): string {
    const displayFn = this.getFilterDisplayPattern(columnKey);
    if (displayFn) {
      return displayFn(option);
    }
    return option ? String(option) : '';
  }

  onEditItemClick(event: MouseEvent, dataItem: T): void {
    if (dataItem.isEditButtonDisabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.editItem.emit(dataItem);
  }

  onDeleteItemClick(event: MouseEvent, dataItem: T): void {
    if (dataItem.isDeleteButtonDisabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.deleteItem.emit(dataItem);
  }

  onViewItemClick(event: MouseEvent, dataItem: T): void {
    if (dataItem.isViewButtonDisabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.clickItem.emit(dataItem);
  }

  updateTemporaryFilter(columnKey: string, value: any): void {
    this.temporaryFilterValues.update(current => ({...current, [columnKey]: value}));
    const config = this.getColumnConfigurationForKey(columnKey as keyof T);
    if (config?.filterMode === 'local' && (config?.filterType === 'text' || !config?.filterType)) {
      this.debouncedApplyFilters.next(columnKey);
    }
  }

  applyFilter(columnKey: string): void {
    let temporaryValue = this.temporaryFilterValues()[columnKey];

    if (temporaryValue === '' || temporaryValue === null) {
      temporaryValue = undefined;
    }

    const currentActiveValue = this.filterValues()[columnKey];

    if (currentActiveValue !== temporaryValue) {
      this.filterValues.update(current => {
        const newValues = {...current};
        if (temporaryValue === undefined) {
          delete newValues[columnKey];
        } else {
          newValues[columnKey] = temporaryValue;
        }
        return newValues;
      });
      if (this.clientSideProcessing()) {
        this.currentPageIndexForLocalFiltering.set(0);
      }
      this.emitFilterChanged();
    }
  }

  clearFilter(columnKey: string): void {
    let changed = false;
    const currentFilterValue = this.filterValues()[columnKey];
    const currentTempFilterValue = this.temporaryFilterValues()[columnKey];

    if (currentTempFilterValue !== undefined && currentTempFilterValue !== null && currentTempFilterValue !== '') {
      this.temporaryFilterValues.update(current => ({...current, [columnKey]: undefined}));
      changed = true;
    }
    if (currentFilterValue !== undefined && currentFilterValue !== null && currentFilterValue !== '') {
      this.filterValues.update(current => ({...current, [columnKey]: undefined}));
      if (!changed) changed = true;
    }

    if (changed) {
      if (this.clientSideProcessing()) {
        this.currentPageIndexForLocalFiltering.set(0);
      }
      this.emitFilterChanged();
    }
  }

  private emitFilterChanged(): void {
    const stringFilters: Record<string, string> = {};
    const currentFilters = this.filterValues();
    let activeRemoteFilterPresent = false;

    Object.keys(currentFilters).forEach(keyStr => {
      const value = currentFilters[keyStr];
      const key = keyStr as keyof Partial<T>;
      const config = this.getColumnConfigurationForKey(key);
      const filterMode = config?.filterMode ?? 'remote';

      if (value !== undefined && value !== null && value !== '') {
        if (filterMode === 'remote') {
          activeRemoteFilterPresent = true;
          const filterValueSelector = config?.filterValueSelector;
          const filterType = config?.filterType ?? 'text';
          if (filterType === 'autocomplete' && filterValueSelector) {
            stringFilters[keyStr] = String(filterValueSelector(value));
          } else if (filterType === 'autocomplete' && typeof value === 'object') {
            stringFilters[keyStr] = String((value as any)?.id ?? value);
          } else {
            stringFilters[keyStr] = String(value);
          }
        }
      }
    });

    this.filterChanged.emit(stringFilters);
  }

  private applyLocalSort(data: T[], sort: Sort | undefined): T[] {
    if (!sort || !sort.active || sort.direction === '') {
      return data;
    }
    const dataCopy = [...data];
    dataCopy.sort((a, b) => {
      const valA = (a as any)[sort.active];
      const valB = (b as any)[sort.active];

      let comparison = 0;
      if (valA === null || valA === undefined) comparison = -1;
      if (valB === null || valB === undefined) comparison = 1;
      if (valA === null && valB === null) comparison = 0;

      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      
      return sort.direction === 'asc' ? comparison : comparison * -1;
    });
    return dataCopy;
  }

  private applyLocalFilters(data: T[], activeFilters: Record<string, any>, isClientSideContext: boolean): T[] {
    const filtersToApply = Object.entries(activeFilters).filter(([keyStr, value]) => {
      if (value === undefined || value === null || value === '') return false;
      const key = keyStr as keyof T;
      const config = this.getColumnConfigurationForKey(key);
      // When in clientSideProcessing context, all 'local' filters apply to the full list.
      // When not, 'local' filters apply to the current page's data.
      // 'remote' filters are never handled by this function.
      return (config?.filterMode ?? 'remote') === 'local';
    });

    if (filtersToApply.length === 0) {
      return data;
    }

    const filtered = data.filter(item => {
      return filtersToApply.every(([keyStr, value]) => {
        const key = keyStr as keyof T;
        const config = this.getColumnConfigurationForKey(key);
        const itemValue = (item as any)[key];

        let cellValueForFiltering: string;
        if (config?.getValue) {
          cellValueForFiltering = String(config.getValue(itemValue));
        } else if (itemValue !== undefined && itemValue !== null) {
          cellValueForFiltering = String(itemValue);
        } else {
          cellValueForFiltering = '';
        }

        let filterCriterion: any;
        if (config?.filterType === 'autocomplete' && typeof value === 'object' && value !== null) {
          if (config.filterValueSelector) {
            filterCriterion = config.filterValueSelector(value as any);
          } else if (value.hasOwnProperty('value')) {
            filterCriterion = (value as any).value;
          } else {
            filterCriterion = value;
          }
        } else {
          filterCriterion = value;
        }

        const filterText = String(filterCriterion).toLowerCase();
        return cellValueForFiltering.toLowerCase().includes(filterText);
      });
    });
    return filtered;
  }

  ngAfterViewChecked(): void {
    this.updatePaginatorWidth();
  }

  private updatePaginatorWidth(): void {
    if (this.tableElementRef && this.paginatorElementRef && this.dataPage()?.content?.length > 0) {
      const tableScrollWidth = this.tableElementRef.nativeElement.scrollWidth;
      const currentMinWidth = this.paginatorElementRef.nativeElement.style.minWidth;
      const newMinWidth = `${tableScrollWidth}px`;

      if (currentMinWidth !== newMinWidth) {
        this.renderer.setStyle(this.paginatorElementRef.nativeElement, 'min-width', newMinWidth);
      }
    } else if (this.paginatorElementRef) {
      if (this.paginatorElementRef.nativeElement.style.minWidth !== 'auto') {
          this.renderer.setStyle(this.paginatorElementRef.nativeElement, 'min-width', 'auto');
      }
    }
  }

  handlePageEvent(event: PageEvent): void {
    if (this.clientSideProcessing()) {
      this.currentPageIndexForLocalFiltering.set(event.pageIndex);
    } else {
      this.pageChange.emit(event);
    }
  }

  dispatchSortChangeEvent(sortEvent: Sort): void {
    if (this.clientSideProcessing()) {
      this.internalClientSort.set(sortEvent);
      this.currentPageIndexForLocalFiltering.set(0);
    } else {
      this.sortChanged.emit(sortEvent);
    }
  }
}
