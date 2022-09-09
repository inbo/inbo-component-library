export type ColumnConfiguration<T> = {
  [key in keyof Partial<T>]: {
    sort?: 'asc' | 'desc',
    sortable: boolean,
    name: string
  };
}
