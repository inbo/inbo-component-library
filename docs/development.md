# Library Development

## Overview

Development of this Angular library is done through the included demo application, which provides a live testing environment for all components.

## Primary Development Workflow (Recommended)

### Using the Demo Application

The demo app is the main development environment and includes examples of all library components:

```bash
# Start the demo application
npm run serve:demo
```

The demo app runs on http://localhost:4201 and automatically rebuilds when you make changes to the library code.

### Development Process

1. **Make changes** to library components in `projects/ng-inbo/src/`
2. **Test in demo app** - Changes are automatically reflected
3. **Add examples** to demo app for new components
4. **Build library** when ready: `npm run build:lib`

## Alternative: External Host Application

If you need to test in an external application, you can use these approaches:

### Option 1: Using npm link

```bash
# Build and link the library
npm run build:lib
cd dist/ng-inbo
npm link

# In your external host application
npm link @inbo/ng-inbo
```

### Option 2: Using install-local-dependencies

For complex dependency scenarios, you can use [install-local-dependencies](https://www.npmjs.com/package/install-local-dependencies):

Install it globally:

```bash
npm i -g install-local-dependencies
```

**Note:** When using a Node.js version manager, install it in the same Node.js version as your host application.

## Usage for External Applications

### Method 1: npm link workflow

1. **Build the library:**
   ```bash
   npm run build:lib
   ```

2. **Link the library:**
   ```bash
   cd dist/ng-inbo
   npm link
   ```

3. **Use in external application:**
   ```bash
   # In your external application workspace
   npm link @inbo/ng-inbo
   ng serve
   ```

### Method 2: install-local-dependencies workflow

1. **Build the library:**
   ```bash
   npm run build:lib
   ```

2. **Install into external application:**
   ```bash
   # In external application workspace
   npm install <relative-path>/dist/ng-inbo
   install-local-dependencies
   ng serve
   ```

## Testing

### Demo Application (Primary Testing Method)

The demo application is your main testing environment:

```bash
npm run serve:demo
```

- **URL:** http://localhost:4201
- **Features:** Live examples of all components
- **Auto-reload:** Changes to library code are automatically reflected
- **Component showcase:** Interactive examples and documentation

### Unit Tests

Run the library's unit tests:

```bash
npm test
```

## Common Issues

### Build Errors

- **Angular version mismatch:** Ensure host app uses Angular 20.x
- **Peer dependencies:** Install missing peer dependencies in host app
- **Build cache:** Clear `dist/` and `node_modules/.cache` if builds are stale

### Linking Issues

- **Module not found:** Rebuild the library after changes
- **Conflicting versions:** Use exact Angular versions in both library and host
- **Cache problems:** Run `npm unlink` and re-link if needed

## Notes

When installing from a local folder, npm doesn't automatically install transitive dependencies. The `install-local-dependencies` tool solves this by installing the library's dependencies in the host application.
