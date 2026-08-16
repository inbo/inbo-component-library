import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSortHeader } from '@angular/material/sort';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ApiPage } from '../../../services/api/api-page.model';
import { RequestState } from '../../../services/api/request-state.enum';
import { InboDataTableColumnConfiguration } from '../column-configuration.model';
import {
  InboDataTableComponent,
  InboDatatableItem,
} from '../inbo-data-table.component';

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

  it('uses sortablePropertyName before sortable column name', () => {
    setColumns({
      id: { name: 'ID', sortable: true, sortablePropertyName: 'customId' },
    });

    expect(component.displayColumnViewModels()[0]?.sortId).toBe('customId');
  });

  it('uses the column key when sortable is true', () => {
    setColumns({ id: { name: 'ID', sortable: true } });

    expect(component.displayColumnViewModels()[0]?.sortId).toBe('id');
  });

  it('disables sorting when no sort option is configured', () => {
    setColumns({ id: { name: 'ID' } });

    expect(component.displayColumnViewModels()[0]?.sortId).toBeNull();
  });

  it('keeps public getColumnStyles rem width precedence', () => {
    setColumns({
      id: {
        name: 'ID',
        style: { width: '30%' },
        width: 120,
        widthRems: 8,
      },
    });

    expect(component.getColumnStyles('id').width).toBe('8rem');
  });

  it('sets stickyEnd on computed view models', () => {
    setColumns({
      name: { name: 'Name' },
      id: { name: 'ID', stickyEnd: true },
    });

    expect(component.displayColumnViewModels()).toEqual([
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

    expect(component.displayColumnViewModels()).toEqual([
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
