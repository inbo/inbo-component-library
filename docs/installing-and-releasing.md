# Installing & Releasing  🚀

## Requirements

- **Angular:** 20.x
- **Node.js:** 22.x
- **Angular CLI:** 20.x

## Installing

This library is hosted by GitHub packages which acts like an NPM registry. So it is installable from GitHub.

Even though the repository is public, you still need to authenticate with GitHub to be able to install the package
in a project. To do this, do the following:

1. Go to [GitHub token settings](https://github.com/settings/tokens)
2. Create a new classic personal access token with the `write:packages` scope (this automatically includes 
   `read:packages` as well). Optionally you can set it to expire after a certain amount of time.
3. Copy the generated token to your clipboard.
4. Create a global npm config file if it doesn't exist yet. (on Linux / MacOS it is `~/.npmrc`, for Windows it is `C:\Users\%username%\.npmrc`).
5. Add to this file the following lines:
````
//npm.pkg.github.com/:_authToken=<generated-token>
@inbo:registry=https://npm.pkg.github.com/
````
The `@inbo` scope makes sure that NPM will try to fetch any npm package that starts with `@inbo/` from GitHub 
packages registry, instead of the default NPM registry.

Now you can install this package using the regular `npm install @inbo/ng-inbo`, but there is a better way. I added 
an add schematic to this library, so you can install it using the angular-cli. Just run `ng add @inbo/ng-inbo`, 
optionally you can add `--projectName <projectName>` to specify the specific project if the angular-cli workspace has 
multiple projects in it.

The schematic installs the npm package, but it also adds the correct paths to the angular.json file, so the assets
can be used. These assets include images and font-files (Flanders font).

## Troubleshooting

### Authentication Issues

If you get authentication errors:
- Verify your GitHub token has `read:packages` permissions
- Check that your `.npmrc` file is in the correct location
- Ensure the token hasn't expired

### Installation Problems

- **"Package not found"** - Check your `.npmrc` configuration and GitHub token
- **Version conflicts** - Ensure you're using Angular 20.x with this library version
- **Peer dependency warnings** - Install the required peer dependencies manually

### Using the inbo theme for Angular Material

Included in this library, is a theme configuration for Angular Material, that includes the INBO colors (based on the 
primary fuchsia color and generated using an online pallet generator). 

In the `styles.scss` file of your application project, you should import the theme using `@import 'inbo-theme';`. 
You should only import this once in the entire application project. To use the different color and font variables, 
you can import the variables in any scss file using `@import 'partials/variables'`. 


## Releasing

The release process is automated using `standard-version` and includes build validation to prevent failed releases.

### Available Commands

- `npm run prerelease:dry` - Preview what the next release would look like (dry-run)
- `npm run prerelease:check` - Validate that the build works before releasing
- `npm run release` - Creates a patch release (x.x.1) for bug fixes and small changes
- `npm run release:minor` - Creates a minor release (x.1.0) for new features that don't break existing functionality
- `npm run release:major` - Creates a major release (1.0.0) for breaking changes

### Release Workflow

The release process follows this safe workflow:

1. **Build validation** - Ensures the library builds successfully before creating any git tags
2. **Version bump** - Updates package.json and generates changelog
3. **Git commit & tag** - Creates release commit and git tag
4. **Push to GitHub** - Pushes the tag and commits to the remote repository
5. **Publish to NPM** - Publishes the built package to GitHub packages

### Complete Development & Release Workflow

#### Step-by-Step Process

1. **Make your changes** on a feature branch
2. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new component functionality"
   ```

3. **Create a Pull Request**
   ```bash
   git push origin your-feature-branch
   # Then create PR via GitHub UI
   ```

4. **Review and merge** the PR to main branch

5. **Switch to main and prepare for release**
   ```bash
   git checkout main
   git pull origin main
   ```

6. **Preview the release** (optional but recommended)
   ```bash
   npm run prerelease:dry
   ```

7. **Execute the release**
   ```bash
   # Choose the appropriate release type (see guide below)
   npm run release        # for patch
   npm run release:minor  # for minor
   npm run release:major  # for major
   ```

### When to Use Each Release Type

#### Patch Release (`npm run release`)
**Use for:** Bug fixes, typos, documentation updates, small improvements
**Examples:**
- Fixing a broken component method
- Correcting CSS styling issues
- Updating documentation
- Performance improvements that don't change API

**Version change:** `2.1.0` → `2.1.1`

#### Minor Release (`npm run release:minor`)
**Use for:** New features that don't break existing functionality
**Examples:**
- Adding new components
- Adding new methods to existing components
- New optional parameters
- New utility functions

**Version change:** `2.1.0` → `2.2.0`

#### Major Release (`npm run release:major`)
**Use for:** Breaking changes that require users to modify their code
**Examples:**
- Angular version upgrades (like 17 → 20)
- Removing deprecated components/methods
- Changing required parameters
- Renaming public APIs

**Version change:** `2.1.0` → `3.0.0`

### Best Practices

1. **Always use PR workflow** - Never commit directly to main
2. **Test before releasing** - Use `npm run prerelease:check` to validate builds
3. **Use dry-run** - Preview changes with `npm run prerelease:dry`
4. **Release from main only** - Always ensure you're on the latest main branch
5. **One feature per PR** - Makes it easier to choose the right release type
6. **Write clear commit messages** - Helps determine release type automatically

### Troubleshooting Releases

#### Build Fails During Release
```bash
# If prerelease:check fails, fix the build issues first
npm run prerelease:check
# Fix any errors, then try release again
npm run release
```

#### Wrong Release Type Used
```bash
# If you tagged the wrong version, delete the local tag
git tag -d v2.1.1
# Then run the correct release command
npm run release:minor
```

#### Release Interrupted
```bash
# Check what state you're in
git status
git tag

# If tag was created but not pushed, you can continue manually
git push --follow-tags
# Then complete the publish step
cd dist/ng-inbo && npm publish
```

#### Multiple Features Released Together
When releasing multiple features together, use the **highest** release type needed:
- If you have both fixes and new features → use `minor`
- If you have fixes, features, and breaking changes → use `major`

### Quick Reference

| Change Type | Command | When to Use |
|-------------|---------|-------------|
| Bug fix, docs, small improvement | `npm run release` | No API changes |
| New feature, new component | `npm run release:minor` | Backward compatible |
| Breaking change, Angular upgrade | `npm run release:major` | Requires user changes | 
