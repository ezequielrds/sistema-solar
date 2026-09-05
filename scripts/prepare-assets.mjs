import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { IcosahedronGeometry } from 'three';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'public');
const cache = path.join(root, '.asset-cache');
await Promise.all(['textures', 'assets', 'icons', 'basis'].map(folder => mkdir(path.join(target, folder), { recursive: true })));
await mkdir(cache, { recursive: true });
const compiler = path.join(root, 'node_modules/@gpu-tex-enc/basis/bin', `${process.platform}-${process.arch}`, process.platform === 'win32' ? 'basisu.exe' : 'basisu');
const assets = {
  sun: '2k_sun.jpg', mercury: '2k_mercury.jpg', venus: '2k_venus_atmosphere.jpg',
  earth: '2k_earth_daymap.jpg', mars: '2k_mars.jpg', jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg', uranus: '2k_uranus.jpg', neptune: '2k_neptune.jpg',
  moon: '2k_moon.jpg', 'saturn-ring': '2k_saturn_ring_alpha.png',
};

for (const [name, file] of process.argv.includes('--models-only') ? [] : Object.entries(assets)) {
  const original = path.join(cache, file);
  try { await stat(original); } catch {
    const source = `https://edu.solarsystemscope.com/textures/download/${file}`;
    const response = await fetch(source);
    if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
    await writeFile(original, new Uint8Array(await response.arrayBuffer()));
  }
  for (const width of [512, 1024]) await sharp(original).resize({ width, withoutEnlargement: false }).webp({ quality: 82, alphaQuality: 95 }).toFile(path.join(target, 'textures', `${name}-${width}.webp`));
  const png = path.join(cache, `${name}.png`);
  await sharp(original).resize({ width: 1024 }).png().toFile(png);
  const output = path.join(target, 'textures', `${name}.ktx2`);
  execFileSync(compiler, ['-ktx2', '-mipmap', '-q', '160', '-comp_level', '2', '-file', png, '-output_file', output], { stdio: 'pipe', windowsHide: true });
  console.log(`${name}: WebP 512/1024 + KTX2/Basis with mipmaps`);
}

for (const file of ['basis_transcoder.js', 'basis_transcoder.wasm']) await copyFile(path.join(root, 'node_modules/three/examples/jsm/libs/basis', file), path.join(target, 'basis', file));
await copyFile(path.join(root, 'node_modules/@gpu-tex-enc/basis/LICENSE'), path.join(target, 'basis/BASIS-LICENSE.txt'));
await copyFile(path.join(root, 'node_modules/three/LICENSE'), path.join(target, 'basis/THREE-LICENSE.txt'));

const icon = await readFile(path.join(target, 'icon.svg'));
for (const size of [192, 512]) await sharp(icon).resize(size, size).png().toFile(path.join(target, 'icons', `icon-${size}.png`));
const inset = await sharp(icon).resize(360, 360).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0b1020' } }).composite([{ input: inset, left: 76, top: 76 }]).png().toFile(path.join(target, 'icons/maskable-512.png'));

// Original low-poly asteroid. Meshopt compresses attributes in an actual GLB asset.
const geometry = new IcosahedronGeometry(1, 1);
const position = geometry.attributes.position;
for (let i = 0; i < position.count; i++) {
  const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
  const noise = .85 + .15 * Math.sin(x * 11 + y * 7 + z * 13);
  position.setXYZ(i, x * noise, y * noise * .76, z * noise * .91);
}
geometry.computeVertexNormals();
const document = new Document();
const buffer = document.createBuffer();
const positions = document.createAccessor().setType('VEC3').setArray(new Float32Array(position.array)).setBuffer(buffer);
const normals = document.createAccessor().setType('VEC3').setArray(new Float32Array(geometry.attributes.normal.array)).setBuffer(buffer);
const primitive = document.createPrimitive().setAttribute('POSITION', positions).setAttribute('NORMAL', normals);
const mesh = document.createMesh('Original orbital rock').addPrimitive(primitive);
document.createScene().addChild(document.createNode('Asteroid').setMesh(mesh));
Object.assign(document.getRoot().getAsset(), { version: '2.0', generator: 'Órbita educational asset pipeline', copyright: '2026 Ezequiel — MIT' });
await MeshoptEncoder.ready;
await document.transform(weld(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write(path.join(target, 'assets/asteroid.glb'), document);
console.log('Original Meshopt-compressed GLB, PWA icons and local Basis decoder ready.');
