import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const hasInputListener = /addEventListener\(\s*['"]input['"]/.test(html);
const inputEventHandlerBodies = [...html.matchAll(/addEventListener\(\s*['"]input['"]\s*,\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\}\s*\)/g)].map(([, body]) => body);
const inputHandlerCallsPreviewDirectly = inputEventHandlerBodies.some((body) => /renderTrainingPreview\s*\(\s*\)/.test(body));
const inputHandlerCallsRatioProcessor = inputEventHandlerBodies.some((body) => /\bonRatioInput\s*\(/.test(body));
const ratioProcessorBodies = [...html.matchAll(/function\s+onRatioInput\s*\([^)]*\)\s*\{([\s\S]*?)\}/g)].map(([, body]) => body);
const ratioProcessorCallsPreview = ratioProcessorBodies.some((body) => /renderTrainingPreview\s*\(\s*\)/.test(body));
const hasInputPreviewChain = inputHandlerCallsPreviewDirectly || (inputHandlerCallsRatioProcessor && ratioProcessorCallsPreview);
const dimensions = ['Bulwark', 'Vanguard', 'Marksman', 'Weaver', 'Conductor'];

const checks = [
  ['renders the training preview container', /id="trainingPreview"/.test(html)],
  ['renders the growth rows container', /id="growthRows"/.test(html)],
  ...dimensions.map((dimension) => [
    'labels the ' + dimension + ' growth dimension',
    new RegExp('data-dimension="' + dimension + '"').test(html)
  ]),
  ['renders the capacity marker', /class="capacity-marker"/.test(html)],
  ['renders the training result container', /id="trainingResult"/.test(html)],
  ['defines renderTrainingPreview', /function\s+renderTrainingPreview\s*\(/.test(html)],
  ['defines renderTrainingResult', /function\s+renderTrainingResult\s*\(/.test(html)],
  ['binds an input event listener', hasInputListener],
  ['connects input handling to renderTrainingPreview()', hasInputPreviewChain],
  ['clears stale training result on failed execution', /if\s*\(points<=0\)[\s\S]*?trainingResult[\s\S]*?(?:hidden|classList\.remove)/.test(html)],
  ['does not use localStorage', !/localStorage/.test(html)]
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing training-growth contracts:\n- ' + failures.join('\n- '));
console.log('PASS ' + checks.length + ' training-growth contracts');
