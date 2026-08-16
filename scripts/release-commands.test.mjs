import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

import {
  assertReadyMain,
  createCandidate,
  dispatchManagement,
  parseVersion,
  prepareRelease,
  withGitHubTokenFile,
} from './release-commands.mjs';

const SHA = '0123456789abcdef0123456789abcdef01234567';

function commandInvocation({ command, args }) {
  return [command, ...args].join(' ');
}

function createRunner(responder) {
  const calls = [];

  return {
    calls,
    async run(command, args = [], options = {}) {
      const call = { command, args, options };
      calls.push(call);
      return responder(call);
    },
  };
}

function workspaceResponse(call) {
  const invocation = commandInvocation(call);

  if (invocation === 'gh auth status') return '';
  if (invocation.includes('gh repo view')) return 'inbo/inbo-component-library';
  if (invocation === 'git branch --show-current') return 'main';
  if (invocation === 'git status --porcelain') return '';
  if (invocation === 'git fetch origin main') return '';
  if (invocation === 'git rev-parse HEAD') return SHA;
  if (invocation === 'git rev-parse origin/main') return SHA;

  throw new Error(`Unexpected command: ${invocation}`);
}

test('accepts exact semantic versions without a v prefix', () => {
  assert.equal(parseVersion('3.0.8'), '3.0.8');
  assert.equal(parseVersion('4.0.0-beta.1'), '4.0.0-beta.1');
  assert.throws(() => parseVersion('v3.0.8'), /exact semantic version/);
  assert.throws(() => parseVersion('3.0'), /exact semantic version/);
});

test('requires a clean checkout of the current main branch', async () => {
  const runner = createRunner(call => {
    const invocation = commandInvocation(call);
    if (invocation === 'git status --porcelain') return ' M package.json';
    return workspaceResponse(call);
  });

  await assert.rejects(() => assertReadyMain(runner.run), /working tree/);
});

test('fast-forwards a clean main branch to the remote head', async () => {
  const remoteSha = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  let fastForwarded = false;
  const runner = createRunner(call => {
    const invocation = commandInvocation(call);

    if (invocation === 'git rev-parse HEAD') {
      return fastForwarded ? remoteSha : SHA;
    }
    if (invocation === 'git rev-parse origin/main') return remoteSha;
    if (invocation === 'git merge --ff-only origin/main') {
      fastForwarded = true;
      return '';
    }

    return workspaceResponse(call);
  });

  assert.equal(await assertReadyMain(runner.run), remoteSha);
});

test('prepares a release PR with Release Please under the current user', async () => {
  const runner = createRunner(call => {
    const invocation = commandInvocation(call);
    if (invocation.startsWith('npm exec -- release-please manifest-pr')) {
      return '';
    }
    return workspaceResponse(call);
  });

  await prepareRelease({
    run: runner.run,
    withTokenFile: (_run, callback) => callback('/tmp/release-token'),
  });

  const releasePleaseCall = runner.calls.find(
    ({ command, args }) => command === 'npm' && args.includes('manifest-pr')
  );
  assert.ok(releasePleaseCall);
  assert.equal(
    releasePleaseCall.args.includes('--repo-url=inbo/inbo-component-library'),
    true
  );
  assert.equal(releasePleaseCall.args.includes('--target-branch=main'), true);
  assert.equal(
    releasePleaseCall.args.includes('--token=/tmp/release-token'),
    true
  );
  assert.equal(
    releasePleaseCall.args.some(arg => arg.includes('test-token')),
    false
  );
  assert.equal(releasePleaseCall.options.sensitive, true);
});

test('stores the GitHub token in a temporary restricted file', async () => {
  let tokenPath;
  const runner = createRunner(call => {
    if (commandInvocation(call) === 'gh auth token') return 'test-token';
    throw new Error(`Unexpected command: ${commandInvocation(call)}`);
  });

  await withGitHubTokenFile(runner.run, async path => {
    tokenPath = path;
    assert.equal(await readFile(path, 'utf8'), 'test-token');
    assert.equal((await stat(path)).mode & 0o777, 0o600);
  });

  await assert.rejects(() => access(tokenPath));
});

test('creates and verifies a draft candidate before dispatch', async () => {
  const runner = createRunner(call => {
    const invocation = commandInvocation(call);

    if (invocation.startsWith('npm exec -- release-please manifest-release')) {
      return '';
    }
    if (invocation.startsWith('gh release view v3.0.8')) {
      return JSON.stringify({
        isDraft: true,
        tagName: 'v3.0.8',
        targetCommitish: SHA,
      });
    }
    if (
      invocation.startsWith(
        'gh api repos/inbo/inbo-component-library/git/ref/tags/v3.0.8'
      )
    ) {
      return `${SHA} commit`;
    }
    if (invocation.startsWith('gh workflow run release.yml')) return '';

    return workspaceResponse(call);
  });

  await createCandidate({
    run: runner.run,
    withTokenFile: (_run, callback) => callback('/tmp/release-token'),
    readVersions: async () => ({
      libraryVersion: '3.0.8',
      manifestVersion: '3.0.8',
    }),
  });

  const dispatch = runner.calls.find(
    ({ command, args }) => command === 'gh' && args[0] === 'workflow'
  );
  assert.equal(dispatch.args.includes('v3.0.8'), true);
  assert.equal(dispatch.args.includes('main'), false);
  assert.deepEqual(dispatch.args.slice(-2), ['-f', 'version=3.0.8']);
});

test('rejects a candidate whose tag points to another commit', async () => {
  const runner = createRunner(call => {
    const invocation = commandInvocation(call);

    if (invocation.startsWith('npm exec -- release-please manifest-release')) {
      return '';
    }
    if (invocation.startsWith('gh release view v3.0.8')) {
      return JSON.stringify({
        isDraft: true,
        tagName: 'v3.0.8',
        targetCommitish: SHA,
      });
    }
    if (
      invocation.startsWith(
        'gh api repos/inbo/inbo-component-library/git/ref/tags/v3.0.8'
      )
    ) {
      return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa commit';
    }

    return workspaceResponse(call);
  });

  await assert.rejects(
    () =>
      createCandidate({
        run: runner.run,
        withTokenFile: (_run, callback) => callback('/tmp/release-token'),
        readVersions: async () => ({
          libraryVersion: '3.0.8',
          manifestVersion: '3.0.8',
        }),
      }),
    /tag target/
  );
});

test('dispatches an exact release-management operation', async () => {
  const runner = createRunner(call => {
    const invocation = commandInvocation(call);
    if (invocation === 'gh auth status') return '';
    if (invocation.includes('gh repo view'))
      return 'inbo/inbo-component-library';
    if (invocation.startsWith('gh workflow run manage-release.yml')) return '';
    throw new Error(`Unexpected command: ${invocation}`);
  });

  await dispatchManagement('promote', '3.0.8', { run: runner.run });

  assert.deepEqual(runner.calls.at(-1).args.slice(-4), [
    '-f',
    'operation=promote',
    '-f',
    'version=3.0.8',
  ]);
});
