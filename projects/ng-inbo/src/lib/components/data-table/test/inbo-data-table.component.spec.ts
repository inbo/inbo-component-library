import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSortHeader } from '@angular/material/sort';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ApiPage } from '../../../services/api/api-page.model';
import { RequestState } from '../../../services/api/request-state.enum';
import {
  FilterMode,
  FilterType,
  InboDataTableColumnConfiguration,
} from '../column-configuration.model';
import {
  InboDataTableComponent,
  InboDataTableDensity,
  InboDatatableItem,
} from '../inbo-data-table.component';
import { InboTableActionsDirective } from '../inbo-table-actions.directive';
import { InboTableCellDirective } from '../inbo-table-cell.directive';

interface TestRow extends InboDatatableItem {
  name: string;
  id: number;
  label: string;
}

const page: ApiPage<TestRow> = {
  content: [{ name: 'First', id: 1, label: 'One' }],
  pageable: {
    empty: false,
    first: true,
    last: true,
    pageNumber: 0,
    pageSize: 5,
    sorted: false,
    totalElements: 1,
    totalPages: 1,
  },
};

describe('InboDataTableComponent column options', () => {
  let fixture: ComponentFixture<InboDataTableComponent<TestRow>>;
  let component: InboDataTableComponent<TestRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboDataTableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(InboDataTableComponent<TestRow>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataPage', page);
    fixture.componentRef.setInput('dataRequestState', RequestState.SUCCESS);
  });

  function setColumns(
    columns: InboDataTableColumnConfiguration<TestRow>
  ): void {
    fixture.componentRef.setInput('columnConfiguration', columns);
    fixture.detectChanges();
  }

  // Both members serve the component's own template, so they are protected.
  // These tests assert on them deliberately rather than through the rendered
  // DOM, which is why they reach past the modifier.
  function columnViewModels() {
    return component['displayColumnViewModels']();
  }

  function columnStyles(key: keyof TestRow) {
    return component['getColumnStyles'](key);
  }

  it('uses sortablePropertyName before sortable column name', () => {
    setColumns({
      id: { name: 'ID', sortable: true, sortablePropertyName: 'customId' },
    });

    expect(columnViewModels()[0]?.sortId).toBe('customId');
  });

  it('uses the column key when sortable is true', () => {
    setColumns({ id: { name: 'ID', sortable: true } });

    expect(columnViewModels()[0]?.sortId).toBe('id');
  });

  it('disables sorting when no sort option is configured', () => {
    setColumns({ id: { name: 'ID' } });

    expect(columnViewModels()[0]?.sortId).toBeNull();
  });

  it('keeps getColumnStyles rem width precedence', () => {
    setColumns({
      id: {
        name: 'ID',
        style: { width: '30%' },
        width: 120,
        widthRems: 8,
      },
    });

    expect(columnStyles('id').width).toBe('8rem');
  });

  it('sets stickyEnd on computed view models', () => {
    setColumns({
      name: { name: 'Name' },
      id: { name: 'ID', stickyEnd: true },
    });

    expect(columnViewModels()).toEqual([
      jasmine.objectContaining({
        key: 'name',
        stickyEnd: false,
      }),
      jasmine.objectContaining({
        key: 'id',
        stickyEnd: true,
      }),
    ]);
  });

  it('normalizes undefined configured column entries into inert view models', () => {
    const columns: InboDataTableColumnConfiguration<TestRow> = {
      id: undefined,
    };

    expect(() => setColumns(columns)).not.toThrow();

    expect(columnViewModels()).toEqual([
      jasmine.objectContaining({
        key: 'id',
        isConfigured: false,
        styles: {},
        sortId: null,
        stickyEnd: false,
        column: jasmine.objectContaining({
          name: '',
        }),
      }),
    ]);

    const headerText = (
      fixture.debugElement.query(By.css('th.mat-column-id .column-name'))
        ?.nativeElement as HTMLElement
    )?.textContent;
    const withoutWhitespace = (headerText ?? '').replace(/\s/g, '');
    expect(withoutWhitespace).toBe('');
  });

  it('binds the fallback column name to the sort header', () => {
    setColumns({ id: { name: 'ID', sortable: true } });

    const sortHeader = fixture.debugElement
      .query(By.directive(MatSortHeader))
      .injector.get(MatSortHeader);

    expect(sortHeader.id).toBe('id');
    expect(sortHeader.disabled).toBeFalse();
  });

  it('binds sortablePropertyName without sortable as an enabled sort header', () => {
    setColumns({ id: { name: 'ID', sortablePropertyName: 'customId' } });

    const sortHeader = fixture.debugElement
      .query(By.directive(MatSortHeader))
      .injector.get(MatSortHeader);

    expect(sortHeader.id).toBe('customId');
    expect(sortHeader.disabled).toBeFalse();
  });

  it('renders a disabled sort header when no sort option is configured', () => {
    setColumns({ id: { name: 'ID' } });

    const sortHeader = fixture.debugElement
      .query(By.directive(MatSortHeader))
      .injector.get(MatSortHeader);

    expect(sortHeader.disabled).toBeTrue();
  });

  it('renders sticky classes only for stickyEnd columns', async () => {
    setColumns({
      name: { name: 'Name' },
      id: { name: 'ID', stickyEnd: true },
      label: { name: 'Label', stickyEnd: true },
    });
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    fixture.detectChanges();

    for (const stickyColumn of ['id', 'label']) {
      for (const selector of [
        `th.mat-column-${stickyColumn}`,
        `td.mat-column-${stickyColumn}`,
      ]) {
        const cell = fixture.debugElement.query(By.css(selector));
        expect(cell).withContext(`${selector} should exist`).not.toBeNull();

        const element = cell!.nativeElement as HTMLElement;
        expect(element.classList.contains('mat-mdc-table-sticky'))
          .withContext(`${selector} sticky class`)
          .toBeTrue();
        expect(getComputedStyle(element).position)
          .withContext(`${selector} computed sticky position`)
          .toBe('sticky');
      }
    }

    for (const selector of ['th.mat-column-name', 'td.mat-column-name']) {
      const cell = fixture.debugElement.query(By.css(selector));
      expect(cell).withContext(`${selector} should exist`).not.toBeNull();

      const element = cell!.nativeElement as HTMLElement;
      expect(element.classList.contains('mat-mdc-table-sticky'))
        .withContext(`${selector} should not be sticky`)
        .toBeFalse();
    }
  });
});

