import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const exactVersionPattern =
  /^[=v]?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const conventionalTitlePattern =
  /^(?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([a-z0-9][a-z0-9._/-]*\))?!?: \S.*$/;

export function findExactAngularPeerDependencies(packageJson) {
  return Object.entries(packageJson.peerDependencies ?? {})
    .filter(
      ([name, version]) =>
        name.startsWith('@angular/') && exactVersionPattern.test(version)
    )
    .sort(([left], [right]) => left.localeCompare(right));
}

export function isConventionalPrTitle(title) {
  return conventionalTitlePattern.test(title);
}

async function validatePeerRanges(manifestPath) {
  const packageJson = JSON.parse(await readFile(manifestPath, 'utf8'));
  const exactPeers = findExactAngularPeerDependencies(packageJson);

  if (exactPeers.length > 0) {
    const details = exactPeers
      .map(([name, version]) => `  - ${name}: ${version}`)
      .join('\n');
    throw new Error(
      `Angular peer dependencies must use compatible ranges:\n${details}`
    );
  }

  console.log(`Angular peer dependency ranges are valid in ${manifestPath}.`);
}

function validatePrTitle(title) {
  if (!isConventionalPrTitle(title)) {
    throw new Error(
      'Pull request title must follow Conventional Commits, for example "fix: handle an empty response".'
    );
  }

  console.log(`Pull request title is valid: ${title}`);
}

async function run() {
  const [command, argument] = process.argv.slice(2);

  if (command === 'peer-ranges') {
    await validatePeerRanges(
      resolve(argument ?? 'projects/ng-inbo/package.json')
    );
    return;
  }

  if (command === 'pr-title') {
    validatePrTitle(argument ?? process.env.PR_TITLE ?? '');
    return;
  }

  throw new Error(
    'Usage: node scripts/release-validation.mjs <peer-ranges|pr-title> [value]'
  );
}

const isEntryPoint =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isEntryPoint) {
  run().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
