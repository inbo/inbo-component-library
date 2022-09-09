import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {ColumnConfiguration} from './column-configuration.model';
import {ApiPage} from '../../services/api/api-page.model';
import {RequestState} from '../../services/api/request-state.enum';

@Component({
  selector: 'inbo-data-table',
  templateUrl: 'inbo-data-table.component.html',
  styleUrls: ['inbo-data-table.component.scss'],
})
export class InboDataTableComponent<T, F> implements OnInit {

  readonly RequestState = RequestState;

  @Input() dataPage: ApiPage<T>;
  @Input() dataRequestState: RequestState;
  @Input() columnConfiguration: ColumnConfiguration<T>;
  @Input() sort: { property: string, direction: 'asc' | 'desc' };

  @Output() pageChange = new EventEmitter<PageEvent>();

  displayedColumns: Array<keyof T & string>;

  ngOnInit(): void {
    this.displayedColumns = Object.keys(this.columnConfiguration) as Array<keyof T & string>;
  }
}
