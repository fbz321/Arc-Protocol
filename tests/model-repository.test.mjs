import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const models = ['DeepSeek', 'Kimi', 'MiniMax'];
const dimensions = ['Bulwark', 'Vanguard', 'Marksman', 'Weaver', 'Conductor'];
const repository = html.match(/id="modelRepository"[\s\S]*?<\/section>/)?.[0] ?? html;

const checks = [
  ['renders the model repository container', /id="modelRepository"/.test(html)],
  ...models.map((model) => {
    const card = repository.match(new RegExp(String.raw`data-model-card="${model}"([\s\S]*?)(?=data-model-card="|<\/section>)`))?.[0] ?? '';
    return [
      'renders the ' + model + ' model card',
      card.includes('data-model-card="' + model + '"') &&
        /data-model-field="status"/.test(card) &&
        /data-model-field="hp"/.test(card) &&
        dimensions.every((dimension) => new RegExp('data-model-dimension="' + dimension + '"').test(card)) &&
        new RegExp('data-focus-model="' + model + '"').test(card)
    ];
  }),
  ['defines renderModelRepository', /function\s+renderModelRepository\s*\(/.test(html)],
  ['binds a focus listener to model controls', /addEventListener\(\s*['"]click['"][\s\S]*?(?:focusModel|modelFocus)/.test(html) && /focusModel/.test(html)],
  ['does not use localStorage', !/localStorage/.test(html)]
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing model-repository contracts:\n- ' + failures.join('\n- '));
console.log('PASS ' + checks.length + ' model-repository contracts');
