import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const checks = [
  ['renders the onboarding guide', /id="onboardingGuide"/.test(html) && /协议入门/.test(html)],
  ['renders guide progress', /id="guideProgress"/.test(html) && /协议入门/.test(html)],
  ['defines guide runtime state', /guide\s*:\s*\{/.test(html) && /step\s*:\s*0/.test(html)],
  ['defines guide rendering', /function\s+renderGuide\s*\(/.test(html)],
  ['defines guide advancement', /function\s+advanceGuide\s*\(/.test(html)],
  ['defines guide skip action', /function\s+skipGuide\s*\(/.test(html)],
  ['defines guide replay action', /function\s+replayGuide\s*\(/.test(html)],
  ['binds guide targets', /data-guide-target="training"/.test(html) && /data-guide-target="train"/.test(html) && /data-guide-target="repository"/.test(html)],
  ['advances after training', /state\.guide\.completed/.test(html) && /executeTraining/.test(html)],
  ['keeps guide runtime-only', !/localStorage|sessionStorage|indexedDB/.test(html)]
];
const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing onboarding-guide contracts:\n- ' + failures.join('\n- '));
console.log('PASS ' + checks.length + ' onboarding-guide contracts');
