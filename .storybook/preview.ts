import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { applicationConfig, type Preview } from '@storybook/angular-vite';
import documentationJson from '../documentation.json';
import './preview.scss';

// Angular metadata (input/output descriptions and default values) is not
// available at runtime, so Storybook reads it from Compodoc's export. The
// docs:json script regenerates this before the dev server and the build.
setCompodocJson(documentationJson);

// The INBO theme scopes its typography hierarchy to .mat-typography, which the
// demo app sets on <body>.
document.body.classList.add('mat-typography');

const preview: Preview = {
  // Generate an API reference page from the component's inputs/outputs so the
  // library documents itself instead of relying on a hand-written demo page.
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimationsAsync(), provideHttpClient()],
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
