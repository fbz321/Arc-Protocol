import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const checks = [
  ['renders DeepSeek, Kimi and MiniMax frames', /DeepSeek/.test(html) && /Kimi/.test(html) && /MiniMax/.test(html)],
  ['provides an isolated FX layer', /id="fxLayer"/.test(html) && /class="fx-layer"/.test(html)],
  ['defines three visual attack profiles', /var attackProfiles\s*=/.test(html) && /className:\s*'deepseek'/.test(html) && /className:\s*'kimi'/.test(html) && /className:\s*'minimax'/.test(html)],
  ['defines projectile and hit-ring styles', /\.projectile/.test(html) && /\.hit-ring/.test(html)],
  ['queues staggered attack animations', /function queueAttackSequence\s*\(/.test(html) && /index\s*\*\s*110/.test(html)],
  ['spawns DOM projectiles and hit feedback', /function spawnProjectile\s*\(/.test(html) && /function triggerHitFx\s*\(/.test(html)],
  ['keeps reduced-motion support', /prefers-reduced-motion\s*:\s*reduce/.test(html)],
  ['does not add persistence or remote art', !/localStorage/.test(html) && !/<img[^>]+https?:/i.test(html)]
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing animation contracts:\n- ' + failures.join('\n- '));
console.log('PASS ' + checks.length + ' animation contracts');
