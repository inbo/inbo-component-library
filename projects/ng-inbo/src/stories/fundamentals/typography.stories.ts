import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';

interface TypeLevel {
  token: string;
  html: string;
  cssClass: string;
  size: string;
  lineHeight: string;
  weight: string;
  usedFor: string;
  sample: string;
}

@Component({
  selector: 'inbo-typography-specimen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'typography-specimen' },
  styles: `
    :host {
      display: block;
      padding: 32px 40px 64px;
      max-width: 880px;
    }

    .lede {
      max-width: 62ch;
      margin: 0 0 8px;
    }

    .note {
      max-width: 62ch;
      margin: 0 0 40px;
      color: rgba(0, 0, 0, 0.6);
    }

    .level {
      padding: 28px 0;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    .sample {
      margin: 0 0 12px;
    }

    .sample button {
      margin: 0;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
    }

    .lede code,
    .note code,
    .meta dd {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 20px;
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.6);
    }

    .meta div {
      display: flex;
      gap: 6px;
      white-space: nowrap;
    }

    .meta dt {
      display: inline;
      font-weight: 500;
    }

    .meta dd {
      display: inline;
      margin: 0;
    }
  `,
  template: `
    <p class="mat-body-1 lede">
      Flanders Art Sans, as declared in
      <code>_typography.scss</code>. These are the live Material classes the
      theme emits — not a mock.
    </p>
    <p class="mat-caption note">
      Source: Webuniversum v3. Table headers map to
      <code>subtitle-2</code> (20px); cells map to <code>body-2</code> (16px /
      weight 300). Body-1 is weight 400, but the font files register Regular at
      500, so 400 falls back to Regular.
    </p>

    @for (level of levels; track level.token) {
      <article class="level">
        @if (level.token === 'button') {
          <p class="sample">
            <button type="button">{{ level.sample }}</button>
          </p>
        } @else {
          <p [class]="'sample ' + level.cssClass">{{ level.sample }}</p>
        }
        <dl class="meta">
          <div>
            <dt>token</dt>
            <dd>{{ level.token }}</dd>
          </div>
          <div>
            <dt>class</dt>
            <dd>.{{ level.cssClass }}</dd>
          </div>
          <div>
            <dt>html</dt>
            <dd>{{ level.html }}</dd>
          </div>
          <div>
            <dt>size</dt>
            <dd>{{ level.size }} / {{ level.lineHeight }}</dd>
          </div>
          <div>
            <dt>weight</dt>
            <dd>{{ level.weight }}</dd>
          </div>
          <div>
            <dt>used for</dt>
            <dd>{{ level.usedFor }}</dd>
          </div>
        </dl>
      </article>
    }
  `,
})
export class TypographySpecimen {
  readonly levels: Array<TypeLevel> = [
    {
      token: 'headline-5',
      html: 'h1',
      cssClass: 'mat-headline-5',
      size: '42px',
      lineHeight: '1.18',
      weight: '500',
      usedFor: 'Page title',
      sample: 'Instituut voor Natuur- en Bosonderzoek',
    },
    {
      token: 'headline-6',
      html: 'h2',
      cssClass: 'mat-headline-6',
      size: '30px',
      lineHeight: '1.24',
      weight: '500',
      usedFor: 'Section title',
      sample: 'Instituut voor Natuur- en Bosonderzoek',
    },
    {
      token: 'subtitle-1',
      html: 'h3',
      cssClass: 'mat-subtitle-1',
      size: '24px',
      lineHeight: '1.3',
      weight: '500',
      usedFor: 'Subsection',
      sample: 'Instituut voor Natuur- en Bosonderzoek',
    },
    {
      token: 'subtitle-2',
      html: 'h4',
      cssClass: 'mat-subtitle-2',
      size: '20px',
      lineHeight: '1.36',
      weight: '500',
      usedFor: 'Table header',
      sample: 'Instituut voor Natuur- en Bosonderzoek',
    },
    {
      token: 'body-1',
      html: 'p',
      cssClass: 'mat-body-1',
      size: '16px',
      lineHeight: '1.2',
      weight: '400',
      usedFor: 'Default body',
      sample:
        'De visstand in Vlaamse waterlopen wordt opgevolgd via gestandaardiseerde afvissingen.',
    },
    {
      token: 'body-2',
      html: 'p',
      cssClass: 'mat-body-2',
      size: '16px',
      lineHeight: '1.2',
      weight: '300',
      usedFor: 'Secondary body, table cell',
      sample:
        'De visstand in Vlaamse waterlopen wordt opgevolgd via gestandaardiseerde afvissingen.',
    },
    {
      token: 'caption',
      html: 'small',
      cssClass: 'mat-caption',
      size: '15px',
      lineHeight: '1.1',
      weight: '300',
      usedFor: 'Hints and helper text',
      sample:
        'De visstand in Vlaamse waterlopen wordt opgevolgd via gestandaardiseerde afvissingen.',
    },
    {
      token: 'button',
      html: 'button, a',
      cssClass: 'mat-typography button',
      size: '16px',
      lineHeight: '1.2',
      weight: '400',
      usedFor: 'Buttons and anchors',
      sample: 'Nieuwe waarneming',
    },
  ];
}

const meta: Meta<TypographySpecimen> = {
  title: 'Fundamentals/Typography',
  component: TypographySpecimen,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
};

export default meta;

type Story = StoryObj<TypographySpecimen>;

export const Scale: Story = {};
