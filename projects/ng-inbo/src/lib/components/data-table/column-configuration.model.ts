export type InboDataTableColumnConfiguration<T> = {
  [key in keyof Partial<T>]: InboDataTableColumn<T[key]>;
}

export interface InboDataTableColumn<P> {
  name: string,
  style?: Partial<CSSStyleDeclaration>;
  getValue?: (propValue: P) => string;
}
