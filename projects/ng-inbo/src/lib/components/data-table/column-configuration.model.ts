import {Observable} from "rxjs";

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
  filterSearchFunction?: (query: string) => Observable<Array<T>>;
  filterDisplayPattern?: string;
  filterValueSelector?: (item: T) => string | number;
}
