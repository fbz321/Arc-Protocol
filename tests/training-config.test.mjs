import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const checks = [
  ['renders a compute resource metric', /id="computeValue"/.test(html) && /算力/.test(html)],
  ['renders base-model choices', /data-training-field="baseModel"/.test(html) && /DeepSeek/.test(html) && /Kimi/.test(html) && /MiniMax/.test(html)],
  ['renders training method choices', /data-training-field="method"/.test(html) && /SFT/.test(html) && /DPO/.test(html) && /RFT/.test(html)],
  ['renders training round choices', /data-training-field="rounds"/.test(html) && /value="1"/.test(html) && /value="3"/.test(html) && /value="5"/.test(html) && /value="8"/.test(html)],
  ['renders benchmark choices', /data-training-field="benchmark"/.test(html) && /ARC-Reason/.test(html) && /ARC-Frontline/.test(html) && /ARC-Signal/.test(html)],
  ['defines training configuration state', /trainingConfig\s*:\s*\{/.test(html) && /baseModel\s*:/.test(html) && /method\s*:/.test(html) && /rounds\s*:/.test(html) && /benchmark\s*:/.test(html)],
  ['defines compute state and capacity', /compute\s*:/.test(html) && /computeCapacity\s*\(/.test(html) && /60\s*\+\s*12/.test(html)],
  ['defines compute cost calculation', /computeCost\s*\(/.test(html) && /methodMultiplier/.test(html) && /roundMultiplier/.test(html) && /benchmarkCost/.test(html)],
  ['shows compute cost in training preview', /previewComputeCost/.test(html) && /算力消耗/.test(html)],
  ['guards training when compute is insufficient', /computeEnough/.test(html) && /trainBtn[\s\S]*disabled/.test(html) && /算力不足/.test(html)],
  ['deducts compute after successful training', /state\.compute\s*-=/.test(html)],
  ['records training configuration in repository result', /baseModel:\s*state\.trainingConfig\.baseModel/.test(html) && /method:\s*state\.trainingConfig\.method/.test(html) && /rounds:\s*state\.trainingConfig\.rounds/.test(html) && /benchmark:\s*state\.trainingConfig\.benchmark/.test(html) && /computeCost/.test(html)],
  ['restores compute after battle settlement', /function\s+finishBattle\s*\(/.test(html) && /computeRecovery/.test(html) && /state\.compute\s*=/.test(html)],
  ['caps recovered compute at capacity', /Math\.min\s*\(\s*computeCapacity\(state\.depth\)/.test(html)],
  ['does not use persistence APIs', !/localStorage|sessionStorage|indexedDB/.test(html)]
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing training-config contracts:\\n- ' + failures.join('\\n- '));
console.log('PASS ' + checks.length + ' training-config contracts');
