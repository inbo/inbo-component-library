import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChildren,
  effect,
  EventEmitter,
  input,
  InputSignal,
  Output,
  QueryList,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
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
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgStyle} from "@angular/common";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Observable } from 'rxjs';
import {NgInboModule} from "../../ng-inbo.module";

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
    MatProgressSpinner,
    MatPaginator,
    MatTableModule,
    MatRow,
    MatHeaderRow,
    MatHeaderCell,
    MatCell,
    MatIconButton,
    MatIcon,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    NgStyle,
    MatTable,
    MatSort,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSortModule,
    NgInboModule
  ]
})
export class InboDataTableComponent<T extends InboDatatableItem> {
  @ViewChild(MatTable, {static: false}) tableRef: MatTable<T>;
  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;

  readonly RequestState = RequestState;
  readonly DETAIL_COLUMN = 'detailColumn';
  readonly EDIT_COLUMN = 'editColumn';
  readonly DELETE_COLUMN = 'deleteColumn';

  dataPage: InputSignal<ApiPage<T>> = input.required<ApiPage<T>>();
  dataRequestState: InputSignal<RequestState> = input.required<RequestState>();
  columnConfiguration: InputSignal<InboDataTableColumnConfiguration<T>> = input.required<InboDataTableColumnConfiguration<T>>();
  customColumns: InputSignal<Array<string>> = input<Array<string>>([]);
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

  displayedColumns: Signal<Array<keyof T & string>> = computed(() => {
    const config = this.columnConfiguration();
    return config ? (Object.keys(config) as Array<keyof T & string>) : [];
  });

  hasAnyFilterableColumn: Signal<boolean> = computed(() => {
    const config = this.columnConfiguration();
    return !!config && Object.values(config).some(col => col?.filterable);
  });

  allDisplayedColumns: Signal<Array<string>> = computed(() => {
    const baseColumns = this.displayedColumns();
    const custom = this.customColumns();
    const columns = [...baseColumns, ...custom];
    if (this.editItem.observed) {
      columns.push(this.EDIT_COLUMN);
    }
    if (this.clickItem.observed) {
      columns.push(this.DETAIL_COLUMN);
    }
    if (this.deleteItem.observed) {
      columns.push(this.DELETE_COLUMN);
    }
    return columns;
  });

  constructor() {
    effect(() => {
      const table = this.tableRef;
      const defs = this.columnDefs;
      const defsLength = defs?.length;

      if (table && defs && defsLength > 0) {
        defs.forEach((columnDef) => {
          table.addColumnDef(columnDef);
        });
      }
    });
  }

  getFilterType(key: keyof Partial<T>): FilterType {
    return this.getColumnConfigurationForKey(key)?.filterType ?? 'text';
  }

  getFilterDisplayPattern(key: keyof Partial<T>): string | undefined {
    return this.getColumnConfigurationForKey(key)?.filterDisplayPattern;
  }

  getFilterSearchFunction(key: keyof Partial<T>): ((query: string) => Observable<Array<unknown>>) | undefined {
    return this.getColumnConfigurationForKey(key)?.filterSearchFunction;
  }

  getColumnConfigurationForKey<P>(
    key: keyof Partial<T>
  ): InboDataTableColumn<T[keyof T]> | undefined {
    return this.columnConfiguration()[key];
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
  }

  applyFilter(columnKey: string): void {
    const temporaryValue = this.temporaryFilterValues()[columnKey];
    if (this.filterValues()[columnKey] !== temporaryValue) {
      this.filterValues.update(current => ({...current, [columnKey]: temporaryValue}));
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

    Object.keys(currentFilters).forEach(keyStr => {
      const value = currentFilters[keyStr];
      if (value !== undefined && value !== null && value !== '') {
        const key = keyStr as keyof Partial<T>;
        const config = this.getColumnConfigurationForKey(key);
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
    });
    this.filterChanged.emit(stringFilters);
  }
}
