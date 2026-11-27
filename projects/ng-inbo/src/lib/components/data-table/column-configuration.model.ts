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

export enum FilterMode {
  Local = 'local',
  Remote = 'remote',
}

export interface InboDataTableColumn<T> {
  name: string;
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Minimum width in pixels. The column grows into free space and clips to one
   * line. Columns without a width stay as wide as their text.
   */
  width?: number;
  /** Minimum width in rem. Same behavior as `width`, which it overrides. */
  widthRems?: number;
  /**
   * Maximum width in rem. The column clips and does not grow past this, so one
   * long token does not take the space a flexible column needs.
   */
  maxWidthRems?: number;
  sortable?: boolean;
  stickyEnd?: boolean;
  getValue?: (propertyValue: T) => string;
  sortablePropertyName?: string;
  filterable?: boolean;
  filterType?: FilterType;
  filterPlaceholder?: string;
  filterMode?: FilterMode;
  filterSearchFunction?: (query: string) => Observable<Array<unknown>>;
  filterDisplayPattern?: (option: T) => string;
  filterValueSelector?: (option: T) => unknown;
  booleanFilterTrueLabel?: string;
  booleanFilterFalseLabel?: string;
  booleanFilterBothLabel?: string;
  cellTemplate?: TemplateRef<unknown>;
}
