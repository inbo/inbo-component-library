import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../projects/ng-inbo/src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      // The builtin run only fires when documentation.json is absent, so edits
      // to doc comments would never show up. The docs:json script owns it.
      compodoc: false,
    },
  },
  // Mirrors the demo-app asset mapping so the Flanders @font-face urls resolve.
  staticDirs: [{ from: '../projects/ng-inbo/assets', to: '/assets' }],
  viteFinal: async viteConfig => ({
    ...viteConfig,
    css: {
      ...viteConfig.css,
      preprocessorOptions: {
        ...viteConfig.css?.preprocessorOptions,
        scss: {
          // The theme resolves '@angular/material' and its own partials by name.
          loadPaths: [
            'node_modules',
            'projects/ng-inbo',
            'projects/ng-inbo/styles/inbo-theme/partials',
          ],
        },
      },
    },
  }),
};

export default config;
