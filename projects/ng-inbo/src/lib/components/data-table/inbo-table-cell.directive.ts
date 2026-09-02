import { Directive, inject, input, TemplateRef } from '@angular/core';

export interface InboTableCellContext<T> {
  $implicit: T;
}

/**
 * Marks an `ng-template` as a named cell slot for `inbo-data-table`.
 *
 * ```html
 * <inbo-data-table ...>
 *   <ng-template inboTableCell="name" let-row>
 *     <a [routerLink]="['/items', row.id]">{{ row.name }}</a>
 *   </ng-template>
 * </inbo-data-table>
 * ```
 *
 * `$implicit` is the row, not the cell value. Existing `cellTemplate` on
 * `columnConfiguration` is unchanged for Waterbirds.
 */
@Directive({
  selector: 'ng-template[inboTableCell]',
  standalone: true,
})
export class InboTableCellDirective<T> {
  readonly columnKey = input.required<string>({ alias: 'inboTableCell' });
  readonly template = inject(TemplateRef<InboTableCellContext<T>>);

  static ngTemplateContextGuard<TContext>(
    _dir: InboTableCellDirective<TContext>,
    _ctx: unknown
  ): _ctx is InboTableCellContext<TContext> {
    return true;
  }
}
