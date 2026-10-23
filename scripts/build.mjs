import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({
  absWorkingDir: root, entryPoints: ['src/client.ts'], bundle: true, write: false,
  format: 'cjs', platform: 'browser', target: ['chrome110', 'safari16'],
  jsx: 'transform', external: ['react', 'react-dom'], loader: { '.css': 'text' },
  minify: true, legalComments: 'inline', metafile: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
const code = result.outputFiles[0].text;
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (typeof manifest.name !== 'string' || !manifest.name) throw new Error('package.json name is required for client registration');
// The web profile still mounts the pre-rename package. The host keys the factory
// by that package name, so the same client must register both identities.
const registrationIds = [...new Set([manifest.name, '@local/dsh-linear-ui'])];
const calls = registrationIds.map((id) => `window.__ModuleLoader__.load({id:${JSON.stringify(id)},factory});`).join('');
const artifact = `function factory(require){const module={exports:{}};const exports=module.exports;\n${code}\nreturn module.exports;}${calls}\n`;
const inputs = Object.keys(result.metafile.inputs);
if (inputs.some(p => /node_modules\/(?:react|react-dom)\//.test(p))) throw new Error('Duplicate React runtime');
if (inputs.some(p => p.includes('@deepseek-ai/dsh-client'))) throw new Error('Forbidden Harness implementation import');
if (artifact.includes('REACTBITS_LICENSE_KEY')) throw new Error('Unexpected secret configuration identifier');
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/client.js', import.meta.url), artifact);
await writeFile(new URL('../dist/build-meta.json', import.meta.url), JSON.stringify(result.metafile, null, 2) + '\n');
console.log(`Built ${(Buffer.byteLength(artifact)/1024).toFixed(1)} KiB; host-provided React; Motion bundled.`);
console.log('External modules:', [...new Set(Object.values(result.metafile.outputs).flatMap(o => o.imports.filter(i => i.external).map(i => i.path)))].join(', '));
