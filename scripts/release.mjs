import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const sha = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert.match(sha, /^[a-f0-9]{40}$/);
const files = (await readdir('dist', { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile())
  .map(entry => `${entry.parentPath}/${entry.name}`.replace(/^dist\//, ''))
  .filter(path => path !== 'release.json').sort();
const hashes = Object.fromEntries(await Promise.all(files.map(async path => [path, createHash('sha256').update(await readFile(`dist/${path}`)).digest('hex')])));
if (process.argv[2] === 'write') {
  await writeFile('dist/release.json', JSON.stringify({ schemaVersion: 1, repository: 'aserdargun/arl-aserdargun-com', gitSha: sha, builtAt: new Date().toISOString(), assets: hashes }, null, 2) + '\n');
}
const release = JSON.parse(await readFile('dist/release.json', 'utf8'));
assert.equal(release.gitSha, sha);
assert.deepEqual(release.assets, hashes);
assert(files.includes('index.html') && files.includes('staticwebapp.config.json'));
const html = await readFile('dist/index.html', 'utf8');
for (const match of html.matchAll(/(?:src|href)="\/(assets\/[^\"]+)"/g)) assert(files.includes(match[1]), `Missing entry asset: ${match[1]}`);
assert(files.some(path => /assets\/RuntimeWorld-.*\.js$/.test(path)), 'Missing lazy 3D bundle');
console.log(`Verified ${files.length} artifact files for ${sha}`);
