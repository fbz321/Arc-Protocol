# 《魔导协议》模型仓库与清晰化界面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重排单页信息层级，新增 DeepSeek/Kimi/MiniMax 模型仓库与素体管理卡片，同时保持后训练、攻击动画和核心战斗数值不变。

**Architecture:** 在现有 `index.html` 单文件结构中增加模型仓库 DOM 区域和卡片样式；通过新的运行时渲染函数从 `state.vector`、`state.battle` 与训练结果读取数据，聚焦状态只影响展示高亮。保持现有战斗与训练函数作为数据源，不引入外部依赖或拆分运行时。

**Tech Stack:** 原生 HTML、CSS、内联 JavaScript、Node.js `node:test` 契约测试。

## Global Constraints

- 不使用 localStorage、sessionStorage、IndexedDB、外部 CDN、远程图片或网络模型接口。
- 保持 `P(d) = 100 * 1.15^(d-1)`、`C(d) = 2 * 1.10^(d-1)`，深度限定 d1-d15。
- 预览只读；真正训练后才修改 `state.vector`。
- 模型聚焦只改变 UI，不改变战斗伤害、治疗、胜负、训练配比或指令。
- 移动端不得横向溢出；保留每次攻击动画、伤害数字、治疗数字和 tick 战报。
- 每个任务先增加会失败的契约测试，再写最小实现并运行完整回归。

## 文件地图

- Modify: `index.html` — 页面层级、模型仓库卡片、响应式样式、模型仓库渲染和聚焦交互。
- Modify: `tests/model-repository.test.mjs` — 模型仓库 DOM、渲染函数、聚焦事件和数据边界契约。
- Modify: `tests/training-growth.test.mjs` — 确保后训练区仍存在并与仓库刷新链路连接。
- Create: `docs/superpowers/specs/2026-10-01-arc-protocol-model-repository-ui-design.md` — 已批准的设计规格。

### Task 1: 模型仓库契约测试

**Files:**
- Create/Modify: `tests/model-repository.test.mjs`
- Test target: `index.html`

**Interfaces:**
- Required DOM: `#modelRepository`, `[data-model-card="DeepSeek"]`, `[data-model-card="Kimi"]`, `[data-model-card="MiniMax"]`, `#modelFocus`. 
- Required functions: `renderModelRepository`, `focusModel` or equivalent click handler. 

- [ ] **Step 1: Write failing contract assertions**
  - Assert the repository container and three named cards exist.
  - Assert each card exposes status, HP, five dimensions, and a focus control.
  - Assert `renderModelRepository` exists.
  - Assert a click listener or focus handler updates a model focus element without using storage.
- [ ] **Step 2: Run the focused test and confirm it fails**
  - Run: `node --test tests/model-repository.test.mjs`
  - Expected: FAIL because the new repository contracts are not present yet.

### Task 2: 模型仓库 HTML/CSS 与信息层级

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces repository DOM consumed by `renderModelRepository`.
- Preserves existing IDs used by battle, training, report and export flows.

- [ ] **Step 1: Add semantic repository markup**
  - Add a section title and explanatory note.
  - Add three cards keyed by `data-model-card` with model name, code, status, HP, role, dimension rows, contribution summary, and focus button.
  - Add a small `#modelFocus` status line for the currently focused card.
- [ ] **Step 2: Add clarity-first layout styles**
  - Use an explicit workbench grid with repository and battle columns.
  - Increase section hierarchy and value contrast.
  - Use minmax(0, 1fr) and a one-column mobile breakpoint.
  - Keep existing brand geometry self-contained with CSS; no external icons.
- [ ] **Step 3: Run focused contract test**
  - Run: `node --test tests/model-repository.test.mjs`
  - Expected: DOM/style contracts pass except runtime rendering contracts if not yet implemented.

### Task 3: 模型仓库运行时渲染与聚焦

**Files:**
- Modify: `index.html`
- Modify: `tests/model-repository.test.mjs` if a contract needs a more precise implementation assertion.

**Interfaces:**
- `renderModelRepository()` reads the current runtime state and updates all three cards.
- `focusModel(modelKey)` updates only the focused key and `.is-focused` / `#modelFocus` UI.
- `renderAll()` and successful `executeTraining()` call `renderModelRepository()`.

- [ ] **Step 1: Add failing runtime/static assertions**
  - Assert the renderer references `state.vector` and `state.battle` rather than hard-coded battle values.
  - Assert successful training refreshes the repository through `renderAll()` or an explicit renderer call.
  - Assert the focus handler does not mutate `state.vector` or `state.command`.
- [ ] **Step 2: Implement model data mapping**
  - Map the three battle allies by index to DeepSeek, Kimi and MiniMax.
  - Show live HP/status when `state.battle` exists; otherwise show待命.
  - Compute five dimension bars from the real vector relative to current capacity.
  - Show training delta from `state.lastTrainingResult` where available.
- [ ] **Step 3: Implement focus-only interaction**
  - Store focus in an in-memory `state.focusedModel` defaulting to DeepSeek.
  - Add click listeners to each focus button.
  - Update card class and `#modelFocus` copy without touching combat data.
- [ ] **Step 4: Connect refresh points**
  - Call `renderModelRepository()` from `renderAll()`.
  - Refresh after battle ticks so HP and status remain readable.
  - Refresh after training success and when replaying battle.
- [ ] **Step 5: Run focused and existing tests**
  - Run: `node --test tests/model-repository.test.mjs tests/training-growth.test.mjs tests/animation.test.mjs`.

### Task 4: 清晰度回归与最终验证

**Files:**
- Modify: `index.html` only if a review issue is found.
- Modify: tests only if a missing contract is discovered.

- [ ] **Step 1: Check static constraints**
  - Confirm no localStorage/sessionStorage/IndexedDB, external scripts, remote resources, or changed P/C formulas.
  - Confirm d1-d15 and existing animation hooks remain.
- [ ] **Step 2: Check syntax and full tests**
  - Extract inline script and run `node --check`.
  - Run all available tests under `tests/*.test.mjs`.
- [ ] **Step 3: Review responsive boundaries**
  - Confirm repository/battle grid collapses on mobile and no fixed-width child exceeds viewport.
- [ ] **Step 4: Update post-training documentation**
  - Add one paragraph to `docs/superpowers/specs/2026-10-01-arc-protocol-post-training-design.md` noting repository refresh after training.
