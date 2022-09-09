export enum RequestState {
  DEFAULT = 'DEFAULT',
  PENDING = 'PENDING',
  // ⬇ This state is needed to be able to make the difference between first page load and loading in between filtering / sorting / changing pages
  PARTIAL_PENDING = 'PARTIAL_PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  EMPTY = 'EMPTY',
}
