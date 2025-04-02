# INBO Component Library Demo Application

This is a demo application for testing and developing the INBO component library. It allows you to build and test components without having a separate application.

## Getting Started

1. First, build the library and watch for changes:
   ```
   npm run watch
   ```

2. In a separate terminal, run the demo application:
   ```
   npm run serve:demo
   ```

3. Open your browser at http://localhost:4200

## How to Add a New Component Demo

1. Add the component to the imports in `app/pages/home/home.component.ts`
2. Add a demo section in the template
3. Provide any necessary data or configuration for the component

## Structure

- The demo app is a standard Angular application
- It uses the local INBO component library directly
- When the library changes, the demo app will automatically update

## Development Process

1. Create or modify components in the library
2. Test them in this demo application
3. Once components are working correctly, they can be published to npm 