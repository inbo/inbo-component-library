import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {
  InboDataTableColumn,
  InboDataTableColumnConfiguration,
} from './column-configuration.model';
import { ApiPage } from '../../services/api/api-page.model';
import { RequestState } from '../../services/api/request-state.enum';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { Sort } from '@angular/material/sort';

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
  standalone: false,
})
export class InboDataTableComponent<T extends InboDatatableItem>
  implements OnInit
{
  @ViewChild(MatTable, { static: false })
  set table(table: MatTable<T>) {
    if (table && this.columnDefs) {
      this.columnDefs.forEach((columnDef) => table.addColumnDef(columnDef));
      this.allDisplayedColumns = [
        ...this.displayedColumns,
        ...this.customColumns,
        ...(this.editItem.observed ? [this.EDIT_COLUMN] : []),
        ...(this.clickItem.observed ? [this.DETAIL_COLUMN] : []),
        ...(this.deleteItem.observed ? [this.DELETE_COLUMN] : []),
      ];
    }
  }

  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;

  readonly RequestState = RequestState;
  readonly DETAIL_COLUMN = 'detailColumn';
  readonly EDIT_COLUMN = 'editColumn';
  readonly DELETE_COLUMN = 'deleteColumn';

  @Input() dataPage: ApiPage<T>;
  @Input() dataRequestState: RequestState;
  @Input() columnConfiguration: InboDataTableColumnConfiguration<T>;
  @Input() customColumns: Array<string> = [];
  @Input() rowHeight = '48px';

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() editItem = new EventEmitter<T>();
  @Output() deleteItem = new EventEmitter<T>();
  @Output() clickItem = new EventEmitter<T>();
  @Output() sortChanged = new EventEmitter<Sort>();

  displayedColumns: Array<keyof T & string>;
  allDisplayedColumns: Array<string>;

  ngOnInit(): void {
    this.displayedColumns = Object.keys(this.columnConfiguration) as Array<
      keyof T & string
    >;
    this.allDisplayedColumns = [...this.displayedColumns];
    this.editItem.observed && this.allDisplayedColumns.push(this.EDIT_COLUMN);
    this.clickItem.observed &&
      this.allDisplayedColumns.push(this.DETAIL_COLUMN);
    this.deleteItem.observed &&
      this.allDisplayedColumns.push(this.DELETE_COLUMN);
  }

  getColumnConfigurationForKey<P>(
    key: keyof Partial<T>
  ): InboDataTableColumn<T[keyof T]> {
    return this.columnConfiguration[key];
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
}
