import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = html.match(/<style id="portrait-ui">([\s\S]*?)<\/style>/)?.[1] || '';
const checks = [
  ['separates portrait presentation rules', Boolean(css)],
  ['centers a 480px portrait shell', /\.app\s*\{[^}]*max-width:480px/.test(css)],
  ['anchors four navigation items', /\.view-nav\s*\{[^}]*position:fixed[^}]*grid-template-columns:repeat\(4,/.test(css)],
  ['reserves bottom navigation and safe area', /padding-bottom:[^;]*env\(safe-area-inset-bottom/.test(css)],
  ['places enemies above the link and allies', /\.enemy-zone\s*\{[^}]*grid-row:1/.test(css) && /\.team\s*\{[^}]*grid-row:3/.test(css)],
  ['offers collapsible resource details', /<details[^>]*id="resourceDetails"/.test(html)],
  ['collapses full battle log by default', /<details[^>]*id="battleLogDetails"(?![^>]*\bopen\b)/.test(html)],
  ['keeps a live battle log summary', /id="battleLogSummary"/.test(html)],
  ['offers compact expandable onboarding', /<details[^>]*id="onboardingGuide"/.test(html)],
  ['keeps navigation labels and vector icons', (html.match(/class="nav-icon"/g) || []).length === 4],
  ['provides training access from failure report', /id="reportTrainingBtn"/.test(html)],
  ['uses three columns for command touch controls', /\.commands\s*\{[^}]*grid-template-columns:repeat\(3,/.test(css)],
  ['preserves reduced-motion support', /prefers-reduced-motion:reduce/.test(html)],
  ['keeps all original resource bindings', ['capacityValue','writtenValue','logsValue','computeValue'].every(id => html.includes('id="'+id+'"'))],
  ['orders training from setup to execution', (() => { const ids=['id="trainingConfig"','id="bulwarkRange"','class="commands"','id="trainingPreview"','id="trainBtn"']; const positions=ids.map(id=>html.indexOf(id)); return positions.every(pos=>pos>=0) && positions.every((pos,index)=>index===0 || pos>positions[index-1]); })()],
  ['collapses advanced growth and diagnostics', /<details[^>]*id="growthDetails"/.test(html) && /<details[^>]*id="diagnosticsDetails"/.test(html)],
  ['collapses model dimensions per card', (html.match(/class="model-detail"/g) || []).length === 3],
  ['opens folded guide targets when needed', /closest\(['"]details['"]\)[\s\S]*?open\s*=\s*true/.test(html)],
  ['updates and clears the log summary', /battleLogSummary/.test(html) && /function appendLog[\s\S]*?battleLogSummary/.test(html) && /function clearLog[\s\S]*?battleLogSummary/.test(html)],
  ['groups claimed missions behind disclosure', /id="claimedTaskDetails"/.test(html)],
  ['sorts missions by action priority', /function\s+taskPriority\s*\(/.test(html)],
  ['binds the report training shortcut', /reportTrainingBtn[\s\S]*?setActiveView\(['"]training['"]\)/.test(html)],
  ['keeps battle summary in a compact portrait viewport', /\.arena-body\s*\{[^}]*grid-template-rows:auto 52px auto[^}]*min-height:316px/.test(css)],
  ['lets the enemy panel occupy the full grid track', /\.enemy-zone\s*\{[^}]*grid-template-columns:minmax\(0,1fr\)/.test(css)],
  ['gives the encounter a legible visual focal point', /\.enemy-zone \.unit\s*\{[^}]*max-width:292px/.test(css) && /\.enemy-sigil\s*\{[^}]*width:56px/.test(css) && /\.enemy \.unit-name\s*\{[^}]*font-size:15px/.test(css)],
  ['raises mobile control and status typography', /\.view-tab\s*\{[^}]*font-size:11px/.test(css) && /\.battle-status\s*\{[^}]*font-size:12px/.test(css)],
  ['keeps the 320px resource summary on one line', /@media\(max-width:350px\)[\s\S]*?\.resource-primary>span\s*\{[^}]*white-space:nowrap/.test(css) && /@media\(max-width:350px\)[\s\S]*?\.disclosure-label\s*\{[^}]*display:none/.test(css)],
  ['keeps narrow ally labels readable without shrinking their sigils', /@media\(max-width:350px\)[\s\S]*?\.team \.unit\{[^}]*padding-left:3px;padding-right:3px/.test(css) && /@media\(max-width:350px\)[\s\S]*?\.team \.unit-header\{[^}]*gap:4px/.test(css)],
  ['preserves a narrow-screen encounter layout', /@media\(max-width:350px\)[\s\S]*?\.enemy-zone \.unit\s*\{[^}]*max-width:100%/.test(css)]
];
assert.deepEqual(checks.filter(([,ok]) => !ok).map(([name]) => name), [], 'Missing portrait UI contracts');
console.log('PASS '+checks.length+' portrait UI contracts');
