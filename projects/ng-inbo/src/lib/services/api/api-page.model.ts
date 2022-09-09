export interface ApiPage<T> {
  content: Array<T>;
  pageable: {
    empty: boolean;
    first: boolean;
    last: boolean;
    pageNumber: number;
    pageSize: number;
    sorted: boolean;
    totalElements: number;
    totalPages: number;
  };
}
