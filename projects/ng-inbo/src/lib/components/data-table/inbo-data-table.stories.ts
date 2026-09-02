import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ApiPage } from '../../services/api/api-page.model';
import { RequestState } from '../../services/api/request-state.enum';
import {
  FilterMode,
  FilterType,
  InboDataTableColumnConfiguration,
} from './column-configuration.model';
import {
  InboDatatableItem,
  InboDataTableComponent,
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
    isDeleteButtonDisabled: true,
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
  species: {
    name: 'Soort',
    sortable: true,
    sortablePropertyName: 'species',
    filterable: true,
    filterType: FilterType.Text,
    filterMode: FilterMode.Local,
    filterPlaceholder: 'Soort',
  },
  location: {
    name: 'Locatie',
    sortable: true,
    sortablePropertyName: 'location',
    filterable: true,
    filterType: FilterType.Text,
    filterMode: FilterMode.Local,
    filterPlaceholder: 'Locatie',
  },
  recordedOn: {
    name: 'Waargenomen op',
    sortable: true,
    sortablePropertyName: 'recordedOn',
  },
  validated: {
    name: 'Gevalideerd',
    getValue: value => (value ? 'Ja' : 'Nee'),
    filterable: true,
    filterType: FilterType.Boolean,
    booleanFilterTrueLabel: 'Gevalideerd',
    booleanFilterFalseLabel: 'Niet gevalideerd',
    booleanFilterBothLabel: 'Beide',
  },
};

const meta: Meta<InboDataTableComponent<Observation>> = {
  title: 'Components/Data table',
  component: InboDataTableComponent,
  args: {
    dataPage: pageOf(observations),
    dataRequestState: RequestState.SUCCESS,
    columnConfiguration,
    rowHeight: '48px',
    clientSideProcessing: true,
    clientPageSize: 20,
  },
  argTypes: {
    dataRequestState: {
      control: 'select',
      options: Object.values(RequestState),
    },
    rowHeight: { control: 'text' },
    hidePageSize: { control: 'boolean' },
    rowClickable: { control: 'boolean' },
    density: { control: 'select', options: ['comfortable', 'compact'] },
    pageSizeOptions: { control: 'object' },
    filterValues: { control: 'object' },
    dataPage: { control: false },
    columnConfiguration: { control: false },
    pageChange: { action: 'pageChange' },
    editItem: { action: 'editItem' },
    deleteItem: { action: 'deleteItem' },
    clickItem: { action: 'clickItem' },
    sortChanged: { action: 'sortChanged' },
    filterChanged: { action: 'filterChanged' },
  },
};

export default meta;

type Story = StoryObj<InboDataTableComponent<Observation>>;

export const Default: Story = {};

export const Sorted: Story = {
  args: {
    sort: { active: 'species', direction: 'asc' },
  },
};

export const RestoredFilters: Story = {
  args: {
    filterValues: { species: 'Baars' },
  },
};

export const PageSizeSelector: Story = {
  args: {
    hidePageSize: false,
    pageSizeOptions: [20, 50, 100],
    clientPageSize: 20,
  },
};

export const RowClickDisabled: Story = {
  args: {
    rowClickable: false,
  },
};

export const Compact: Story = {
  args: {
    density: 'compact',
    rowHeight: '40px',
    hidePageSize: false,
    pageSizeOptions: [20, 50, 100],
    columnConfiguration: {
      species: {
        name: 'Soort',
        sortable: true,
        sortablePropertyName: 'species',
      },
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
    },
  },
};

export const CompactFilters: Story = {
  args: {
    density: 'compact',
    rowHeight: '40px',
    hidePageSize: false,
    pageSizeOptions: [20, 50, 100],
  },
};

export const Loading: Story = {
  args: {
    dataPage: pageOf([]),
    dataRequestState: RequestState.PENDING,
  },
};

export const Empty: Story = {
  args: {
    dataPage: pageOf([]),
    dataRequestState: RequestState.EMPTY,
  },
};

export const Error: Story = {
  args: {
    dataPage: pageOf([]),
    dataRequestState: RequestState.ERROR,
  },
};
