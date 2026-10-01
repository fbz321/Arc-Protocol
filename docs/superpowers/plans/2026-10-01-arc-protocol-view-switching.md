# View Switching and Training Result Repository Implementation Plan

> For agentic workers: use task-by-task execution with a fresh test checkpoint for every task. Steps use checkbox syntax for tracking.

Goal: Turn the single long page into three in-page views—combat, model repository, and post-training—and add every successful training result to the current-session repository.

Architecture: Keep the existing single-file prototype and runtime state. Add state.activeView, three view containers, and navigation buttons that only toggle visibility and active styling. Add a runtime-only state.trainingResults array; successful training creates snapshot records rendered alongside the three built-in model cards.

Tech Stack: Plain HTML, CSS, inline vanilla JavaScript, Node.js built-in test runner, no dependencies or remote assets.

## Global Constraints

- Preserve P(d) = 100 * 1.15^(d-1) and C(d) = 2 * 1.10^(d-1).
- Restrict depth options to d1-d15.
- Do not add localStorage, sessionStorage, indexedDB, CDN, remote scripts, remote images, or network model APIs.
- Training preview must not mutate state.vector; only successful execution may write points.
- View switching and repository focus must not change battle damage, battle outcome, command, ratios, or vector values.
- Training results exist only for the current page session and clear on refresh.
- Preserve attack animation, floating damage, tick battle log, recognition-solidification warning, stuck report, and blueprint JSON export.

---

### Task 1: Add failing contracts for views and training-result records

Files:
- Create: tests/workspace-views.test.mjs
- Read: index.html

Interfaces:
- Consumes: current HTML structure and inline runtime script.
- Produces: executable contracts for navigation, isolated views, runtime training-result state, and repository rendering.

- [x] Step 1: Write the failing test

Create tests/workspace-views.test.mjs:

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
    assert.deepEqual(failures, [], 'Missing workspace-view contracts:\\n- ' + failures.join('\\n- '));
    console.log('PASS ' + checks.length + ' workspace-view contracts');

- [x] Step 2: Run the new test and verify it fails

Run: node --test tests/workspace-views.test.mjs
Expected: FAIL because the current file has no three-view navigation, no activeView, no trainingResults, and no training-result renderer.

- [x] Step 3: Do not change production code yet

Record the failing contract names and use them as the minimum implementation boundary.

### Task 2: Add the three-view shell and make combat the primary screen

Files:
- Modify: index.html markup near the header and existing model repository and training sections.
- Modify: index.html CSS near layout and responsive rules.

Interfaces:
- Consumes: existing combat markup, model repository markup, and training markup.
- Produces: nav[data-view-nav], buttons with data-view-target, and containers #viewCombat, #viewRepository, #viewTraining.

- [x] Step 1: Add navigation markup

    <nav class="view-nav" data-view-nav aria-label="协议工作区">
      <button class="view-tab active" type="button" data-view-target="combat" aria-selected="true">作战中</button>
      <button class="view-tab" type="button" data-view-target="repository" aria-selected="false">模型仓库</button>
      <button class="view-tab" type="button" data-view-target="training" aria-selected="false">后训练</button>
    </nav>

Wrap the current content in three panels. Combat is visible initially, while repository and training have hidden. Keep existing IDs used by render functions unchanged.

- [x] Step 2: Add view layout styles

    .workspace-shell{min-height:520px}
    .workspace-view{animation:view-enter .24s ease both}
    .workspace-view[hidden]{display:none!important}
    .view-nav{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:18px 0 22px;padding:5px;border:1px solid var(--line);background:rgba(8,14,24,.72)}
    .view-tab{position:relative;border:1px solid transparent;background:transparent;color:var(--muted);padding:11px 12px;font:600 12px "SFMono-Regular",Consolas,monospace;letter-spacing:.08em;cursor:pointer}
    .view-tab.active{color:var(--cyan);background:rgba(81,224,207,.08);border-color:rgba(81,224,207,.35)}
    .view-tab.active:after{content:"";position:absolute;left:16%;right:16%;bottom:-6px;height:2px;background:var(--cyan)}
    @keyframes view-enter{from{opacity:.45;transform:translateY(4px)}to{opacity:1;transform:none}}

- [x] Step 3: Keep only compact combat summary in the combat view

Leave the resource strip, battle stage, model status summary, current protocol summary, and battle log in #viewCombat. Move the full training form to #viewTraining and the repository cards to #viewRepository. Add a link-style button with data-view-target="training" near the protocol summary.

- [x] Step 4: Run syntax and existing tests

Extract the inline script and run node --check .tmp-inline-check.js. Then run all existing tests plus the new test. Existing suites must remain green; the new runtime contracts may still be red.

### Task 3: Add runtime view switching without changing game state

Files:
- Modify: index.html inline script near state, renderAll, and init.

Interfaces:
- Consumes: data-view-target buttons and the three view containers.
- Produces: setActiveView(view) and state.activeView.

- [x] Step 1: Extend state

Add activeView:'combat', focusedTrainingId:null, and trainingResults:[] to the state initializer while keeping focusedModel:'DeepSeek'.

