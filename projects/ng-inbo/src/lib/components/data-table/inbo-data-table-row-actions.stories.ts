import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ApiPage } from '../../services/api/api-page.model';
import { RequestState } from '../../services/api/request-state.enum';
import { InboDataTableColumnConfiguration } from './column-configuration.model';
import {
  InboDatatableItem,
  InboDataTableComponent,
} from './inbo-data-table.component';
import { InboTableActionsDirective } from './inbo-table-actions.directive';

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
  selector: 'inbo-row-actions-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InboDataTableComponent,
    InboTableActionsDirective,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <inbo-data-table
      [dataPage]="dataPage"
      [dataRequestState]="dataRequestState"
      [columnConfiguration]="columnConfiguration"
      rowHeight="48px"
      [rowClickable]="false">
      <ng-template inboTableActions let-row>
        <button
          mat-icon-button
          [matMenuTriggerFor]="menu"
          [attr.aria-label]="'Acties voor ' + row.species">
          <mat-icon class="material-icons-sharp">more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item type="button">Detail</button>
          @if (row.validated) {
            <button mat-menu-item type="button">Bewerken</button>
          }
          <button mat-menu-item type="button">Waarneming toevoegen</button>
        </mat-menu>
      </ng-template>
    </inbo-data-table>
  `,
})
export class RowActionsDemo {
  readonly columnConfiguration = columnConfiguration;
  readonly dataRequestState = RequestState.SUCCESS;
  readonly dataPage = pageOf(observations);
}

const meta: Meta<RowActionsDemo> = {
  title: 'Components/Data table/Row actions',
  component: RowActionsDemo,
  tags: ['!autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Apps project a per-row menu with `<ng-template inboTableActions let-row>`. The table owns the sticky column; VIS keeps `vis-dropdown-minimal` and role checks in the app.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<RowActionsDemo>;

export const Kebab: Story = {};
