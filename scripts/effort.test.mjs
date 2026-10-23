import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Exercise the shipped source in memory; never emit or load the client bundle.
const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL('../src/composer-model.ts', import.meta.url))],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  write: false,
  logLevel: 'silent',
});
const { currentModel, effortView, nextEffortSelection } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`
);

const route = { provider: 'account/provider:α', model: 'shared-model/v3' };
// Opaque IDs deliberately do not sort into the provider's advertised order.
const efforts = [
  { id: 'budget:9', name: 'Gentle' },
  { id: 'budget:2', name: 'Standard' },
  { id: 'budget:13', name: 'Thorough' },
];
function directory({ reasoning = { efforts }, current = { ...route, reasoningEffort: 'budget:9' }, ...overrides } = {}) {
  return {
    current,
    routable: true,
    groups: [
      {
        id: 'other-provider',
        name: 'Another provider',
        models: [{ id: route.model, name: 'Same ID, different route', reasoning: { efforts: [{ id: 'foreign', name: 'Foreign' }] } }],
      },
      {
        id: route.provider,
        name: 'Account provider',
        models: [{ id: route.model, name: 'Selected model', ...(reasoning === null ? {} : { reasoning }) }],
      },
    ],
    failures: [],
    status: 'ready',
    pending: null,
    error: null,
    ...overrides,
  };
}

test('resolves the exact provider/model pair when providers share model IDs', () => {
  const state = directory();
  const selected = currentModel(state);
  assert.equal(selected.group, state.groups[1]);
  assert.equal(selected.model, state.groups[1].models[0]);
});

test('uses advertised opaque IDs, names and ordering, with localized Auto last', () => {
  const view = effortView(directory(), 'Provider default');
  assert.deepEqual(view.levels, [
    { id: 'budget:9', name: 'Gentle' },
    { id: 'budget:2', name: 'Standard' },
    { id: 'budget:13', name: 'Thorough' },
    { id: undefined, name: 'Provider default' },
  ]);
});

test('cycles all advertised levels, highest → omitted Auto → first, retaining the exact route', () => {
  let state = directory();
  const expectedSelections = [
    { ...route, reasoningEffort: 'budget:2' },
    { ...route, reasoningEffort: 'budget:13' },
    { ...route },
    { ...route, reasoningEffort: 'budget:9' },
  ];
  for (const expected of expectedSelections) {
    const before = structuredClone(state);
    const next = nextEffortSelection(state);
    assert.deepEqual(next, expected);
    assert.deepEqual(state, before, 'cycling must not mutate the current selection or catalog');
    if (!Object.hasOwn(expected, 'reasoningEffort')) {
      assert.equal(Object.hasOwn(next, 'reasoningEffort'), false, 'Auto must omit the property, not send undefined or a fabricated ID');
    }
    state = { ...state, current: next };
  }
});

test('an omitted effort without a configured default displays Auto and advances to the first level', () => {
  const state = directory({ current: { ...route } });
  assert.deepEqual(effortView(state, '自动').current, { id: undefined, name: '自动' });
  assert.deepEqual(nextEffortSelection(state), { ...route, reasoningEffort: 'budget:9' });
});

test('a configured default is effective on omission and never adds a synthetic Auto level', () => {
  const state = directory({ reasoning: { efforts, defaultEffort: 'budget:2' }, current: { ...route } });
  const view = effortView(state);
  assert.deepEqual(view.levels, efforts);
  assert.deepEqual(view.current, { id: 'budget:2', name: 'Standard' });
  assert.deepEqual(nextEffortSelection(state), { ...route, reasoningEffort: 'budget:13' });
  assert.deepEqual(nextEffortSelection({ ...state, current: { ...route, reasoningEffort: 'budget:13' } }), { ...route, reasoningEffort: 'budget:9' });
});

test('an explicitly saved effort takes precedence over a configured default', () => {
  const state = directory({ reasoning: { efforts, defaultEffort: 'budget:2' }, current: { ...route, reasoningEffort: 'budget:9' } });
  assert.deepEqual(effortView(state).current, { id: 'budget:9', name: 'Gentle' });
  assert.deepEqual(nextEffortSelection(state), { ...route, reasoningEffort: 'budget:2' });
});

test('one configured effort has no alternative cycle', () => {
  const state = directory({ reasoning: { efforts: [efforts[0]], defaultEffort: 'budget:9' } });
  assert.equal(effortView(state).levels.length, 1);
  assert.equal(nextEffortSelection(state), undefined);
});

test('one advertised effort without a configured default still cycles through omission', () => {
  const state = directory({ reasoning: { efforts: [efforts[0]] } });
  assert.deepEqual(nextEffortSelection(state), route);
  assert.deepEqual(nextEffortSelection({ ...state, current: { ...route } }), { ...route, reasoningEffort: 'budget:9' });
});

test('unsupported, missing and unavailable selections offer no effort action', () => {
  const cases = [
    ['no selection', directory({ current: null })],
    ['missing provider', directory({ current: { provider: 'removed', model: route.model } })],
    ['missing model', directory({ current: { provider: route.provider, model: 'removed' } })],
    ['no reasoning support', directory({ reasoning: null })],
    ['empty advertised efforts', directory({ reasoning: { efforts: [] } })],
    ['retained unavailable selection', directory({ groups: [], retainedEffort: 'Thorough', routable: false })],
  ];
  for (const [name, state] of cases) {
    assert.equal(effortView(state), undefined, name);
    assert.equal(nextEffortSelection(state), undefined, name);
  }
});

test('locked and explicitly unroutable selections cannot cycle', () => {
  assert.equal(nextEffortSelection(directory(), true), undefined);
  assert.equal(nextEffortSelection(directory({ routable: false })), undefined);
});

test('an in-flight selection blocks cycling and leaves the saved effort visible', () => {
  const state = directory({
    status: 'selecting',
    pending: { provider: 'other-provider', model: route.model, reasoningEffort: 'foreign' },
  });
  assert.equal(nextEffortSelection(state), undefined);
  assert.deepEqual(effortView(state).current, { id: 'budget:9', name: 'Gentle' });
  assert.deepEqual(state.current, { ...route, reasoningEffort: 'budget:9' });
});

test('a stale unknown saved effort recovers to the first advertised level', () => {
  const state = directory({ current: { ...route, reasoningEffort: 'removed-effort' } });
  assert.deepEqual(effortView(state).current, { id: 'removed-effort', name: 'removed-effort' });
  assert.deepEqual(nextEffortSelection(state), { ...route, reasoningEffort: 'budget:9' });
});
