import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { InboButtonGroupComponent } from '../button-group/inbo-button-group.component';
import { ApiPage } from '../../services/api/api-page.model';
import { RequestState } from '../../services/api/request-state.enum';
import { InboDataTableColumnConfiguration } from './column-configuration.model';
import {
  InboDatatableItem,
  InboDataTableComponent,
  InboDataTableDensity,
} from './inbo-data-table.component';

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

const locations = [
  ...new Set(observations.map(observation => observation.location)),
];

@Component({
  selector: 'inbo-filter-toolbar-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InboDataTableComponent,
    InboButtonGroupComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  styles: `
    form[inboTableFilter] {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 16px;
      padding-bottom: 16px;
      align-items: end;
    }

    form[inboTableFilter].compact {
      gap: 8px;
      padding-bottom: 8px;
      --mat-form-field-container-height: 40px;
      --mat-form-field-container-vertical-padding: 8px;
      --mat-form-field-filled-with-label-container-padding-top: 8px;
      --mat-form-field-filled-with-label-container-padding-bottom: 8px;

      button[mat-raised-button] {
        height: 40px;
      }

      /* mat-select centers its text in a 24px trigger; match it in the input */
      input.mat-mdc-input-element {
        height: 24px;
        line-height: 24px;
      }
    }
  `,
  template: `
    <inbo-data-table
      [dataPage]="dataPage()"
      [dataRequestState]="dataRequestState"
      [columnConfiguration]="columnConfiguration"
      [density]="density()"
      [rowHeight]="density() === 'compact' ? '40px' : '48px'"
      [clientSideProcessing]="false">
      <form
        inboTableFilter
        [class.compact]="density() === 'compact'"
        (ngSubmit)="apply()">
        <mat-form-field appearance="fill" subscriptSizing="dynamic">
          @if (density() !== 'compact') {
            <mat-label>Soort of locatie</mat-label>
          }
          <input
            matInput
            name="query"
            [placeholder]="density() === 'compact' ? 'Soort of locatie' : ''"
            [(ngModel)]="query" />
        </mat-form-field>
        <mat-form-field appearance="fill" subscriptSizing="dynamic">
          @if (density() !== 'compact') {
            <mat-label>Locatie</mat-label>
          }
          <mat-select
            name="location"
            [placeholder]="density() === 'compact' ? 'Locatie' : ''"
            [(ngModel)]="location">
            <mat-option [value]="null">Alle locaties</mat-option>
            @for (item of locations; track item) {
              <mat-option [value]="item">{{ item }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <inbo-button-group>
          <button mat-raised-button type="button" (click)="clear()">
            Leegmaken
          </button>
          <button mat-raised-button color="primary" type="submit">
            Zoeken
          </button>
        </inbo-button-group>
      </form>
    </inbo-data-table>
  `,
})
export class FilterToolbarDemo {
  readonly locations = locations;
  readonly columnConfiguration = columnConfiguration;
  readonly dataRequestState = RequestState.SUCCESS;
  readonly density = input<InboDataTableDensity>('comfortable');

  query = '';
  location: string | null = null;
  dataPage = signal(pageOf(observations));

  apply(): void {
    const query = this.query.trim().toLowerCase();
    const location = this.location;
    const rows = observations.filter(row => {
      const matchesQuery =
        query === '' ||
        row.species.toLowerCase().includes(query) ||
        row.location.toLowerCase().includes(query);
      const matchesLocation = location === null || row.location === location;
      return matchesQuery && matchesLocation;
    });
    this.dataPage.set(pageOf(rows));
  }

  clear(): void {
    this.query = '';
    this.location = null;
    this.dataPage.set(pageOf(observations));
  }
}

const meta: Meta<FilterToolbarDemo> = {
  title: 'Components/Data table/Filter toolbar',
  component: FilterToolbarDemo,
  tags: ['!autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Apps project a filter bar with `[inboTableFilter]`. Column `filterable` stays off — VIS and Flora compose their own controls above the grid.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<FilterToolbarDemo>;

export const FilterToolbar: Story = {};

export const Compact: Story = {
  args: {
    density: 'compact',
  },
};
