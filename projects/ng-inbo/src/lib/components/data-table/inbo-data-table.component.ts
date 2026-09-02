import { AsyncPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  input,
  InputSignal,
  NgZone,
  Output,
  Renderer2,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
  inject,
  model,
  linkedSignal,
  contentChild,
  contentChildren,
  TemplateRef,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';
import { ApiPage } from '../../services/api/api-page.model';
import { RequestState } from '../../services/api/request-state.enum';
import {
  FilterMode,
  FilterType,
  InboDataTableColumn,
  InboDataTableColumnConfiguration,
} from './column-configuration.model';
import { InboTableActionsDirective } from './inbo-table-actions.directive';
import { InboTableCellDirective } from './inbo-table-cell.directive';

export interface InboDatatableItem {
  isViewButtonDisabled?: boolean;
  isDeleteButtonDisabled?: boolean;
  isEditButtonDisabled?: boolean;
}

export type InboDataTableDensity = 'comfortable' | 'compact';

interface InboDataTableDisplayColumnViewModel<T extends InboDatatableItem> {
  key: keyof T & string;
  column: InboDataTableColumn<T[keyof T]>;
  isConfigured: boolean;
  styles: Partial<CSSStyleDeclaration>;
  sortId: string | null;
  stickyEnd: boolean;
  projectedCellTemplate?: TemplateRef<{ $implicit: T }>;
}

/**
 * Paged table with per-column sorting and filtering, built on Angular Material.
 *
 * Columns come from `columnConfiguration` rather than template markup, so a
 * consumer describes the table as data. It works in two modes: by default it
 * renders whatever page it is handed and reports user intent through
 * `pageChange`, `sortChanged` and `filterChanged` for the parent to act on,
 * while `clientSideProcessing` makes it sort, filter and paginate the supplied
 * rows itself.
 *
 * The row action columns are opt-in: each appears only when its output is
 * subscribed to. Row clicks emit `clickItem` unless `rowClickable` is false.
 * Bind `[(filterValues)]` to restore header filters from a URL. The page-size
 * selector stays hidden unless `hidePageSize` is false.
 *
 * Project a filter bar with `[inboTableFilter]` — the Flora / VIS pattern of
 * controls above the grid, not in column headers. Column `filterable` stays
 * available for Waterbirds-style header filters.
 *
 * Project a per-row actions column with `<ng-template inboTableActions let-row>`.
 * Import `InboTableActionsDirective` next to the table (standalone has no
 * `exports`). The library renders a sticky-end column; the app owns the menu
 * (VIS kebab, links, role checks). The edit / delete / eye columns stay
 * opt-in via their outputs for Flora and Waterbirds.
 *
 * Project a named cell with `<ng-template inboTableCell="name" let-row>` —
 * VIS in-grid links, pills, and composite cells. Import
 * `InboTableCellDirective` next to the table. `columnConfiguration.cellTemplate`
 * stays for Waterbirds. Set `density="compact"` for VIS-tight chrome;
 * Flora and Waterbirds keep `'comfortable'`.
 */
@Component({
  selector: 'inbo-data-table',
  templateUrl: 'inbo-data-table.component.html',
  styleUrls: ['inbo-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  host: {
    '[class.inbo-table-density-compact]': 'density() === "compact"',
  },
  imports: [
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    NgStyle,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatSortModule,
    MatAutocompleteModule,
    NgTemplateOutlet,
    AsyncPipe,
    InboTableActionsDirective,
    InboTableCellDirective,
  ],
})
export class InboDataTableComponent<T extends InboDatatableItem>
  implements AfterViewChecked
{
  private renderer = inject(Renderer2);
  private zone = inject(NgZone);

  @ViewChild(MatTable, { static: false }) protected tableRef: MatTable<T>;
  @ViewChild(MatTable, { static: false, read: ElementRef })
  protected tableElementRef: ElementRef<HTMLTableElement>;
  @ViewChild(MatPaginator, { static: false, read: ElementRef })
  protected paginatorElementRef: ElementRef<HTMLElement>;

  protected readonly RequestState = RequestState;
  protected readonly DETAIL_COLUMN = 'detailColumn';
  protected readonly EDIT_COLUMN = 'editColumn';
  protected readonly DELETE_COLUMN = 'deleteColumn';
  protected readonly ACTIONS_COLUMN = 'actionsColumn';

  protected readonly actionsTemplate = contentChild(InboTableActionsDirective, {
    read: TemplateRef,
  });
  protected readonly projectedCells = contentChildren(InboTableCellDirective);

  /**
   * The page of rows to render, along with the paging metadata the paginator
   * needs. In server-side mode the `pageable` totals drive the paginator; in
   * client-side mode only `content` is used.
   */
  dataPage: InputSignal<ApiPage<T>> = input.required<ApiPage<T>>();
  /**
   * Drives what the table shows instead of rows: a spinner while `PENDING`, a
   * placeholder for `EMPTY`, and a message for `ERROR`.
   */
  dataRequestState: InputSignal<RequestState> = input.required<RequestState>();
  /**
   * Maps properties of `T` to the columns to render. Only the properties
   * present here become columns, in the order they are declared, and each
   * entry controls that column's header, sorting, filtering and cell rendering.
   */
  columnConfiguration: InputSignal<InboDataTableColumnConfiguration<T>> =
    input.required<InboDataTableColumnConfiguration<T>>();
  /** CSS height applied to every body row. */
  rowHeight: InputSignal<string> = input('48px');
  /**
   * The sort to apply. In server-side mode this is the active sort and the
   * parent is expected to keep it in sync with `sortChanged`; in client-side
   * mode it only seeds the initial sort, which the table then owns.
   */
  sort: InputSignal<Sort | undefined> = input<Sort | undefined>(undefined);
  /**
   * Sort, filter and paginate within the component over `dataPage.content`
   * rather than delegating to the parent. When enabled, `pageChange` and
   * `sortChanged` no longer emit because the table handles both itself.
   */
  clientSideProcessing: InputSignal<boolean> = input(false);
  /** Rows per page while `clientSideProcessing` is enabled. Defaults to 5. */
  clientPageSize: InputSignal<number | undefined> = input(undefined);
  /**
   * The active filter values, keyed by column. Bind two-way (`[(filterValues)]`)
   * so a parent can restore filters from a URL and keep them in sync as the
   * user edits. Parent writes update the header inputs without emitting
   * `filterChanged`; user apply/clear still emit that output for remote
   * filters, unchanged.
   */
  filterValues = model<Record<string, unknown>>({});
  /**
   * When true (the default), the paginator hides its page-size selector so
   * Flora and Waterbirds keep their current layout. VIS sets this to false
   * and passes `pageSizeOptions`.
   */
  hidePageSize = input(true);
  /** Options shown in the paginator's page-size selector. */
  pageSizeOptions = input<Array<number>>([5, 10, 20, 50, 100]);
  /**
   * When true (the default), clicking a row emits `clickItem`. VIS sets this
   * to false so cells can hold real links without the row click stealing them.
   * The eye button still appears when `clickItem` is subscribed.
   */
  rowClickable = input(true);
  /**
   * Spacing of the grid chrome. `'comfortable'` is the current Flora /
   * Waterbirds density. VIS sets `'compact'` for a tighter header, filter
   * row, filter toolbar, paginator and action columns. `rowHeight` stays a
   * separate knob.
   */
  density = input<InboDataTableDensity>('comfortable');

  /**
   * The user moved to another page or changed the page size. Not emitted while
   * `clientSideProcessing` is enabled.
   */
  @Output() pageChange = new EventEmitter<PageEvent>();
  /**
   * The user pressed the edit action on a row. Subscribing to this is what
   * makes the edit column appear.
   */
  @Output() editItem = new EventEmitter<T>();
  /**
   * The user pressed the delete action on a row. Subscribing to this is what
   * makes the delete column appear.
   */
  @Output() deleteItem = new EventEmitter<T>();
  /**
   * The user pressed the detail action on a row. Subscribing to this is what
   * makes the detail column appear.
   */
  @Output() clickItem = new EventEmitter<T>();
  /**
   * The user changed the sort column or direction. Not emitted while
   * `clientSideProcessing` is enabled.
   */
  @Output() sortChanged = new EventEmitter<Sort>();
  /**
   * The active filter values, keyed by column, for columns configured with
   * `FilterMode.Remote` only. Values are stringified so they can be passed
   * straight to a query. Columns using `FilterMode.Local` are applied in the
   * component and never reported here.
   */
  @Output() filterChanged = new EventEmitter<Record<string, string>>();

  protected temporaryFilterValues = linkedSignal<Record<string, unknown>>(
    () => ({
      ...this.filterValues(),
    })
  );

  private internalClientSort: WritableSignal<Sort | undefined> =
    signal(undefined);
  private currentPageIndexForLocalFiltering: WritableSignal<number> = signal(0);
  private clientPageSizeOverride: WritableSignal<number | undefined> =
    signal(undefined);

  private debouncedApplyFilters = new Subject<string>();
  protected autocompleteOptionStreams: WritableSignal<
    Record<string, Observable<Array<unknown>>>
  > = signal({});

  protected readonly DEFAULT_CLIENT_PAGE_SIZE = 5;

  protected effectivePageSizeForDisplay: Signal<number> = computed(() => {
    if (this.clientSideProcessing()) {
      return (
        this.clientPageSizeOverride() ??
        this.clientPageSize() ??
        this.DEFAULT_CLIENT_PAGE_SIZE
      );
    }
    return this.dataPage()?.pageable.pageSize ?? this.DEFAULT_CLIENT_PAGE_SIZE;
  });

  protected activeSortConfigurationForTable: Signal<Sort | undefined> =
    computed(() => {
      return this.clientSideProcessing()
        ? this.internalClientSort()
        : this.sort();
    });

  private processedDataMasterList: Signal<Array<T>> = computed(() => {
    const pageContent = this.dataPage()?.content ?? [];
    let dataToProcess: Array<T> = [...pageContent];

    if (this.clientSideProcessing()) {
      dataToProcess = this.applyLocalSort(
        dataToProcess,
        this.internalClientSort()
      );
      dataToProcess = this.applyLocalFilters(
        dataToProcess,
        this.filterValues()
      );
    } else {
      dataToProcess = this.applyLocalFilters(
        dataToProcess,
        this.filterValues()
      );
    }
    return dataToProcess;
  });

  protected dataForRender: Signal<Array<T>> = computed(() => {
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

  protected paginatorLength: Signal<number> = computed(() => {
    if (this.clientSideProcessing()) {
      return this.processedDataMasterList().length;
    } else {
      if (this.isAnyLocalFilterActive()) {
        return this.processedDataMasterList().length;
      }
      return this.dataPage()?.pageable?.totalElements ?? 0;
    }
  });

  protected paginatorPageIndex: Signal<number> = computed(() => {
    if (this.clientSideProcessing()) {
      return this.currentPageIndexForLocalFiltering();
    } else {
      if (this.isAnyLocalFilterActive()) {
        return 0;
      }
      return this.dataPage()?.pageable?.pageNumber ?? 0;
    }
  });

  protected isAnyLocalFilterActive: Signal<boolean> = computed(() => {
    const filters = this.filterValues();
    const colConfig = this.columnConfiguration();
    if (!filters || !colConfig) {
      return false;
    }
    return Object.keys(filters).some(key => {
      const filterValue = filters[key];
      if (
        filterValue === undefined ||
        filterValue === null ||
        (typeof filterValue === 'string' && filterValue.trim() === '')
      ) {
        return false;
      }
      const config = colConfig[key as keyof T];
      return config?.filterMode === FilterMode.Local;
    });
  });

  constructor() {
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
      this.clientSideProcessing();
      this.clientPageSize();
      this.clientPageSizeOverride.set(undefined);
    });

    effect(() => {
      // Effect to reset local pagination if data source changes during client-side processing
      this.dataPage(); // Depend on dataPage
      if (this.clientSideProcessing()) {
        this.currentPageIndexForLocalFiltering.set(0);
      }
    });

    this.debouncedApplyFilters.pipe(debounceTime(300)).subscribe(columnKey => {
      this.zone.run(() => {
        this.applyFilter(columnKey);
      });
    });
  }

  protected displayedColumns: Signal<Array<keyof T & string>> = computed(() => {
    return this.displayColumnViewModels().map(column => column.key);
  });

  protected displayColumnViewModels: Signal<
    Array<InboDataTableDisplayColumnViewModel<T>>
  > = computed(() => {
    const config = this.columnConfiguration();
    if (!config) {
      return [];
    }

    const projectedByKey = new Map(
      this.projectedCells().map(cell => [cell.columnKey(), cell.template])
    );

    return (
      Object.entries(config) as Array<
        [keyof T & string, InboDataTableColumn<T[keyof T]> | undefined]
      >
    ).map(([key, column]) => {
      const isConfigured = column !== undefined;
      const safeColumn: InboDataTableColumn<T[keyof T]> = column ?? {
        name: '',
      };
      const styles: Partial<CSSStyleDeclaration> = { ...safeColumn.style };
      if (safeColumn.width !== undefined) {
        styles.width = `${safeColumn.width}px`;
      }
      if (safeColumn.widthRems !== undefined) {
        styles.width = `${safeColumn.widthRems}rem`;
      }

      let sortId: string | null = null;
      if (safeColumn.sortablePropertyName) {
        sortId = safeColumn.sortablePropertyName;
      } else if (safeColumn.sortable) {
        sortId = String(key);
      }

      return {
        key,
        column: safeColumn,
        isConfigured,
        styles,
        sortId,
        stickyEnd: safeColumn.stickyEnd ?? false,
        projectedCellTemplate: projectedByKey.get(key),
      };
    });
  });

  protected hasAnyFilterableColumn: Signal<boolean> = computed(() => {
    const config = this.columnConfiguration();
    return !!config && Object.values(config).some(col => col?.filterable);
  });

  protected allDisplayedColumns: Signal<Array<string>> = computed(() => {
    const configColumns = this.displayedColumns();

    const actionColumns: Array<string> = [];
    if (this.editItem.observed) {
      actionColumns.push(this.EDIT_COLUMN);
    }
    if (this.clickItem.observed) {
      actionColumns.push(this.DETAIL_COLUMN);
    }
    if (this.deleteItem.observed) {
      actionColumns.push(this.DELETE_COLUMN);
    }
    if (this.actionsTemplate()) {
      actionColumns.push(this.ACTIONS_COLUMN);
    }
    return [...configColumns, ...actionColumns];
  });

  protected getColumnStyles(
    key: keyof Partial<T>
  ): Partial<CSSStyleDeclaration> {
    return (
      this.displayColumnViewModels().find(column => column.key === key)
        ?.styles ?? {}
    );
  }

  protected getFilterType(key: keyof Partial<T>): FilterType | undefined {
    return this.getColumnConfigurationForKey(key)?.filterType;
  }

  protected getFilterDisplayPattern(
    key: keyof Partial<T>
  ): ((option: unknown) => string) | undefined {
    const config = this.getColumnConfigurationForKey(key);
    if (config?.filterDisplayPattern) {
      return config.filterDisplayPattern as (option: unknown) => string;
    }
    return undefined;
  }

  protected getFilterSearchFunction(
    key: keyof Partial<T>
  ): ((query: string) => Observable<Array<unknown>>) | undefined {
    return this.getColumnConfigurationForKey(key)?.filterSearchFunction;
  }

  protected getFilterPlaceholder(key: keyof Partial<T>): string | undefined {
    return this.getColumnConfigurationForKey(key)?.filterPlaceholder;
  }

  protected getBooleanFilterTrueLabel(key: keyof Partial<T>): string {
    return (
      this.getColumnConfigurationForKey(key)?.booleanFilterTrueLabel ?? 'Yes'
    );
  }

  protected getBooleanFilterFalseLabel(key: keyof Partial<T>): string {
    return (
      this.getColumnConfigurationForKey(key)?.booleanFilterFalseLabel ?? 'No'
    );
  }

  protected getBooleanFilterBothLabel(key: keyof Partial<T>): string {
    return (
      this.getColumnConfigurationForKey(key)?.booleanFilterBothLabel ?? 'Both'
    );
  }

  protected getColumnConfigurationForKey(
    key: keyof Partial<T>
  ): InboDataTableColumn<T[keyof T]> | undefined {
    return this.columnConfiguration()[key];
  }

  protected onAutocompleteFocus(columnKey: string): void {
    const searchFn = this.getFilterSearchFunction(columnKey as keyof T);
    if (searchFn) {
      const currentVal = this.temporaryFilterValues()[columnKey];
      const query = typeof currentVal === 'string' ? currentVal : '';
      this.autocompleteOptionStreams.update(streams => ({
        ...streams,
        [columnKey]: searchFn(query).pipe(
          catchError(err => {
            console.error(
              "Error fetching autocomplete options on focus for query '" +
                query +
                "':",
              err
            );
            return of([]);
          })
        ),
      }));
    }
  }

  protected onAutocompleteInputTextChanged(
    columnKey: string,
    event: Event
  ): void {
    const value = (event.target as HTMLInputElement)?.value;
    const searchFn = this.getFilterSearchFunction(columnKey as keyof T);

    if (searchFn) {
      const query = typeof value === 'string' ? value : ''; // Ensure query is a string
      this.autocompleteOptionStreams.update(streams => ({
        ...streams,
        [columnKey]: searchFn(query).pipe(
          catchError(err => {
            console.error(
              "Error fetching autocomplete options for query '" + query + "':",
              err
            );
            return of([]);
          })
        ),
      }));
    } else {
      this.autocompleteOptionStreams.update(streams => {
        const newStreams = { ...streams };
        delete newStreams[columnKey]; // Clears the stream for this column
        return newStreams;
      });
    }
  }

  protected getOptionDisplayText(
    columnKey: keyof Partial<T>,
    option: unknown
  ): string {
    const displayFn = this.getFilterDisplayPattern(columnKey);
    if (displayFn) {
      return displayFn(option);
    }
    return option ? String(option) : '';
  }

  protected onEditItemClick(event: MouseEvent, dataItem: T): void {
    if (dataItem.isEditButtonDisabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.editItem.emit(dataItem);
  }

  protected onDeleteItemClick(event: MouseEvent, dataItem: T): void {
    if (dataItem.isDeleteButtonDisabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.deleteItem.emit(dataItem);
  }

  protected onViewItemClick(event: MouseEvent, dataItem: T): void {
    if (dataItem.isViewButtonDisabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.clickItem.emit(dataItem);
  }

  protected onRowClick(dataItem: T): void {
    if (this.rowClickable()) {
      this.clickItem.emit(dataItem);
    }
  }

  protected updateTemporaryFilter(columnKey: string, value: unknown): void {
    this.temporaryFilterValues.update(current => ({
      ...current,
      [columnKey]: value,
    }));
    const config = this.getColumnConfigurationForKey(columnKey as keyof T);
    if (
      config?.filterMode === FilterMode.Local &&
      (config?.filterType === FilterType.Text || !config?.filterType)
    ) {
      this.debouncedApplyFilters.next(columnKey);
    }
  }

  protected applyFilter(columnKey: string): void {
    let temporaryValue = this.temporaryFilterValues()[columnKey];

    if (temporaryValue === '' || temporaryValue === null) {
      temporaryValue = undefined;
    }

    const currentActiveValue = this.filterValues()[columnKey];

    if (currentActiveValue !== temporaryValue) {
      this.filterValues.update(current => {
        const newValues = { ...current };
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

  protected clearFilter(columnKey: string): void {
    const config = this.getColumnConfigurationForKey(columnKey as keyof T);
    const clearValue: null | undefined =
      config?.filterType === FilterType.Boolean ? null : undefined;
    let needsEmit = false;

    // Clear temporary filter value if it's not already cleared
    if (this.temporaryFilterValues()[columnKey] !== clearValue) {
      this.temporaryFilterValues.update(current => {
        const newValues = { ...current };
        if (clearValue === null) {
          // Specifically for boolean 'Both'
          newValues[columnKey] = null;
        } else {
          // For text/autocomplete, or if boolean clear value was undefined (shouldn't happen with current logic)
          delete newValues[columnKey];
        }
        return newValues;
      });
      // A change in temporary value doesn't trigger emit directly but might affect button states.
    }

    // Clear active filter value if it's not already effectively cleared
    const currentActiveFilter = this.filterValues()[columnKey];
    const isActiveFilterConsideredSet =
      (config?.filterType === FilterType.Boolean &&
        currentActiveFilter !== null) ||
      (config?.filterType !== FilterType.Boolean &&
        currentActiveFilter !== undefined &&
        currentActiveFilter !== '');

    if (isActiveFilterConsideredSet) {
      this.filterValues.update(current => {
        const newValues = { ...current };
        if (config?.filterType === FilterType.Boolean) {
          newValues[columnKey] = null; // Set to 'Both'
        } else {
          delete newValues[columnKey]; // Remove for other types
        }
        return newValues;
      });
      needsEmit = true;
    }

    if (needsEmit) {
      if (this.clientSideProcessing()) {
        this.currentPageIndexForLocalFiltering.set(0);
      }
      this.emitFilterChanged();
    }
  }

  private emitFilterChanged(): void {
    const stringFilters: Record<string, string> = {};
    const currentFilters = this.filterValues();

    Object.keys(currentFilters).forEach(keyStr => {
      const value = currentFilters[keyStr];
      const key = keyStr as keyof Partial<T>;
      const config = this.getColumnConfigurationForKey(key);
      const filterMode = config?.filterMode ?? FilterMode.Remote;
      const filterType = config?.filterType ?? FilterType.Text;

      const isActiveRemoteFilter =
        filterType === FilterType.Boolean
          ? value === true || value === false
          : value !== undefined && value !== null && value !== '';

      if (isActiveRemoteFilter) {
        if (filterMode === FilterMode.Remote) {
          const filterValueSelector = config?.filterValueSelector;

          if (filterType === FilterType.Boolean) {
            if (value === true) {
              stringFilters[keyStr] = 'true';
            } else if (value === false) {
              stringFilters[keyStr] = 'false';
            }
            // If value is null (Both), isActiveRemoteFilter would be false
          } else if (
            filterType === FilterType.Autocomplete &&
            filterValueSelector
          ) {
            stringFilters[keyStr] = String(
              filterValueSelector(value as T[keyof T])
            );
          } else if (
            filterType === FilterType.Autocomplete &&
            typeof value === 'object' &&
            value !== null &&
            'id' in value
          ) {
            stringFilters[keyStr] = String(
              (value as { id: unknown })?.id ?? value
            );
          } else {
            stringFilters[keyStr] = String(value);
          }
        }
      }
    });

    this.filterChanged.emit(stringFilters);
  }

  private applyLocalSort(data: Array<T>, sort: Sort | undefined): Array<T> {
    if (!sort || !sort.active || sort.direction === '') {
      return data;
    }
    const dataCopy = [...data];
    dataCopy.sort((a, b) => {
      const valA = a[sort.active as keyof T];
      const valB = b[sort.active as keyof T];

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

  private applyLocalFilters(
    data: Array<T>,
    activeFilters: Record<string, unknown>
  ): Array<T> {
    const filtersToApply = Object.entries(activeFilters).filter(
      ([keyStr, value]) => {
        if (value === undefined || value === null || value === '') return false;
        const key = keyStr as keyof T;
        const config = this.getColumnConfigurationForKey(key);
        // When in clientSideProcessing context, all 'local' filters apply to the full list.
        // When not, 'local' filters apply to the current page's data.
        // 'remote' filters are never handled by this function.
        return (config?.filterMode ?? FilterMode.Remote) === FilterMode.Local;
      }
    );

    if (filtersToApply.length === 0) {
      return data;
    }

    const filtered = data.filter(item => {
      return filtersToApply.every(([keyStr, value]) => {
        const key = keyStr as keyof T;
        const config = this.getColumnConfigurationForKey(key);
        const itemValue = item[key];

        if (config?.filterType === FilterType.Boolean) {
          if (value === null || value === undefined) {
            // 'Both' or unselected
            return true; // No filter applied for this column
          }
          // Ensure itemValue is treated as a boolean for comparison
          const actualItemBooleanValue =
            typeof itemValue === 'string'
              ? itemValue.toLowerCase() === 'true'
              : !!itemValue;
          return actualItemBooleanValue === value;
        }

        let cellValueForFiltering: string;
        if (config?.getValue) {
          cellValueForFiltering = String(config.getValue(itemValue));
        } else if (itemValue !== undefined && itemValue !== null) {
          cellValueForFiltering = String(itemValue);
        } else {
          cellValueForFiltering = '';
        }

        let filterCriterion: unknown;
        if (
          config?.filterType === FilterType.Autocomplete &&
          typeof value === 'object' &&
          value !== null
        ) {
          if (config.filterValueSelector) {
            filterCriterion = config.filterValueSelector(value as T[keyof T]);
          } else if (
            typeof value === 'object' &&
            value !== null &&
            'value' in value
          ) {
            filterCriterion = (value as { value: unknown }).value;
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
    if (
      this.tableElementRef &&
      this.paginatorElementRef &&
      this.dataPage()?.content?.length > 0
    ) {
      const tableScrollWidth = this.tableElementRef.nativeElement.scrollWidth;
      const currentMinWidth =
        this.paginatorElementRef.nativeElement.style.minWidth;
      const newMinWidth = `${tableScrollWidth}px`;

      if (currentMinWidth !== newMinWidth) {
        this.renderer.setStyle(
          this.paginatorElementRef.nativeElement,
          'min-width',
          newMinWidth
        );
      }
    } else if (this.paginatorElementRef) {
      if (this.paginatorElementRef.nativeElement.style.minWidth !== 'auto') {
        this.renderer.setStyle(
          this.paginatorElementRef.nativeElement,
          'min-width',
          'auto'
        );
      }
    }
  }

  protected handlePageEvent(event: PageEvent): void {
    if (this.clientSideProcessing()) {
      this.currentPageIndexForLocalFiltering.set(event.pageIndex);
      this.clientPageSizeOverride.set(event.pageSize);
    } else {
      this.pageChange.emit(event);
    }
  }

  protected dispatchSortChangeEvent(sortEvent: Sort): void {
    if (this.clientSideProcessing()) {
      this.internalClientSort.set(sortEvent);
      this.currentPageIndexForLocalFiltering.set(0);
    } else {
      this.sortChanged.emit(sortEvent);
    }
  }
}