- [x] Step 2: Implement isolated switching

    function setActiveView(view){
      var allowed=['combat','repository','training'];
      if(allowed.indexOf(view)<0)return;
      state.activeView=view;
      document.querySelectorAll('[data-view]').forEach(function(panel){
        var active=panel.getAttribute('data-view')===view;
        panel.hidden=!active;
        panel.classList.toggle('is-active',active);
      });
      document.querySelectorAll('[data-view-target]').forEach(function(button){
        var active=button.getAttribute('data-view-target')===view;
        if(button.classList.contains('view-tab')){
          button.classList.toggle('active',active);
          button.setAttribute('aria-selected',String(active));
        }
      });
    }

This function must not call startBattle, tickBattle, or executeTraining and must not write vector, command, or ratios.

- [x] Step 3: Bind navigation clicks

In init(), bind every data-view-target button to setActiveView(this.getAttribute('data-view-target')), then call setActiveView(state.activeView) after renderAll().

- [x] Step 4: Run the focused test

Run node --test tests/workspace-views.test.mjs. Navigation, containers, default view, and switching contracts should pass; result-record contracts remain red.

### Task 4: Record every successful training result and render it in the repository

Files:
- Modify: index.html markup in #viewRepository.
- Modify: index.html CSS for training-result cards and empty state.
- Modify: index.html inline script near renderModelRepository, executeTraining, and focusModel.

Interfaces:
- Consumes: state.vector, state.ratios, state.command, state.depth, capacity(), and executeTraining().
- Produces: renderTrainingResults(), focusTrainingResult(id), state.trainingResults records, and data-focus-training buttons.

- [x] Step 1: Add the repository results region

    <section class="repository-block" aria-labelledby="trainingResultsHeading">
      <div class="section-head compact-head">
        <div><div class="eyebrow">SESSION BUILDS / TRAINING OUTPUT</div><h2 id="trainingResultsHeading">训练结果</h2></div>
        <span class="mono" id="trainingResultCount">0 条</span>
      </div>
      <div id="trainingResults" class="training-results-grid">
        <div class="repository-empty" id="trainingResultsEmpty">还没有训练结果。前往“后训练”执行一次训练，结果会自动进入仓库。</div>
      </div>
    </section>

- [x] Step 2: Create a runtime snapshot after successful training

After the existing successful vector write in executeTraining(), push a record:

    var resultId='train-'+Date.now()+'-'+(state.trainingResults.length+1);
    state.trainingResults.push({
      id:resultId,
      createdAt:Date.now(),
      depth:state.depth,
      capacity:capacity(state.depth),
      ratios:{Bulwark:state.ratios.Bulwark,Weaver:state.ratios.Weaver,Conductor:state.ratios.Conductor},
      command:state.command,
      points:points,
      vector:Object.assign({},state.vector),
      status:'已写入'
    });
    state.focusedTrainingId=resultId;

The snapshot must represent the post-write vector and must remain runtime-only.

- [x] Step 3: Render result cards

Add renderTrainingResults() that renders the empty state when no records exist and otherwise renders one card per record with depth, ratios, command, points, five-dimensional vector, status, and a data-focus-training button. Use textContent or escaped values for runtime values.

focusTrainingResult(id) only changes focusedTrainingId, rerenders repository and combat summary, and does not alter vector, battle, command, or ratios.

- [x] Step 4: Integrate repository rendering

Keep renderModelRepository() responsible for built-in model cards and renderTrainingResults(). Call it from renderAll(), startBattle(), tickBattle(), and after successful training.

- [x] Step 5: Add result-card visual states

Add styles for training-results-grid, training-result-card, result-tag, repository-empty, and training-result-card.is-focused. Use the existing dark cyan/amber palette and a one-column fallback under 760px.

- [x] Step 6: Run focused tests

Run node --test tests/workspace-views.test.mjs tests/model-repository.test.mjs tests/training-growth.test.mjs. All focused tests must pass.

### Task 5: Finish integration and regression verification

Files:
- Modify: index.html only for integration fixes discovered by tests.
- Modify: tests/workspace-views.test.mjs only if assertions need to match the approved semantic structure.

- [x] Step 1: Run all tests

    node --test tests/model-repository.test.mjs tests/training-growth.test.mjs tests/animation.test.mjs tests/workspace-views.test.mjs

Expected: all four test files pass with zero failures.

- [x] Step 2: Re-run inline script syntax validation

Extract the inline script to .tmp-inline-check.js, run node --check .tmp-inline-check.js, then delete the temporary file.

- [x] Step 3: Run static constraint checks

Verify zero occurrences of localStorage, sessionStorage, indexedDB, remote http(s) URLs, or external script src attributes while retaining P/C formulas, d1-d15, Date.now(), attack animation functions, battle report, and blueprint export.

- [x] Step 4: Verify the repository lifecycle

Confirm the code path is: initial load shows combat -> training execution writes vector -> training result is pushed -> repository renderer shows the card -> focus changes only focus state -> returning to combat leaves battle state and vector intact.

- [x] Step 5: Remove temporary files and report evidence

Ensure no .tmp-* files remain. Report test counts, syntax status, and browser-automation limitations separately from application-code status.