describe('InboDataTableComponent filter restore', () => {
  let fixture: ComponentFixture<InboDataTableComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboDataTableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(InboDataTableComponent<TestRow>);
    fixture.componentRef.setInput('dataPage', page);
    fixture.componentRef.setInput('dataRequestState', RequestState.SUCCESS);
  });

  it('shows parent-provided filterValues in the column filter input', async () => {
    fixture.componentRef.setInput('columnConfiguration', {
      name: {
        name: 'Name',
        filterable: true,
        filterType: FilterType.Text,
        filterMode: FilterMode.Local,
      },
    } satisfies InboDataTableColumnConfiguration<TestRow>);
    fixture.componentRef.setInput('filterValues', { name: 'First' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('th.mat-column-name input'))
      ?.nativeElement as HTMLInputElement | undefined;

    expect(input).withContext('filter input should exist').toBeDefined();
    expect(input?.value).toBe('First');
  });

  it('does not emit filterChanged when the parent restores filterValues', async () => {
    fixture.componentRef.setInput('columnConfiguration', {
      name: {
        name: 'Name',
        filterable: true,
        filterType: FilterType.Text,
        filterMode: FilterMode.Remote,
      },
    } satisfies InboDataTableColumnConfiguration<TestRow>);

    const emitted: Array<Record<string, string>> = [];
    fixture.componentInstance.filterChanged.subscribe(value =>
      emitted.push(value)
    );

    fixture.componentRef.setInput('filterValues', { name: 'First' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([]);
  });

  it('writes an applied remote filter through the filterValues model', () => {
    fixture.componentRef.setInput('columnConfiguration', {
      name: {
        name: 'Name',
        filterable: true,
        filterType: FilterType.Text,
        filterMode: FilterMode.Remote,
      },
    } satisfies InboDataTableColumnConfiguration<TestRow>);
    fixture.detectChanges();

    const emitted: Array<Record<string, string>> = [];
    fixture.componentInstance.filterChanged.subscribe(value =>
      emitted.push(value)
    );

    fixture.componentInstance['updateTemporaryFilter']('name', 'First');
    fixture.componentInstance['applyFilter']('name');

    expect(fixture.componentInstance.filterValues()).toEqual({ name: 'First' });
    expect(emitted).toEqual([{ name: 'First' }]);
  });
});

describe('InboDataTableComponent page size', () => {
  let fixture: ComponentFixture<InboDataTableComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboDataTableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(InboDataTableComponent<TestRow>);
    fixture.componentRef.setInput('dataPage', page);
    fixture.componentRef.setInput('dataRequestState', RequestState.SUCCESS);
    fixture.componentRef.setInput('columnConfiguration', {
      name: { name: 'Name' },
    } satisfies InboDataTableColumnConfiguration<TestRow>);
  });

  it('hides the page-size selector by default', () => {
    fixture.detectChanges();

    const paginator = fixture.debugElement.query(By.css('mat-paginator'));
    expect(paginator.componentInstance.hidePageSize).toBeTrue();
  });

  it('shows the page-size selector when hidePageSize is false', () => {
    fixture.componentRef.setInput('hidePageSize', false);
    fixture.componentRef.setInput('pageSizeOptions', [20, 50, 100]);
    fixture.detectChanges();

    const paginator = fixture.debugElement.query(By.css('mat-paginator'));
    expect(paginator.componentInstance.hidePageSize).toBeFalse();
    expect(paginator.componentInstance.pageSizeOptions).toEqual([20, 50, 100]);
  });

  it('applies a paginator page-size change while clientSideProcessing is on', () => {
    fixture.componentRef.setInput('dataPage', {
      content: Array.from({ length: 10 }, (_, index) => ({
        name: `Row ${index}`,
        id: index,
        label: `${index}`,
      })),
      pageable: {
        empty: false,
        first: true,
        last: false,
        pageNumber: 0,
        pageSize: 5,
        sorted: false,
        totalElements: 10,
        totalPages: 2,
      },
    } satisfies ApiPage<TestRow>);
    fixture.componentRef.setInput('clientSideProcessing', true);
    fixture.componentRef.setInput('clientPageSize', 5);
    fixture.componentRef.setInput('hidePageSize', false);
    fixture.detectChanges();

    expect(fixture.componentInstance['dataForRender']().length).toBe(5);

    fixture.componentInstance['handlePageEvent']({
      pageIndex: 0,
      previousPageIndex: 0,
      pageSize: 10,
      length: 10,
    });

    expect(fixture.componentInstance['dataForRender']().length).toBe(10);
  });
});

