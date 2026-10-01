import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const checks = [
  ['tracks the active training result', /activeTrainingId\s*:\s*null/.test(html)],
  ['defines applyTrainingResult', /function\s+applyTrainingResult\s*\(/.test(html)],
  ['generates a candidate vector before storing a result', /candidateVector\s*=\s*Object\.assign\(\{\},\s*state\.vector\)/.test(html) && /vector:\s*candidateVector/.test(html)],
  ['keeps candidate results distinct', /trainingResults\.push\(/.test(html) && /status:\s*['"]候选['"]/.test(html)],
  ['renders an apply action for each result', /data-apply-training/.test(html) && /应用到当前协议/.test(html)],
  ['binds the apply action', /querySelectorAll\(\s*['"]\[data-apply-training\]['"]\s*\)/.test(html) && /applyTrainingResult\(this\.getAttribute\(['"]data-apply-training['"]\)\)/.test(html)],
  ['marks the applied result separately from focus', /state\.activeTrainingId\s*=\s*id/.test(html) && /state\.focusedTrainingId\s*=\s*id/.test(html)],
  ['applies saved configuration without charging again', /state\.vector\s*=\s*Object\.assign\(\{\},\s*result\.vector\)/.test(html) && /function\s+applyTrainingResult[\s\S]*?renderAll\(\)[\s\S]*?startBattle\(\)/.test(html)],
  ['does not persist training results', !/localStorage|sessionStorage|indexedDB/.test(html)]
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing selectable training-result contracts:\n- ' + failures.join('\n- '));
console.log('PASS ' + checks.length + ' selectable training-result contracts');
