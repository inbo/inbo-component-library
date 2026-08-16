# Installing and releasing

## Requirements

- Angular 20.x
- Node.js 22.x
- Angular CLI 20.x

## Installing the library

`@inbo/ng-inbo` is published to GitHub Packages. GitHub requires authentication
to install npm packages from GitHub Packages, even when the repository and
package are public.

To configure authentication:

1. Open [GitHub token settings](https://github.com/settings/tokens).
2. Create a personal access token (classic) with the `read:packages` scope.
3. Copy the token.
4. Create your user npm configuration file if it does not exist:
   - macOS and Linux: `~/.npmrc`
   - Windows: `%USERPROFILE%\.npmrc`
5. Add:

```ini
//npm.pkg.github.com/:_authToken=<github-token>
@inbo:registry=https://npm.pkg.github.com/
```

Do not commit a token to the repository. The `@inbo` scope sends only
`@inbo/*` packages to GitHub Packages. Other packages continue to use the
default npm registry.

Install the library directly:

```bash
npm install @inbo/ng-inbo
```

The preferred Angular installation uses the setup schematic:

```bash
ng add @inbo/ng-inbo
```

The current schematic expects `--projectName <project-name>`. Use the project
name from the workspace's `angular.json`.

The schematic installs the package and adds the library assets to
`angular.json`. These assets include images and the Flanders fonts.

## Using the INBO theme

Import the theme once in the application's global `styles.scss`:

```scss
@import '@inbo/ng-inbo/styles/inbo-theme';
```

Import the variables from any SCSS file that needs them:

```scss
@import '@inbo/ng-inbo/styles/inbo-theme/partials/variables';
```

## Installation troubleshooting

### Authentication issues

If npm reports an authentication error:

- confirm that the token is a personal access token (classic);
- confirm that it has the `read:packages` scope;
- confirm that the token has not expired;
- confirm that the token is in the correct user `.npmrc` file;
- confirm that the registry is `https://npm.pkg.github.com/`.

### Package installation issues

- **Package not found:** check the token and both `.npmrc` lines.
- **Version conflict:** use the Angular version listed in the requirements.
- **Peer dependency warning:** compare the application dependencies with the
  peer dependency ranges in `projects/ng-inbo/package.json`.
- **Missing images or fonts:** run `ng add @inbo/ng-inbo` and check the
  application's asset configuration in `angular.json`.

## Local development

The root package is a private tooling workspace. The publishable package is
defined by `projects/ng-inbo/package.json` and is built into `dist/ng-inbo`.

```bash
npm ci
npm run lint
npm run test:headless
npm run build:lib
npm run serve:demo
```

The demo application imports the library source directly. Local development
does not install the library from `dist`.

## Temporary release prerequisites

The temporary release process does not need a GitHub App. It uses the
maintainer's GitHub CLI identity to run Release Please.

Before starting:

1. Install and authenticate GitHub CLI.
2. Confirm that your account can write to `inbo/inbo-component-library`.
3. Use the local `main` branch.
4. Keep the working tree clean.

Check GitHub CLI:

```bash
gh auth status
```

GitHub Actions uses the short-lived repository `GITHUB_TOKEN` for package
publication and dist-tag changes. The `@inbo/ng-inbo` package must grant
`inbo/inbo-component-library` access under **Manage Actions access**.

## Release model

Release Please remains the version and changelog authority. The maintainer runs
it locally until the platform team installs the release GitHub App.

Do not change the version manually. Do not run `npm publish` locally. Do not
delete or overwrite a published package version.

### 1. Prepare the release PR

Run:

```bash
npm run release:prepare
```

The command:

1. checks GitHub CLI authentication;
2. checks the repository, branch, and working tree;
3. fetches and safely fast-forwards `main`;
4. runs Release Please with your GitHub identity;
5. opens or updates the release PR.

Release Please updates:

- `projects/ng-inbo/package.json`;
- `.release-please-manifest.json`;
- `projects/ng-inbo/CHANGELOG.md`.

Normal pull request CI runs because the PR is created with your identity.
Review the calculated version and changelog. Merge the PR when it is correct.

Conventional Commit PR titles determine the version:

```text
fix: handle an empty API response
feat(table): add row selection
feat!: remove the legacy table API
```

Release Please selects the highest required version change:

- `fix:` creates a patch release, for example `3.0.7` to `3.0.8`. Use it for
  backward-compatible bug fixes.
- `feat:` creates a minor release, for example `3.0.7` to `3.1.0`. Use it for
  backward-compatible features, components, methods, or optional inputs.
- `!` in the PR title creates a major release, for example `3.0.7` to `4.0.0`.
  Use it when consumers must change their code, such as after removing or
  renaming a public API or dropping support for an Angular version.

Release Please also recognizes a `BREAKING CHANGE:` footer in a merged commit
body. Prefer `!` in the PR title so the breaking change is visible and checked
before the PR is merged.

When a release contains several change types, the highest type wins. A
breaking change produces a major release even when the release also contains
features and fixes.

### 2. Create and publish the candidate

After the release PR is merged, return to the local `main` branch and run:

```bash
npm run release:candidate
```

The command safely fast-forwards `main`, then:

1. creates the draft GitHub Release with Release Please;
2. creates and verifies the matching `vX.Y.Z` tag;
3. verifies that the release, tag, and `main` use the same commit;
4. dispatches the candidate workflow from the immutable tag.

The GitHub Actions workflow:

1. verifies both version manifests, the tag, and the commit;
2. verifies that the tagged commit belongs to `main`;
3. installs dependencies;
4. validates release metadata;
5. runs lint and headless tests;
6. builds and packs the library once;
7. calculates the tarball checksum;
8. publishes with `GITHUB_TOKEN` under a temporary staging tag;
9. downloads the exact package from GitHub Packages;
10. verifies the downloaded checksum;
11. moves `next` to the verified version;
12. removes temporary staging tags.

Only one candidate may be active. An unverified package never receives `next`.

### 3. Test the exact candidate

Flora and waterbirds install the exact version:

```bash
npm install @inbo/ng-inbo@X.Y.Z
```

Consumers must not approve the moving `@next` alias. Each approval must name
the exact version that was tested.

### 4. Promote the approved candidate

After both consumers approve the same version, run:

```bash
npm run release:promote -- X.Y.Z
```

The command dispatches the management workflow. The workflow verifies `next`,
finalizes the draft GitHub Release, and moves `latest` to the same immutable
package.

Repository write access and deliberate command execution are the temporary
approval boundary. The platform team will later replace this boundary with a
protected GitHub Environment.

## Rejecting a candidate

If consumer validation finds a defect, run:

```bash
npm run release:reject -- X.Y.Z
```

The workflow removes `next`. It keeps the immutable package and draft release.
Fix the defect through a normal PR. Release Please will create a new version.

## Rolling back `latest`

To restore a known-good release, run:

```bash
npm run release:rollback -- X.Y.Z
```

The workflow verifies the target, marks its GitHub Release as latest, moves the
package `latest` tag, and clears `next`.

## Failure handling

- Retry a failure that happened before package publication.
- Keep any version that reached GitHub Packages.
- Reject a failed candidate.
- Fix forward with a new version.
- Never delete tags, releases, or packages to hide a failed attempt.

## Release troubleshooting

### A local release command stops

Run `gh auth status` and `git status`. Release commands require:

- an authenticated GitHub CLI session;
- the `inbo/inbo-component-library` repository;
- the local `main` branch;
- a clean working tree.

The command safely fast-forwards a clean local `main`. It stops if the branch
cannot be fast-forwarded.

### Package publication fails

Confirm that the workflow job grants `packages: write`. In the
`@inbo/ng-inbo` package settings, confirm that
`inbo/inbo-component-library` appears under **Manage Actions access**.

Do not publish the package locally. If the workflow failed before publication,
fix the secret or workflow problem and retry. If the version reached GitHub
Packages, keep that immutable version and follow the candidate rejection or
promotion process.

### Another candidate is active

Only one version can use `next`. Finish testing the active candidate, then
promote or reject it before creating another candidate.

## Permanent platform setup

The platform team can later add:

- a least-privilege release GitHub App;
- automatic Release Please execution after pushes to `main`;
- a protected `release-promotion` Environment;
- protected `v*` tags;
- enforced artifact attestations.

This upgrade changes release preparation and approval. It does not change the
candidate, consumer test, promotion, rejection, or rollback model.