describe('InboDataTableComponent row click', () => {
  let fixture: ComponentFixture<InboDataTableComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboDataTableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(InboDataTableComponent<TestRow>);
    fixture.componentRef.setInput('dataPage', page);
    fixture.componentRef.setInput('dataRequestState', RequestState.SUCCESS);
    fixture.componentRef.setInput('columnConfiguration', {
      name: { name: 'Name' },
    } satisfies InboDataTableColumnConfiguration<TestRow>);
  });

  function clickFirstRow(): Array<TestRow> {
    const emitted: Array<TestRow> = [];
    fixture.componentInstance.clickItem.subscribe(row => emitted.push(row));
    fixture.debugElement
      .query(By.css('tr[mat-row]'))
      .triggerEventHandler('click');
    return emitted;
  }

  it('emits clickItem from a row click by default', () => {
    fixture.detectChanges();
    expect(clickFirstRow()).toEqual([page.content[0]]);
  });

  it('does not emit clickItem from a row click when rowClickable is false', () => {
    fixture.componentRef.setInput('rowClickable', false);
    fixture.detectChanges();
    expect(clickFirstRow()).toEqual([]);
  });
});

describe('InboDataTableComponent density', () => {
  let fixture: ComponentFixture<InboDataTableComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboDataTableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(InboDataTableComponent<TestRow>);
    fixture.componentRef.setInput('dataPage', page);
    fixture.componentRef.setInput('dataRequestState', RequestState.SUCCESS);
    fixture.componentRef.setInput('columnConfiguration', {
      name: { name: 'Name' },
    } satisfies InboDataTableColumnConfiguration<TestRow>);
  });

  it('does not add the compact host class by default', () => {
    fixture.detectChanges();
    expect(
      fixture.nativeElement.classList.contains('inbo-table-density-compact')
    ).toBeFalse();
  });

  it('adds the compact host class when density is compact', () => {
    fixture.componentRef.setInput('density', 'compact');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.classList.contains('inbo-table-density-compact')
    ).toBeTrue();
  });

  it('marks the header compact when density is compact and no column is filterable', () => {
    fixture.componentRef.setInput('density', 'compact');
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector(
      'th.data-table-header-cell'
    ) as HTMLElement | null;
    expect(header).not.toBeNull();
    expect(header!.classList.contains('compact-header')).toBeTrue();
  });

  it('keeps a compact filter row when density is compact and a column is filterable', () => {
    fixture.componentRef.setInput('density', 'compact');
    fixture.componentRef.setInput('columnConfiguration', {
      name: {
        name: 'Name',
        filterable: true,
        filterType: FilterType.Text,
        filterMode: FilterMode.Local,
      },
    } satisfies InboDataTableColumnConfiguration<TestRow>);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector(
      'th.data-table-header-cell'
    ) as HTMLElement | null;
    expect(header).not.toBeNull();
    expect(header!.classList.contains('compact-header')).toBeFalse();
    expect(header!.classList.contains('compact-filters')).toBeTrue();
    expect(header!.querySelector('.filter-control-wrapper')).not.toBeNull();
  });
});

