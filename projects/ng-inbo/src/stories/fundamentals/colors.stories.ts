import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';

interface Swatch {
  name: string;
  hex: string;
  contrast: string;
  usedFor: string;
}

interface Ramp {
  title: string;
  source: string;
  swatches: Array<Swatch>;
}

function swatch(
  name: string,
  hex: string,
  contrast: string,
  usedFor = ''
): Swatch {
  return { name, hex, contrast, usedFor };
}

@Component({
  selector: 'inbo-color-specimen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'color-specimen' },
  styles: `
    :host {
      display: block;
      padding: 32px 40px 64px;
      max-width: 960px;
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

    .lede code,
    .note code,
    .meta {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .ramp {
      margin: 0 0 40px;
    }

    .ramp-title {
      margin: 0 0 4px;
    }

    .ramp-source {
      margin: 0 0 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .swatch {
      display: flex;
      flex-direction: column;
      min-height: 108px;
      padding: 12px;
      border-radius: 2px;
    }

    .swatch-name {
      margin: 0;
      font-weight: 500;
    }

    .meta {
      margin-top: auto;
      font-size: 12px;
      line-height: 1.5;
      opacity: 0.85;
    }
  `,
  template: `
    <p class="mat-body-1 lede">
      Palettes from <code>_palette.scss</code>, plus the semantic aliases in
      <code>_variables.scss</code>. Swatch contrast follows the palette's own
      contrast map.
    </p>
    <p class="mat-caption note">
      Accent is not a separate hue: it is the primary palette with Material
      defaults remapped to A200 / A100 / A400. So
      <code>$inbo-accent</code> (hue 500) is the same pink as
      <code>$inbo-primary</code>.
    </p>

    @for (ramp of ramps; track ramp.title) {
      <section class="ramp">
        <h2 class="mat-subtitle-1 ramp-title">{{ ramp.title }}</h2>
        <p class="mat-caption ramp-source">{{ ramp.source }}</p>
        <div class="swatches">
          @for (swatch of ramp.swatches; track swatch.name) {
            <div
              class="swatch"
              [style.background-color]="swatch.hex"
              [style.color]="swatch.contrast">
              <p class="mat-body-2 swatch-name">{{ swatch.name }}</p>
              <p class="meta">
                {{ swatch.hex }}
                <br />
                {{ swatch.usedFor }}
              </p>
            </div>
          }
        </div>
      </section>
    }
  `,
})
export class ColorSpecimen {
  readonly ramps: Array<Ramp> = [
    {
      title: 'Semantic',
      source: '_variables.scss — what consuming apps import',
      swatches: [
        {
          name: 'primary',
          hex: '#c04384',
          contrast: '#ffffff',
          usedFor: '$inbo-primary · 500',
        },
        {
          name: 'primary-lighter',
          hex: '#d37ba9',
          contrast: '#000000',
          usedFor: '$inbo-primary-lighter · 300',
        },
        {
          name: 'primary-super-light',
          hex: '#ecc7da',
          contrast: '#000000',
          usedFor: '$inbo-primary-super-light · 100',
        },
        {
          name: 'primary-darker',
          hex: '#b23471',
          contrast: '#ffffff',
          usedFor: '$inbo-primary-darker · 700',
        },
        {
          name: 'accent',
          hex: '#c04384',
          contrast: '#ffffff',
          usedFor: '$inbo-accent · same as 500',
        },
        {
          name: 'warn',
          hex: '#e23645',
          contrast: '#ffffff',
          usedFor: '$inbo-warn · 500',
        },
        {
          name: 'text',
          hex: '#373d3f',
          contrast: '#ffffff',
          usedFor: '$inbo-text-color',
        },
        {
          name: 'gray',
          hex: '#6b7280',
          contrast: '#ffffff',
          usedFor: '$inbo-gray',
        },
        {
          name: 'light-gray',
          hex: '#e5e7eb',
          contrast: '#000000',
          usedFor: '$inbo-light-gray',
        },
        {
          name: 'bg-light',
          hex: '#f9fafb',
          contrast: '#000000',
          usedFor: '$inbo-bg-light',
        },
      ],
    },
    {
      title: 'Primary',
      source: '$inbo-primary — Material pink ramp, default hue 500',
      swatches: [
        swatch('50', '#f7e8f0', '#000000'),
        swatch('100', '#ecc7da', '#000000'),
        swatch('200', '#e0a1c2', '#000000'),
        swatch('300', '#d37ba9', '#000000'),
        swatch('400', '#c95f96', '#000000'),
        swatch('500', '#c04384', '#ffffff', 'default'),
        swatch('600', '#ba3d7c', '#ffffff'),
        swatch('700', '#b23471', '#ffffff', 'darker'),
        swatch('800', '#aa2c67', '#ffffff'),
        swatch('900', '#9c1e54', '#ffffff'),
        swatch('A100', '#ffd5e6', '#000000', 'accent lighter'),
        swatch('A200', '#ffa2c8', '#000000', 'accent default'),
        swatch('A400', '#ff6fa9', '#000000', 'accent darker'),
        swatch('A700', '#ff569a', '#000000'),
      ],
    },
    {
      title: 'Warn',
      source: '$inbo-warn — error / destructive',
      swatches: [
        swatch('50', '#fce7e9', '#000000'),
        swatch('100', '#f6c3c7', '#000000'),
        swatch('200', '#f19ba2', '#000000'),
        swatch('300', '#eb727d', '#000000'),
        swatch('400', '#e65461', '#000000'),
        swatch('500', '#e23645', '#ffffff', 'default'),
        swatch('600', '#df303e', '#ffffff'),
        swatch('700', '#da2936', '#ffffff'),
        swatch('800', '#d6222e', '#ffffff'),
        swatch('900', '#cf161f', '#ffffff'),
        swatch('A100', '#ffffff', '#000000'),
        swatch('A200', '#ffcdcf', '#000000'),
        swatch('A400', '#ff9a9e', '#000000'),
        swatch('A700', '#ff8085', '#000000'),
      ],
    },
  ];
}

const meta: Meta<ColorSpecimen> = {
  title: 'Fundamentals/Colors',
  component: ColorSpecimen,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
};

export default meta;

type Story = StoryObj<ColorSpecimen>;

export const Palette: Story = {};
