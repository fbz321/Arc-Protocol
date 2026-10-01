# 《魔导协议》单页原型 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 在一个独立的 index.html 中完成《魔导协议》可直接打开的放置游戏原型。

**Architecture:** 单文件 HTML 包含语义化结构、内联 CSS 和原生 JavaScript。状态集中在一个 state 对象中，渲染函数将状态同步到 DOM；训练、离线产出、战斗、评估报告和蓝图导出都是独立函数，避免引入构建工具或第三方依赖。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、Clipboard API（带降级反馈）。

## Global Constraints
- 页面必须不依赖外部资源，不使用美术图片、存档、抽卡。
- 协议深度只做 d1–d15。
- P(d)=100*1.15^(d-1)，C(d)=2*1.10^(d-1)。
- 离线库存按 Date.now() 模拟，产率 400/小时，封顶 8 小时。
- 滑杆配比和为 100%，指令为破阵/护卫/共鸣。

### Task 1: Create the single-page shell
**Files:** Create index.html.
- [ ] Add top resource strip, battle arena, training panel, dimension diagnostics, report area, and live region for toast/alerts.
- [ ] Add all controls with labels and keyboard-accessible focus states.
- [ ] Add responsive CSS with protocol-terminal visual direction.

### Task 2: Add state, formulas, and offline inventory
**Files:** Modify index.html inline script.
- [ ] Define P(depth), C(depth), formatNumber, getOfflineHours, and collectLogs.
- [ ] Keep lastCollectedAt in memory only; initialize it so the first visit has a small deterministic starter inventory.
- [ ] Render capacity, spent points, remaining capacity, and inventory.

### Task 3: Add training controls and blueprint export
**Files:** Modify index.html inline script.
- [ ] Implement three linked range inputs with clamped 0–100 values and sum-preserving redistribution.
- [ ] Implement command selection and execute-training validation against available logs/capacity.
- [ ] Update five-dimension vector and detect > 0.5 * P cognitive solidification.
- [ ] Copy blueprint JSON with clipboard fallback and visible status.

### Task 4: Add tick battle and failure report
**Files:** Modify index.html inline script.
- [ ] Render 3 ally blocks and 1 enemy block with bars and role labels.
- [ ] Run a one-second tick loop, append text logs, and create floating damage numbers.
- [ ] Compute clear/fail based on damage and survival; on failure render coverage, overflow, survival gap, and a concrete recommendation.

### Task 5: Verify behavior
**Files:** index.html.
- [ ] Open the page in a browser and verify no console errors.
- [ ] Verify slider sum, training, warning, battle, failure report, offline cap, and copy feedback.
- [ ] Check responsive layout and reduced-motion behavior.