@Component({
  imports: [InboDataTableComponent],
  template: `
    <inbo-data-table
      [dataPage]="page"
      [dataRequestState]="state"
      [columnConfiguration]="columns"
      [density]="density">
      <form inboTableFilter>
        <input aria-label="Naam" />
      </form>
    </inbo-data-table>
  `,
})
class FilterToolbarHost {
  page = page;
  state = RequestState.SUCCESS;
  density: InboDataTableDensity = 'comfortable';
  columns: InboDataTableColumnConfiguration<TestRow> = {
    name: { name: 'Name' },
  };
}

describe('InboDataTableComponent filter toolbar', () => {
  let fixture: ComponentFixture<FilterToolbarHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterToolbarHost],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterToolbarHost);
  });

  it('renders projected inboTableFilter content above the table', () => {
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector(
      'form[inboTableFilter]'
    ) as HTMLElement | null;
    const table = fixture.nativeElement.querySelector(
      'table'
    ) as HTMLElement | null;

    expect(toolbar).withContext('toolbar should be projected').not.toBeNull();
    expect(table).withContext('table should render').not.toBeNull();
    expect(
      toolbar!.compareDocumentPosition(table!) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('keeps the filter toolbar visible while the table is loading', () => {
    fixture.componentInstance.state = RequestState.PENDING;
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('form[inboTableFilter]')
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('marks the filter toolbar compact when density is compact', () => {
    fixture.componentInstance.density = 'compact';
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector(
      '.table-filter-toolbar'
    ) as HTMLElement | null;
    expect(toolbar).not.toBeNull();
    expect(toolbar!.classList.contains('compact-toolbar')).toBeTrue();
  });
});

const actionRows: ApiPage<TestRow> = {
  content: [
    { name: 'First', id: 1, label: 'One' },
    { name: 'Second', id: 2, label: 'Two' },
  ],
  pageable: {
    empty: false,
    first: true,
    last: true,
    pageNumber: 0,
    pageSize: 5,
    sorted: false,
    totalElements: 2,
    totalPages: 1,
  },
};

@Component({
  imports: [InboDataTableComponent, InboTableActionsDirective],
  template: `
    <inbo-data-table
      [dataPage]="page"
      [dataRequestState]="state"
      [columnConfiguration]="columns"
      (clickItem)="onClick($event)">
      <ng-template inboTableActions let-row>
        <button type="button" [attr.aria-label]="'Open ' + row.name">
          Open {{ row.name }}
        </button>
      </ng-template>
    </inbo-data-table>
  `,
})
class RowActionsHost {
  page = actionRows;
  state = RequestState.SUCCESS;
  columns: InboDataTableColumnConfiguration<TestRow> = {
    name: { name: 'Name' },
  };
  clicks: Array<TestRow> = [];

  onClick(row: TestRow): void {
    this.clicks.push(row);
  }
}

describe('InboDataTableComponent row actions', () => {
  let fixture: ComponentFixture<RowActionsHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowActionsHost],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(RowActionsHost);
  });

  it('renders projected inboTableActions content for each row', () => {
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(
        'td.mat-column-actionsColumn button'
      ) as NodeListOf<HTMLElement>
    ).map(button => button.getAttribute('aria-label'));

    expect(labels).toEqual(['Open First', 'Open Second']);
  });

  it('does not emit clickItem when the actions cell is clicked', () => {
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'td.mat-column-actionsColumn button'
    ) as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button!.click();

    expect(fixture.componentInstance.clicks).toEqual([]);
  });

  it('keeps the actions column stuck to the end of the row', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenRenderingDone();
    fixture.detectChanges();

    for (const selector of [
      'th.mat-column-actionsColumn',
      'td.mat-column-actionsColumn',
    ]) {
      const cell = fixture.debugElement.query(By.css(selector));
      expect(cell).withContext(`${selector} should exist`).not.toBeNull();
      const element = cell!.nativeElement as HTMLElement;
      expect(element.classList.contains('mat-mdc-table-sticky'))
        .withContext(`${selector} sticky class`)
        .toBeTrue();
    }
  });
});

