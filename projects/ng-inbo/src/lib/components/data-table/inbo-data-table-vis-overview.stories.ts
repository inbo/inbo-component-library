import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ApiPage } from '../../services/api/api-page.model';
import { RequestState } from '../../services/api/request-state.enum';
import { InboDataTableColumnConfiguration } from './column-configuration.model';
import {
  InboDatatableItem,
  InboDataTableComponent,
} from './inbo-data-table.component';
import { InboTableActionsDirective } from './inbo-table-actions.directive';
import { InboTableCellDirective } from './inbo-table-cell.directive';

interface Project extends InboDatatableItem {
  name: string;
  code: string;
  team: string;
  status: 'Actief' | 'Afgesloten';
  period: string;
}

const projects: Array<Project> = [
  {
    name: 'Afvissingen Agentschap voor Natuur en Bos',
    code: 'ANB',
    team: 'ANB/VERG',
    status: 'Actief',
    period: '01/01/2000',
  },
  {
    name: 'Afvissingen AquaTerra-Kuiperburger',
    code: 'ATKB',
    team: 'ANB/VERG',
    status: 'Actief',
    period: '01/01/2019',
  },
  {
    name: 'Afvissingen AquaTerra-Kuiperburger',
    code: 'ANB-ATKB',
    team: 'ANB/VERG',
    status: 'Actief',
    period: '01/01/2000',
  },
  {
    name: 'Afvissingen Hogeschool PXL-Universiteit Hasselt',
    code: 'PXL-UHasselt',
    team: 'ANB/VERG',
    status: 'Actief',
    period: '01/01/2000',
  },
  {
    name: 'Afvissingen Instituut voor Landbouw- en Visserijonderzoek',
    code: 'ILVO',
    team: 'ANB/VERG',
    status: 'Actief',
    period: '01/01/2000',
  },
  {
    name: 'Afvissingen Katholieke Universiteit Leuven',
    code: 'KULEUVEN',
    team: 'ANB/VERG',
    status: 'Afgesloten',
    period: '01/01/2000',
  },
];

function pageOf(content: Array<Project>): ApiPage<Project> {
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

const columnConfiguration: InboDataTableColumnConfiguration<Project> = {
  name: {
    name: 'Naam',
    sortable: true,
    sortablePropertyName: 'name',
    widthRems: 14,
  },
  code: { name: 'Projectcode', sortable: true, sortablePropertyName: 'code' },
  team: { name: 'Team' },
  status: { name: 'Status' },
  period: { name: 'Periode', sortable: true, sortablePropertyName: 'period' },
};

@Component({
  selector: 'inbo-vis-overview-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InboDataTableComponent,
    InboTableActionsDirective,
    InboTableCellDirective,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  styles: `
    :host {
      display: block;
      padding: 16px 24px;
      background: #fafafa;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);

      h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    }

    .card {
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    inbo-data-table {
      --inbo-table-stripe-color: #f7f8fa;
    }

    /* Filters live in their own card above the table, not projected into it. */
    form.filters {
      display: grid;
      grid-template-columns: 2fr 2fr 2fr 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 16px;
      margin-bottom: 16px;
      --mat-form-field-container-height: 40px;
      --mat-form-field-container-vertical-padding: 8px;

      .spacer {
        grid-column: 4;
      }

      button[mat-stroked-button] {
        height: 40px;
      }
    }

    .table-card {
      overflow: hidden;
    }

    .pill {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: #e3f4e8;
      color: #1b6b3a;

      &.closed {
        background: #f0f0f0;
        color: #555;
      }
    }
  `,
  template: `
    <header class="page-header">
      <h1>Project overzicht</h1>
      <div class="actions">
        <button mat-stroked-button type="button">Exporteer</button>
        <button mat-flat-button color="primary" type="button">
          Nieuw Project
        </button>
      </div>
    </header>

    <form class="card filters">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <input
          matInput
          name="query"
          placeholder="Naam/code ..."
          [(ngModel)]="query" />
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-select name="status" [(ngModel)]="status">
          <mat-option value="Actief">Actief</mat-option>
          <mat-option value="Afgesloten">Afgesloten</mat-option>
          <mat-option [value]="null">Alle</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-select name="team" placeholder="Team ..." [(ngModel)]="team">
          <mat-option [value]="null">Alle teams</mat-option>
          <mat-option value="ANB/VERG">ANB/VERG</mat-option>
        </mat-select>
      </mat-form-field>
      <span class="spacer"></span>
      <button mat-stroked-button type="reset">Reset</button>
    </form>

    <div class="card table-card">
      <inbo-data-table
        [dataPage]="dataPage"
        [dataRequestState]="dataRequestState"
        [columnConfiguration]="columnConfiguration"
        [sort]="{ active: 'name', direction: 'asc' }"
        variant="muted"
        [striped]="true"
        density="compact"
        rowHeight="56px"
        [rowClickable]="false"
        [clientSideProcessing]="true"
        [clientPageSize]="20">
        <ng-template inboTableCell="status" let-row>
          <span class="pill" [class.closed]="row.status !== 'Actief'">
            {{ row.status }}
          </span>
        </ng-template>

        <ng-template inboTableActions let-row>
          <button
            mat-icon-button
            [matMenuTriggerFor]="menu"
            [attr.aria-label]="'Acties voor ' + row.name">
            <mat-icon class="material-icons-sharp">more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item type="button">Detail</button>
            <button mat-menu-item type="button">Bewerken</button>
          </mat-menu>
        </ng-template>
      </inbo-data-table>
    </div>
  `,
})
export class VisOverviewDemo {
  readonly columnConfiguration = columnConfiguration;
  readonly dataRequestState = RequestState.SUCCESS;
  readonly dataPage = pageOf(projects);

  query = '';
  status: Project['status'] | null = 'Actief';
  team: string | null = null;
}

const meta: Meta<VisOverviewDemo> = {
  title: 'Components/Data table/VIS overview',
  component: VisOverviewDemo,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        story:
          'How the VIS project overview composes the table: `variant="muted"`, `striped`, `density="compact"` with 56px rows, a `widthRems` on the Naam column so long names wrap, the filter card kept as a sibling above the table (projection via `[inboTableFilter]` is optional), a status pill through `inboTableCell`, and a kebab menu through `inboTableActions`.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<VisOverviewDemo>;

export const ProjectOverview: Story = {};
