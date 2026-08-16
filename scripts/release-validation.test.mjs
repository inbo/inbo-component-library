import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  findExactAngularPeerDependencies,
  isConventionalPrTitle,
} from './release-validation.mjs';

test('finds exact Angular peer dependency versions', () => {
  const packageJson = {
    peerDependencies: {
      '@angular/core': '20.3.25',
      '@angular/material': '=20.2.14',
      '@angular/cdk': 'v20.2.14',
      'date-fns': '2.30.0',
    },
  };

  assert.deepEqual(findExactAngularPeerDependencies(packageJson), [
    ['@angular/cdk', 'v20.2.14'],
    ['@angular/core', '20.3.25'],
    ['@angular/material', '=20.2.14'],
  ]);
});

test('accepts Angular peer dependency ranges', () => {
  const packageJson = {
    peerDependencies: {
      '@angular/cdk': '>=20.2.4 <21.0.0',
      '@angular/core': '^20.3.25',
      '@angular/material': '~20.2.14',
    },
  };

  assert.deepEqual(findExactAngularPeerDependencies(packageJson), []);
});

test('accepts Conventional Commit pull request titles', () => {
  const titles = [
    'fix: handle an empty response',
    'feat(table): add row selection',
    'feat!: remove the legacy API',
    'chore(main): release 3.0.8',
  ];

  for (const title of titles) {
    assert.equal(isConventionalPrTitle(title), true, title);
  }
});

test('rejects pull request titles that cannot drive semantic releases', () => {
  const titles = [
    'Add row selection',
    'Feature: add row selection',
    'feat add row selection',
    'feat:',
  ];

  for (const title of titles) {
    assert.equal(isConventionalPrTitle(title), false, title);
  }
});

test('release workflows use the repository token for package writes', async () => {
  const workflows = [
    ['../.github/workflows/release.yml', 1],
    ['../.github/workflows/manage-release.yml', 3],
  ];

  for (const [path, expectedPackageJobs] of workflows) {
    const workflow = await readFile(new URL(path, import.meta.url), 'utf8');
    const packageWritePermissions =
      workflow.match(/^\s+packages: write$/gm)?.length ?? 0;
    const repositoryTokens =
      workflow.match(
        /^\s+NODE_AUTH_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}$/gm
      )?.length ?? 0;

    assert.equal(packageWritePermissions, expectedPackageJobs, path);
    assert.equal(repositoryTokens, expectedPackageJobs, path);
    assert.doesNotMatch(workflow, /secrets\.NPM_TOKEN/, path);
  }
});

test('published package metadata links to the source repository', async () => {
  const packageJson = JSON.parse(
    await readFile(
      new URL('../projects/ng-inbo/package.json', import.meta.url),
      'utf8'
    )
  );

  assert.deepEqual(packageJson.repository, {
    type: 'git',
    url: 'https://github.com/inbo/inbo-component-library.git',
    directory: 'projects/ng-inbo',
  });
});
