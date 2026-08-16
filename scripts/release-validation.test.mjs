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

test('manage-release package jobs grant contents write for draft release visibility', async () => {
  const workflow = await readFile(
    new URL('../.github/workflows/manage-release.yml', import.meta.url),
    'utf8'
  );

  for (const job of ['promote', 'reject', 'rollback']) {
    const jobStart = workflow.indexOf(`  ${job}:`);
    assert.notEqual(
      jobStart,
      -1,
      `missing ${job} job in manage-release workflow`
    );

    const nextJobMatch = workflow.slice(jobStart + 1).match(/^  [\w-]+:/m);
    const jobEnd = nextJobMatch
      ? jobStart + 1 + nextJobMatch.index
      : workflow.length;
    const jobBlock = workflow.slice(jobStart, jobEnd);

    assert.match(
      jobBlock,
      /^\s+contents: write$/m,
      `${job} must grant contents: write so gh release view can read draft releases`
    );
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

test('candidate publication uses an explicit local tarball path', async () => {
  const workflow = await readFile(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8'
  );

  assert.match(workflow, /tarball="\.\/\$\{tarballs\[0\]\}"/);
  assert.match(workflow, /npm publish "\$tarball" --tag "\$STAGING_TAG"/);
});

test('published package targets GitHub Packages', async () => {
  const packageJson = JSON.parse(
    await readFile(
      new URL('../projects/ng-inbo/package.json', import.meta.url),
      'utf8'
    )
  );

  assert.equal(
    packageJson.publishConfig?.registry,
    'https://npm.pkg.github.com'
  );
});
