import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPOSITORY = 'inbo/inbo-component-library';
const TARGET_BRANCH = 'main';
const RELEASE_CONFIG = 'release-please-config.json';
const RELEASE_MANIFEST = '.release-please-manifest.json';
const LIBRARY_PATH = 'projects/ng-inbo';
const MANAGEMENT_OPERATIONS = ['promote', 'reject', 'rollback'];
const exactVersionPattern =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseVersion(value) {
  if (!exactVersionPattern.test(value ?? '')) {
    throw new Error(
      'Version must be an exact semantic version without a v prefix.'
    );
  }

  return value;
}

export async function runCommand(
  command,
  args = [],
  { capture = false, sensitive = false } = {}
) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const invocation = sensitive ? command : [command, ...args].join(' ');
    const detail = capture && result.stderr ? `\n${result.stderr.trim()}` : '';
    throw new Error(`Command failed: ${invocation}${detail}`);
  }

  return capture ? result.stdout.trim() : '';
}

async function assertRepository(run) {
  await run('gh', ['auth', 'status']);
  const repository = await run(
    'gh',
    ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'],
    { capture: true }
  );

  if (repository !== REPOSITORY) {
    throw new Error(
      `Run this command in ${REPOSITORY}; found ${repository || 'no repository'}.`
    );
  }
}

export async function assertReadyMain(run = runCommand) {
  await assertRepository(run);

  const branch = await run('git', ['branch', '--show-current'], {
    capture: true,
  });
  if (branch !== TARGET_BRANCH) {
    throw new Error(`Switch to ${TARGET_BRANCH} before preparing a release.`);
  }

  const status = await run('git', ['status', '--porcelain'], { capture: true });
  if (status) {
    throw new Error(
      'The working tree must be clean before preparing a release.'
    );
  }

  await run('git', ['fetch', 'origin', TARGET_BRANCH]);
  let head = await run('git', ['rev-parse', 'HEAD'], { capture: true });
  const remoteHead = await run(
    'git',
    ['rev-parse', `origin/${TARGET_BRANCH}`],
    { capture: true }
  );

  if (head !== remoteHead) {
    await run('git', ['merge', '--ff-only', `origin/${TARGET_BRANCH}`]);
    head = await run('git', ['rev-parse', 'HEAD'], { capture: true });
    if (head !== remoteHead) {
      throw new Error(
        `Local ${TARGET_BRANCH} must match origin/${TARGET_BRANCH}.`
      );
    }
  }

  return head;
}

function releasePleaseArguments(command, tokenPath) {
  return [
    'exec',
    '--',
    'release-please',
    command,
    `--token=${tokenPath}`,
    `--repo-url=${REPOSITORY}`,
    `--target-branch=${TARGET_BRANCH}`,
    `--config-file=${RELEASE_CONFIG}`,
    `--manifest-file=${RELEASE_MANIFEST}`,
  ];
}

export async function withGitHubTokenFile(run, callback) {
  const token = await run('gh', ['auth', 'token'], {
    capture: true,
    sensitive: true,
  });
  if (!token) {
    throw new Error('GitHub CLI did not return an authentication token.');
  }

  const directory = await mkdtemp(join(tmpdir(), 'ng-inbo-release-'));
  const tokenPath = join(directory, 'token');

  try {
    await writeFile(tokenPath, token, { mode: 0o600 });
    return await callback(tokenPath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function readVersionsFromFiles() {
  const [libraryPackage, manifest] = await Promise.all([
    readFile(resolve(LIBRARY_PATH, 'package.json'), 'utf8'),
    readFile(resolve(RELEASE_MANIFEST), 'utf8'),
  ]);

  return {
    libraryVersion: JSON.parse(libraryPackage).version,
    manifestVersion: JSON.parse(manifest)[LIBRARY_PATH],
  };
}

export async function prepareRelease({
  run = runCommand,
  withTokenFile = withGitHubTokenFile,
} = {}) {
  await assertReadyMain(run);
  await withTokenFile(run, tokenPath => {
    return run('npm', releasePleaseArguments('release-pr', tokenPath), {
      sensitive: true,
    });
  });
}

export async function createCandidate({
  run = runCommand,
  readVersions = readVersionsFromFiles,
  withTokenFile = withGitHubTokenFile,
} = {}) {
  const head = await assertReadyMain(run);
  const { libraryVersion, manifestVersion } = await readVersions();
  const version = parseVersion(libraryVersion);

  if (version !== manifestVersion) {
    throw new Error(
      `Library version ${version} does not match release manifest version ${manifestVersion}.`
    );
  }

  await withTokenFile(run, tokenPath => {
    return run(
      'npm',
      [...releasePleaseArguments('github-release', tokenPath), '--draft'],
      { sensitive: true }
    );
  });

  const tag = `v${version}`;
  const release = JSON.parse(
    await run(
      'gh',
      [
        'release',
        'view',
        tag,
        '--repo',
        REPOSITORY,
        '--json',
        'isDraft,tagName,targetCommitish',
      ],
      { capture: true }
    )
  );
  if (
    !release.isDraft ||
    release.tagName !== tag ||
    release.targetCommitish !== head
  ) {
    throw new Error(`Draft release ${tag} does not target ${head}.`);
  }

  const tagTarget = await run(
    'gh',
    [
      'api',
      `repos/${REPOSITORY}/git/ref/tags/${tag}`,
      '--jq',
      '.object.sha + " " + .object.type',
    ],
    { capture: true }
  );
  if (tagTarget !== `${head} commit`) {
    throw new Error(`Release tag target must be ${head}; found ${tagTarget}.`);
  }

  await run('gh', [
    'workflow',
    'run',
    'release.yml',
    '--repo',
    REPOSITORY,
    '--ref',
    tag,
    '-f',
    `version=${version}`,
  ]);
}

export async function dispatchManagement(
  operation,
  versionInput,
  { run = runCommand } = {}
) {
  if (!MANAGEMENT_OPERATIONS.includes(operation)) {
    throw new Error(`Unsupported release operation: ${operation}`);
  }

  const version = parseVersion(versionInput);
  await assertRepository(run);
  await run('gh', [
    'workflow',
    'run',
    'manage-release.yml',
    '--repo',
    REPOSITORY,
    '--ref',
    TARGET_BRANCH,
    '-f',
    `operation=${operation}`,
    '-f',
    `version=${version}`,
  ]);
}

async function main() {
  const [command, version] = process.argv.slice(2);

  if (command === 'prepare') {
    await prepareRelease();
    console.log('Release pull request is ready for review.');
    return;
  }

  if (command === 'candidate') {
    await createCandidate();
    console.log('Candidate workflow was dispatched.');
    return;
  }

  if (MANAGEMENT_OPERATIONS.includes(command)) {
    await dispatchManagement(command, version);
    console.log(`${command} workflow was dispatched for ${version}.`);
    return;
  }

  throw new Error(
    'Usage: release-commands.mjs <prepare|candidate|promote|reject|rollback> [version]'
  );
}

const isEntryPoint =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isEntryPoint) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
