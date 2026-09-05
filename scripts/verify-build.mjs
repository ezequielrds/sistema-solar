import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const worker = await readFile('dist/sw.js', 'utf8');
const entries = [...worker.matchAll(/\{url:"([^"]+)",revision:("[^"]*"|null)\}/g)].map(match => ({ url: match[1], revision: match[2] }));
assert(entries.length > 40, 'The complete offline precache manifest must be present.');
assert.equal(new Set(entries.map(e => e.url)).size, entries.length, 'Duplicate precache URLs can break service-worker installation.');
for (const entry of entries) {
  const local = path.resolve('dist', entry.url);
  assert(local.startsWith(path.resolve('dist') + path.sep), 'Precache URL must be inside dist.');
  assert((await stat(local)).size > 0, `Precached file is missing or empty: ${entry.url}`);
}
for (const required of ['index.html', 'assets/asteroid.glb', 'basis/basis_transcoder.js', 'basis/basis_transcoder.wasm', 'textures/earth.ktx2', 'textures/moon-512.webp', 'icons/icon-192.png', 'icons/maskable-512.png']) assert(entries.some(e => e.url === required), `Offline asset missing: ${required}`);
assert.notEqual(entries.find(e => e.url === 'assets/asteroid.glb').revision, 'null', 'Unhashed GLB needs a content revision to refresh offline.');
assert(worker.includes('NavigationRoute'), 'Offline navigation fallback is required.');
assert(worker.includes('clientsClaim'), 'First-load tabs must be controlled once precaching finishes.');
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
assert.equal(manifest.display, 'standalone');
assert(manifest.icons.some(icon => icon.purpose === 'maskable'));
const glb = await readFile('dist/assets/asteroid.glb');
assert.equal(glb.toString('utf8', 0, 4), 'glTF');
const document = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString('utf8'));
assert(document.extensionsRequired.includes('EXT_meshopt_compression'));
assert(document.extensionsUsed.includes('KHR_mesh_quantization'));
const ktx = await readFile('dist/textures/earth.ktx2');
assert.equal(ktx.subarray(0, 12).toString('hex'), 'ab4b5458203230bb0d0a1a0a');
console.log(`Production validation passed: ${entries.length} unique offline assets, PWA manifest, Meshopt GLB and KTX2.`);
