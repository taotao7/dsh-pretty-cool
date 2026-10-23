import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
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
const artifact = `window.__ModuleLoader__.load({id:'@local/dsh-linear-ui',factory(require){const module={exports:{}};const exports=module.exports;\n${code}\nreturn module.exports;}});\n`;
const inputs = Object.keys(result.metafile.inputs);
if (inputs.some(p => /node_modules\/(?:react|react-dom)\//.test(p))) throw new Error('Duplicate React runtime');
if (inputs.some(p => p.includes('@deepseek-ai/dsh-client'))) throw new Error('Forbidden Harness implementation import');
if (artifact.includes('REACTBITS_LICENSE_KEY')) throw new Error('Unexpected secret configuration identifier');
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/client.js', import.meta.url), artifact);
await writeFile(new URL('../dist/build-meta.json', import.meta.url), JSON.stringify(result.metafile, null, 2) + '\n');
console.log(`Built ${(Buffer.byteLength(artifact)/1024).toFixed(1)} KiB; host-provided React; Motion bundled.`);
console.log('External modules:', [...new Set(Object.values(result.metafile.outputs).flatMap(o => o.imports.filter(i => i.external).map(i => i.path)))].join(', '));
