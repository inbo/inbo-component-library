import {Observable} from "rxjs";
import { SortDirection } from '@angular/material/sort';
import { TemplateRef } from '@angular/core';

export type InboDataTableColumnConfiguration<T> = {
  [key in keyof Partial<T>]: InboDataTableColumn<T[key]>;
};

export type FilterType = 'text' | 'autocomplete';

export interface InboDataTableColumn<T> {
  name: string;
  style?: Partial<CSSStyleDeclaration>;
  getValue?: (propertyValue: T) => string;
  sortablePropertyName?: string;
  filterable?: boolean;
  filterType?: FilterType;
  filterSearchFunction?: (query: string) => Observable<Array<unknown>>;
  filterDisplayPattern?: (option: T) => string;
  filterValueSelector?: (option: T) => unknown;
  cellTemplate?: TemplateRef<unknown>;
}
