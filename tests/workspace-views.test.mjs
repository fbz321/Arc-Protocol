import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const checks = [
  ['renders the view navigation', /data-view-target="combat"/.test(html) && /data-view-target="repository"/.test(html) && /data-view-target="training"/.test(html)],
  ['renders three view containers', /id="viewCombat"/.test(html) && /id="viewRepository"/.test(html) && /id="viewTraining"/.test(html)],
  ['defaults to combat view', /activeView\s*:\s*['"]combat['"]/.test(html)],
  ['defines view switching', /function\s+setActiveView\s*\(/.test(html)],
  ['renders the training result list', /id="trainingResults"/.test(html)],
  ['keeps runtime-only training results', /trainingResults\s*:\s*\[\]/.test(html)],
  ['creates a training result snapshot', /trainingResults\.push\(/.test(html)],
  ['renders training result cards', /function\s+renderTrainingResults\s*\(/.test(html)],
  ['offers training-result focus action', /data-focus-training/.test(html) && /focusTrainingResult/.test(html)],
  ['keeps no persistence APIs', !/localStorage|sessionStorage|indexedDB/.test(html)]
];
const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing workspace-view contracts:\n- ' + failures.join('\n- '));
console.log('PASS ' + checks.length + ' workspace-view contracts');
