# INBO Angular Component Library

A comprehensive Angular component library for INBO (Research Institute for Nature and Forest) applications, providing reusable UI components that follow INBO design standards and integrate with Angular Material.

## Installation

```bash
npm install @inbo/ng-inbo
```

## Quick Start

1. Import the module in your Angular application:

```typescript
import { NgInboModule } from '@inbo/ng-inbo';

@NgModule({
  imports: [NgInboModule],
  // ...
})
export class AppModule {}
```

2. Include the theme in your `angular.json` styles:

```json
"styles": [
  "node_modules/@inbo/ng-inbo/styles/inbo-theme.scss"
]
```

## Components

- **Data Table** - Feature-rich table component with sorting, filtering, and pagination
- **Autocomplete** - Smart autocomplete input with customizable options
- **Header** - Standardized header component with INBO branding
- **Menu Bar** - Navigation menu component
- **Key-Value** - Display key-value pairs in a structured format
- **Loading Spinner** - Consistent loading indicators
- **Button Group** - Grouped button controls
- **Dialogs** - Modal dialog components

## Directives

- **Auto Focus** - Automatic focus management
- **Click Outside** - Handle clicks outside elements
- **Debounced Input** - Debounced input change detection
- **Form Change** - Form change tracking
- **Input Mask** - Input formatting and masking
- **Positive Numbers** - Restrict input to positive numbers

## Services

- **HTTP Service** - Enhanced HTTP client with common functionality
- **Coordinate Services** - Belgian Lambert projection utilities

## Requirements

- Angular 20.x
- Angular Material 20.x
- Node.js 22.x or higher

## Release Notes

For detailed release notes and version-specific changes, see:

- [Releases](https://github.com/inbo/inbo-component-library/releases) - Complete release history with detailed notes
- [CHANGELOG.md](https://github.com/inbo/inbo-component-library/blob/main/projects/ng-inbo/CHANGELOG.md) - Chronological list of changes

## Documentation

For detailed documentation and examples, visit the [INBO Component Library Demo](https://github.com/inbo/inbo-component-library).

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our [GitHub repository](https://github.com/inbo/inbo-component-library).