@Component({
  imports: [InboDataTableComponent],
  template: `
    <inbo-data-table
      [dataPage]="page"
      [dataRequestState]="state"
      [columnConfiguration]="columns" />
  `,
})
class NoRowActionsHost {
  page = actionRows;
  state = RequestState.SUCCESS;
  columns: InboDataTableColumnConfiguration<TestRow> = {
    name: { name: 'Name' },
  };
}

describe('InboDataTableComponent without row actions', () => {
  it('does not render an actions column', async () => {
    await TestBed.configureTestingModule({
      imports: [NoRowActionsHost],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(NoRowActionsHost);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('td.mat-column-actionsColumn')
    ).toBeNull();
  });
});

@Component({
  imports: [InboDataTableComponent, InboTableCellDirective],
  template: `
    <inbo-data-table
      [dataPage]="page"
      [dataRequestState]="state"
      [columnConfiguration]="columns"
      [rowClickable]="false">
      <ng-template inboTableCell="name" let-row>
        <a [attr.href]="'/items/' + row.id">{{ row.name }}-{{ row.id }}</a>
      </ng-template>
    </inbo-data-table>
  `,
})
class CellSlotHost {
  page = actionRows;
  state = RequestState.SUCCESS;
  columns: InboDataTableColumnConfiguration<TestRow> = {
    name: { name: 'Name' },
    label: { name: 'Label' },
  };
}

describe('InboDataTableComponent cell slots', () => {
  let fixture: ComponentFixture<CellSlotHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellSlotHost],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(CellSlotHost);
  });

  it('renders inboTableCell content for the named column with the row as context', () => {
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll(
        'td.mat-column-name a'
      ) as NodeListOf<HTMLAnchorElement>
    ).map(link => ({
      text: link.textContent?.trim(),
      href: link.getAttribute('href'),
    }));

    expect(links).toEqual([
      { text: 'First-1', href: '/items/1' },
      { text: 'Second-2', href: '/items/2' },
    ]);
  });

  it('leaves columns without a slot as plain cell text', () => {
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(
        'td.mat-column-label'
      ) as NodeListOf<HTMLElement>
    ).map(cell => cell.textContent?.trim());

    expect(labels).toEqual(['One', 'Two']);
  });
});

@Component({
  imports: [InboDataTableComponent],
  template: `
    <ng-template #labelTpl let-value let-item="item">
      <span>cell:{{ value }}:{{ item.id }}</span>
    </ng-template>
    <inbo-data-table
      [dataPage]="page"
      [dataRequestState]="state"
      [columnConfiguration]="columns" />
  `,
})
class CellTemplateHost implements OnInit {
  @ViewChild('labelTpl', { static: true })
  labelTpl!: TemplateRef<unknown>;
  page = actionRows;
  state = RequestState.SUCCESS;
  columns!: InboDataTableColumnConfiguration<TestRow>;

  ngOnInit(): void {
    this.columns = {
      name: { name: 'Name' },
      label: { name: 'Label', cellTemplate: this.labelTpl },
    };
  }
}

describe('InboDataTableComponent cellTemplate', () => {
  it('still outlets columnConfiguration.cellTemplate with the cell value', async () => {
    await TestBed.configureTestingModule({
      imports: [CellTemplateHost],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    const fixture = TestBed.createComponent(CellTemplateHost);
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(
        'td.mat-column-label span'
      ) as NodeListOf<HTMLElement>
    ).map(span => span.textContent?.trim());

    expect(labels).toEqual(['cell:One:1', 'cell:Two:2']);
  });
});
