# @inbo/ng-inbo

The official Angular component library for INBO, providing a consistent design system and reusable components.

## Requirements

- **Angular:** 20.x
- **Node.js:** 22.x
- **Angular CLI:** 20.x

## Quick Start

### Installation

```bash
ng add @inbo/ng-inbo
```

### Basic Usage

```typescript
// Import the module or use the new standalone approach
import { provideNgInboCore } from '@inbo/ng-inbo';

// In your app.config.ts (Angular 20+)
export const appConfig: ApplicationConfig = {
  providers: [
    provideNgInboCore(),
    // ... other providers
  ],
};
```

### Styling

Add the INBO theme to your `styles.scss`:

```scss
@import '@inbo/ng-inbo/styles/inbo-theme';
```

## Documentation

- [Installing and releasing](docs/installing-and-releasing.md)
- [Development](docs/development.md)

## Version Compatibility

| ng-inbo | Angular | Node.js |
| ------- | ------- | ------- |
| 2.x     | 20.x    | 22.x    |
| 1.x     | 17.x    | 18+     |
