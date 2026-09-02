import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { applicationConfig, type Preview } from '@storybook/angular-vite';
import './preview.scss';

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
