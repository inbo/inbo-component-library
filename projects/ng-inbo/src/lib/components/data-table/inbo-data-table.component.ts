import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {InboDataTableColumnConfiguration, InboDataTableColumn} from './column-configuration.model';
import {ApiPage} from '../../services/api/api-page.model';
import {RequestState} from '../../services/api/request-state.enum';

@Component({
  selector: 'inbo-data-table',
  templateUrl: 'inbo-data-table.component.html',
  styleUrls: ['inbo-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboDataTableComponent<T> implements OnInit {

  readonly RequestState = RequestState;
  readonly InboDataColumn! : InboDataTableColumn<T>;

  readonly DETAIL_COLUMN = 'detailColumn';
  readonly EDIT_COLUMN = 'editColumn';
  readonly DELETE_COLUMN = 'deleteColumn';

  @Input() dataPage: ApiPage<T>;
  @Input() dataRequestState: RequestState;
  @Input() columnConfiguration: InboDataTableColumnConfiguration<T>;
  @Input() sort: { property: string, direction: 'asc' | 'desc' };
  @Input() rowHeight = '48px';

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() editItem = new EventEmitter<T>();
  @Output() deleteItem = new EventEmitter<T>();
  @Output() clickItem = new EventEmitter<T>();

  displayedColumns: Array<keyof T & string>;
  allDisplayedColumns: Array<string>;

  ngOnInit(): void {
    this.displayedColumns = Object.keys(this.columnConfiguration) as Array<keyof T & string>;
    this.allDisplayedColumns = [...this.displayedColumns];
    this.editItem.observed && this.allDisplayedColumns.push(this.EDIT_COLUMN);
    this.clickItem.observed && this.allDisplayedColumns.push(this.DETAIL_COLUMN);
    this.deleteItem.observed && this.allDisplayedColumns.push(this.DELETE_COLUMN);
  }

  getColumnConfigurationForKey<P>(key: keyof Partial<T>): InboDataTableColumn<T[keyof T]> {
    return this.columnConfiguration[key];
  }
}
