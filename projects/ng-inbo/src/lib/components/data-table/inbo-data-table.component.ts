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
  NgZone
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

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() editItem = new EventEmitter<T>();
  @Output() deleteItem = new EventEmitter<T>();
  @Output() clickItem = new EventEmitter<T>();
  @Output() sortChanged = new EventEmitter<Sort>();
  @Output() filterChanged = new EventEmitter<Record<string, string>>();

  filterValues: WritableSignal<Record<string, any>> = signal({});
  temporaryFilterValues: WritableSignal<Record<string, any>> = signal({});

  private debouncedApplyFilters = new Subject<string>();
  filteredData: Signal<T[]>;
  autocompleteOptionStreams: WritableSignal<Record<string, Observable<any[]>>> = signal({});

  constructor(private renderer: Renderer2, private zone: NgZone) {
    this.filteredData = computed(() => {
      const currentFilters = this.filterValues();
      const originalData = this.dataPage()?.content ?? [];
      return this.computeFilteredDataBody(currentFilters, originalData);
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
      this.emitFilterChanged();
    }
  }

  clearFilter(columnKey: string): void {
    let changed = false;
    if (this.temporaryFilterValues()[columnKey] !== undefined && this.temporaryFilterValues()[columnKey] !== null && this.temporaryFilterValues()[columnKey] !== '') {
      this.temporaryFilterValues.update(current => ({...current, [columnKey]: undefined}));
      changed = true;
    }
    if (this.filterValues()[columnKey] !== undefined && this.filterValues()[columnKey] !== null && this.filterValues()[columnKey] !== '') {
      this.filterValues.update(current => ({...current, [columnKey]: undefined}));
      if (!changed) changed = true;
    }

    if (changed) {
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

  private computeFilteredDataBody(currentFilters: Record<string, any>, originalData: T[]): T[] {
    const activeLocalFilters = Object.entries(currentFilters).filter(([keyStr, value]) => {
      if (value === undefined || value === null || value === '') return false;
      const key = keyStr as keyof T;
      const config = this.getColumnConfigurationForKey(key);
      return (config?.filterMode ?? 'remote') === 'local';
    });

    if (activeLocalFilters.length === 0) {
      return originalData;
    }

    const filtered = originalData.filter(item => {
      return activeLocalFilters.every(([keyStr, value]) => {
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

        const filterText = String(value).toLowerCase();
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
}
