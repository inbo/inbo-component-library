# Installing & Releasing 🚀

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

```
//npm.pkg.github.com/:_authToken=<generated-token>
@inbo:registry=https://npm.pkg.github.com/
```

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
- `npm run prerelease:check` - Validate that the build works before releasing (required safety check)
- `npm run sync-versions` - Sync root package.json version with library version
- `npm run release` - Creates a patch release (x.x.1) for bug fixes and small changes
- `npm run release:minor` - Creates a minor release (x.1.0) for new features that don't break existing functionality
- `npm run release:major` - Creates a major release (1.0.0) for breaking changes

### Release Workflow

The release process follows this safe workflow:

1. **Build validation** - Tests that the library builds successfully before making any changes
2. **Version bump** - Updates library package.json and generates changelog
3. **Sync versions** - Updates root package.json to match library version
4. **Build with new version** - Rebuilds the library with the correct version number
5. **Git commit & tag** - Amends the release commit with synced versions
6. **Push to GitHub** - Pushes the tag and commits to the remote repository
7. **Publish to NPM** - Publishes the built package to GitHub packages

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

#### Build Fails Before Version Bump (Safest Scenario)

```bash
# If prerelease:check fails, fix the build issues first
npm run prerelease:check
# Fix any errors, then try release again
npm run release
```

**What happened:** Build failed before any git changes. Nothing to clean up! ✅

#### Build Fails After Version Bump (Needs Cleanup)

```bash
# Check current state
git status
git log --oneline -3
git tag | tail -3

# Scenario A: If commit was created but not pushed
git reset --hard HEAD~1    # Undo release commit
git tag -d v3.0.1         # Remove the tag
# Fix the issue, then retry release

# Scenario B: If already pushed to remote
git revert HEAD           # Create revert commit
git push origin main      # Push the revert
git tag -d v3.0.1        # Remove local tag
git push origin :refs/tags/v3.0.1  # Remove remote tag
# Fix the issue, then retry release
```

#### Publish Fails (Package Built, Tag Exists)

```bash
# If npm publish fails but everything else worked
cd dist/ng-inbo
npm publish               # Retry publish

# If publish keeps failing due to network/auth issues
npm whoami               # Verify you're logged in
npm config get registry  # Should show GitHub packages URL
# Fix auth, then retry publish
```

#### Version Sync Issues

```bash
# If root and library versions get out of sync
npm run sync-versions
git add package.json
git commit -m "sync: update root version to match library"
```

#### Wrong Release Type Used

```bash
# If you used wrong release type (e.g. minor instead of major)

# If NOT yet pushed:
git reset --hard HEAD~1
git tag -d v3.1.0
npm run release:major    # Use correct type

# If already pushed:
# Create a new release with correct type - don't try to "fix" the wrong one
npm run release:major    # This will create v4.0.0 (correct major)
```

#### Release Completely Interrupted/Corrupted

```bash
# Nuclear option - reset everything to clean state
git log --oneline -5     # Note the last good commit before release
git reset --hard <commit-hash>  # Reset to before release attempt
git tag -d v3.0.1       # Remove any created tags
git push origin main --force  # Force push the reset (CAREFUL!)
git push origin :refs/tags/v3.0.1  # Remove remote tag if it exists

# Start fresh
npm run release:major
```

#### Emergency: Bad Release Already Published

```bash
# If a broken package was published to npm
npm unpublish @inbo/ng-inbo@3.0.1  # Only works within 24hrs

# If unpublish doesn't work, publish a hotfix
npm run release          # Creates 3.0.2 with fixes
```

#### Multiple Features Released Together

When releasing multiple features together, use the **highest** release type needed:

- If you have both fixes and new features → use `minor`
- If you have fixes, features, and breaking changes → use `major`

### Quick Reference

#### Release Commands

| Change Type                      | Command                 | When to Use           |
| -------------------------------- | ----------------------- | --------------------- |
| Bug fix, docs, small improvement | `npm run release`       | No API changes        |
| New feature, new component       | `npm run release:minor` | Backward compatible   |
| Breaking change, Angular upgrade | `npm run release:major` | Requires user changes |

#### Emergency Recovery Commands

| Problem                | Solution                                   |
| ---------------------- | ------------------------------------------ |
| Build fails early      | Fix issue, retry release                   |
| Build fails after bump | `git reset --hard HEAD~1 && git tag -d v*` |
| Wrong release type     | Reset and use correct command              |
| Publish fails          | `cd dist/ng-inbo && npm publish`           |
| Bad release published  | `npm unpublish` (24hr window) or hotfix    |
| Complete disaster      | `git reset --hard <hash>` + force push     |

#### Pre-flight Checks

Always run these before releasing:

```bash
npm run prerelease:dry    # Preview changes
npm run prerelease:check  # Test build
git status               # Ensure clean working tree
```
