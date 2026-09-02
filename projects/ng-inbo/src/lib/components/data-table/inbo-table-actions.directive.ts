import { Directive, inject, TemplateRef } from '@angular/core';

export interface InboTableActionsContext<T> {
  $implicit: T;
}

/**
 * Marks an `ng-template` as the per-row actions slot for `inbo-data-table`.
 *
 * ```html
 * <inbo-data-table ...>
 *   <ng-template inboTableActions let-row>
 *     <!-- app-owned menu; row is typed as the table's item -->
 *   </ng-template>
 * </inbo-data-table>
 * ```
 */
@Directive({
  selector: 'ng-template[inboTableActions]',
  standalone: true,
})
export class InboTableActionsDirective<T> {
  readonly template = inject(TemplateRef<InboTableActionsContext<T>>);

  static ngTemplateContextGuard<TContext>(
    _dir: InboTableActionsDirective<TContext>,
    _ctx: unknown
  ): _ctx is InboTableActionsContext<TContext> {
    return true;
  }
}
