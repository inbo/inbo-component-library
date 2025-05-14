import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

export type InboDataTableColumnConfiguration<T> = {
  [key in keyof Partial<T>]: InboDataTableColumn<T[key]>;
};

export enum FilterType {
  Text = 'text',
  Autocomplete = 'autocomplete',
  Boolean = 'boolean',
}

export interface InboDataTableColumn<T> {
  name: string;
  style?: Partial<CSSStyleDeclaration>;
  width?: number;
  getValue?: (propertyValue: T) => string;
  sortablePropertyName?: string;
  filterable?: boolean;
  filterType?: FilterType;
  filterPlaceholder?: string;
  filterMode?: 'local' | 'remote';
  filterSearchFunction?: (query: string) => Observable<Array<unknown>>;
  filterDisplayPattern?: (option: T) => string;
  filterValueSelector?: (option: T) => unknown;
  booleanFilterTrueLabel?: string;
  booleanFilterFalseLabel?: string;
  booleanFilterBothLabel?: string;
  cellTemplate?: TemplateRef<unknown>;
}
