import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.equal(manifest.name, '@local/dsh-linear-ui');
assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml');
assert.equal(manifest.dsh.client.platform, 'web');
assert(!manifest.scripts?.postinstall && !manifest.scripts?.install, 'no installation scripts');
for (const relative of ['index.js','dist/client.js','cordis.patch.yml','icon.svg','locale/en.json','locale/zh.json','README.md','THIRD_PARTY_NOTICES.md']) assert((await stat(new URL(relative, root))).isFile(), relative);
for (const language of ['en','zh']) {
  const data = JSON.parse(await readFile(new URL(`locale/${language}.json`, root), 'utf8'));
  assert(data.meta.title.length > 0 && data.meta.description.length > 40);
}
const icon = await readFile(new URL('icon.svg', root), 'utf8');
assert(icon.startsWith('<svg') && icon.includes('viewBox="0 0 64 64"') && Buffer.byteLength(icon) < 262144);
const artifact = await readFile(new URL('dist/client.js', root), 'utf8');
assert(artifact.startsWith("window.__ModuleLoader__.load({id:'@local/dsh-linear-ui'"));
assert(!/REACTBITS_LICENSE_KEY|proxy\.collectui\.pro/.test(artifact), 'no secret references');
for (const file of ['client.ts','sidebar.tsx','chat.tsx','primitives.tsx','composer.tsx','composer-model.ts']) {
  const source = await readFile(new URL(`src/${file}`, root), 'utf8');
  assert(!/document\.body|innerHTML|querySelector/.test(source), `${file}: no host DOM mutation or scraping`);
}
const meta = JSON.parse(await readFile(new URL('dist/build-meta.json', root), 'utf8'));
assert(!Object.keys(meta.inputs).some(p => /node_modules\/(react|react-dom)\//.test(p)), 'React remains external');
assert(!Object.keys(meta.inputs).some(p => p.includes('@deepseek-ai/dsh-client')), 'no Harness implementation bundled');
const external = new Set(Object.values(meta.outputs).flatMap(o => o.imports.filter(i => i.external).map(i => i.path)));
assert.deepEqual(external, new Set(['react','react/jsx-runtime']));
assert.equal(manifest.engines.dsh, '0.2.1-rc.2', 'semantic composer layout is version-pinned');
console.log('Package, locale, icon and dependency isolation checks passed.');
const theme = await readFile(new URL('src/theme.ts', root), 'utf8');
const colors = Object.fromEntries([...theme.matchAll(/'([^']+)': \{ light: '(#[a-fA-F0-9]+)', dark: '(#[a-fA-F0-9]+)' \}/g)].map(m => [m[1], {light:m[2], dark:m[3]}]));
assert(Object.keys(colors).length >= 50, 'complete semantic color coverage');
// DSH_ROOT is the installation root containing DSH's node_modules directory.
// A supplied but invalid installation fails verification rather than silently skipping.
const dshRoot = process.env.DSH_ROOT;
if (dshRoot) {
  const nativeRoot = resolve(dshRoot, 'node_modules', '@deepseek-ai');
  const [nativeComposer, nativeTheme] = await Promise.all([
    readFile(join(nativeRoot, 'dsh-client-ui-conversation', 'lib', 'client.js'), 'utf8'),
    readFile(join(nativeRoot, 'dsh-client-ui-theme', 'lib', 'client.js'), 'utf8'),
  ]);
  for (const marker of ['data-composer-card','data-composer-dock']) assert(nativeComposer.includes(`"${marker}"`), `${marker}: installed semantic composer marker`);
  for (const [, name] of theme.matchAll(/'(--[^']+)': \{/g)) assert(nativeTheme.includes(name), `${name}: must exist in the installed native theme`);
  console.log('Installed native composer and theme contract checks passed (DSH_ROOT).');
} else {
  console.log('SKIPPED native composer and theme contract checks: DSH_ROOT is unset or empty; no local DSH installation requested.');
}
function luminance(hex) { const rgb = hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4); return rgb[0]*0.2126 + rgb[1]*0.7152 + rgb[2]*0.0722; }
for (const mode of ['light','dark']) {
  let min = Infinity;
  for (const label of ['--dsw-alias-label-primary','--dsw-alias-label-secondary']) for (const surface of ['--dsw-alias-bg-base','--dsw-alias-bg-layer-1','--dsw-specific-sidebar-fill','--dsw-specific-bubble','--dsw-specific-input-major','--dsw-alias-markdown-code-block']) {
    const a=luminance(colors[label][mode]),b=luminance(colors[surface][mode]);
    const contrast=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); min=Math.min(min,contrast);
    assert(contrast>=4.5, `${mode} ${label} on ${surface}: ${contrast}`);
  }
  console.log(`${mode} text contrast: minimum ${min.toFixed(2)}:1`);
}
const backupUrl = new URL('../native-backup/0.2.1-rc.2/manifest.json', root);
let baseline;
try { baseline = JSON.parse(await readFile(backupUrl,'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (baseline) {
  for (const file of baseline.files) assert.equal(createHash('sha256').update(await readFile(file.target)).digest('hex'), file.originalHash, `${file.name} official artifact`);
  console.log(`All ${baseline.files.length} official client artifacts match their original SHA-256.`);
} else console.log('Official artifact baseline is workspace-specific; not available here.');
