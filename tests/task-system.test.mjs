import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const checks = [
  ['renders the task workspace view', /id="viewTasks"/.test(html)],
  ['renders a task list container', /id="taskList"/.test(html)],
  ['renders task summary', /id="taskSummary"/.test(html)],
  ['defines seven one-time task definitions', /function\s+taskDefinitions\s*\(\)[\s\S]*?protocol-onboarding[\s\S]*?first-observation[\s\S]*?first-training[\s\S]*?repository-record[\s\S]*?compute-lesson[\s\S]*?depth-two[\s\S]*?first-blueprint/.test(html)],
  ['stores claimed task state', /claimedTasks/.test(html)],
  ['defines getTaskStatus', /function\s+getTaskStatus\s*\(/.test(html)],
  ['defines manual claimTask', /function\s+claimTask\s*\(/.test(html)],
  ['guards duplicate claims', /claimedTasks[\s\S]*?return/.test(html)],
  ['defines ten guide steps', /guideSteps=\[[\s\S]*?resource[\s\S]*?allies[\s\S]*?enemy[\s\S]*?attack[\s\S]*?tick[\s\S]*?training[\s\S]*?config[\s\S]*?ratios[\s\S]*?preview[\s\S]*?repository[\s\S]*?\]/.test(html)],
  ['explains purpose in guide', /这个东西有什么用/.test(html)],
  ['renders guide reader', /id="guideReader"/.test(html)],
  ['supports guide replay', /data-task-action="replay"/.test(html)],
  ['contains four image placeholders', (html.match(/image-placeholder/g)||[]).length >= 4],
  ['image placeholders do not load remote assets', !/image-placeholder[\s\S]*?src=/.test(html)],
  ['does not use persistence APIs', !/localStorage|sessionStorage|indexedDB/.test(html)]
  ];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
assert.deepEqual(failures, [], 'Missing task-system contracts:\n- ' + failures.join('\n- '));
console.log('PASS ' + checks.length + ' task-system contracts');
