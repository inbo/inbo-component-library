import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, provideRouter } from '@angular/router';
import {
  applicationConfig,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { ApiPage } from '../../services/api/api-page.model';
import { RequestState } from '../../services/api/request-state.enum';
import { InboDataTableColumnConfiguration } from './column-configuration.model';
import {
  InboDatatableItem,
  InboDataTableComponent,
} from './inbo-data-table.component';
import { InboTableCellDirective } from './inbo-table-cell.directive';

interface Observation extends InboDatatableItem {
  species: string;
  location: string;
  recordedOn: string;
  validated: boolean;
}

const observations: Array<Observation> = [
  {
    species: 'Baars',
    location: 'Blankaart',
    recordedOn: '2026-03-11',
    validated: true,
  },
  {
    species: 'Blankvoorn',
    location: 'Demer',
    recordedOn: '2026-03-14',
    validated: true,
  },
  {
    species: 'Snoek',
    location: 'Zeeschelde',
    recordedOn: '2026-04-02',
    validated: false,
  },
  {
    species: 'Paling',
    location: 'IJzer',
    recordedOn: '2026-04-19',
    validated: false,
  },
  {
    species: 'Rietvoorn',
    location: 'Dijle',
    recordedOn: '2026-05-06',
    validated: true,
  },
];

function pageOf(content: Array<Observation>): ApiPage<Observation> {
  return {
    content,
    pageable: {
      empty: content.length === 0,
      first: true,
      last: true,
      pageNumber: 0,
      pageSize: 20,
      sorted: false,
      totalElements: content.length,
      totalPages: content.length === 0 ? 0 : 1,
    },
  };
}

const columnConfiguration: InboDataTableColumnConfiguration<Observation> = {
  species: { name: 'Soort', sortable: true, sortablePropertyName: 'species' },
  location: {
    name: 'Locatie',
    sortable: true,
    sortablePropertyName: 'location',
  },
  recordedOn: {
    name: 'Waargenomen op',
    sortable: true,
    sortablePropertyName: 'recordedOn',
  },
  validated: {
    name: 'Gevalideerd',
    getValue: value => (value ? 'Ja' : 'Nee'),
  },
};

@Component({
  selector: 'inbo-cell-slots-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InboDataTableComponent, InboTableCellDirective, RouterLink],
  styles: `
    a {
      color: #c2185b;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .location-extra {
      color: rgba(0, 0, 0, 0.6);
      font-size: 12px;
    }
  `,
  template: `
    <inbo-data-table
      [dataPage]="dataPage"
      [dataRequestState]="dataRequestState"
      [columnConfiguration]="columnConfiguration"
      rowHeight="48px"
      [rowClickable]="false">
      <ng-template inboTableCell="species" let-row>
        <a [routerLink]="['/soorten', row.species]">{{ row.species }}</a>
      </ng-template>
      <ng-template inboTableCell="location" let-row>
        <a [routerLink]="['/locaties', row.location]">{{ row.location }}</a>
        <div class="location-extra">{{ row.recordedOn }}</div>
      </ng-template>
    </inbo-data-table>
  `,
})
export class CellSlotsDemo {
  readonly columnConfiguration = columnConfiguration;
  readonly dataRequestState = RequestState.SUCCESS;
  readonly dataPage = pageOf(observations);
}

const meta: Meta<CellSlotsDemo> = {
  title: 'Components/Data table/Cell slots',
  component: CellSlotsDemo,
  tags: ['!autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Apps project named cells with `<ng-template inboTableCell="species" let-row>`. `$implicit` is the row so VIS can put `routerLink`, extra lines, pills, or badges in the grid. `cellTemplate` on column config is unchanged.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<CellSlotsDemo>;

export const LinkCells: Story = {};
