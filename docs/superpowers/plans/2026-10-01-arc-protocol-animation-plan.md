# 《魔导协议》品牌素体攻击动画 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 DeepSeek、Kimi、MiniMax 三具素体增加逐次可见的攻击与命中特效，同时保持原有数值结算不变。

**Architecture:** 保持单文件 `index.html` 架构，增加独立 FX DOM 层、品牌化素体标识和纯视觉攻击队列。战斗逻辑先完成真实数值结算，再把已结算伤害拆分为视觉片段，避免动画重复修改状态。

**Tech Stack:** 原生 HTML、CSS、JavaScript；无外部依赖。

## Global Constraints

- 仅 d1-d15。
- 不直接复制官方 Logo，只使用原创抽象符号。
- 不改变 P/C、离线日志、训练、胜负和评估数值。
- 保留 `prefers-reduced-motion` 支持。

---

### Task 1: 动画结构与静态契约

**Files:**
- Create: `tests/animation.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Produces: `#fxLayer`、`attackProfiles`、品牌类名与三个模型名称。

- [ ] **Step 1:** 写源码契约测试，断言三模型、FX 层、弹道/命中类与 reduced-motion 存在。
- [ ] **Step 2:** 导入测试文件，确认因契约缺失而失败。
- [ ] **Step 3:** 增加 FX 层、模型数据、抽象符号标记与对应 CSS。
- [ ] **Step 4:** 再次导入测试，确认静态契约通过。

### Task 2: 逐次攻击与命中反馈

**Files:**
- Modify: `index.html`
- Test: `tests/animation.test.mjs`

**Interfaces:**
- Consumes: `attackProfiles`、`#fxLayer`。
- Produces: `spawnProjectile(attacker, target, amount, profile, delay)`、`triggerHitFx(target, amount, profile)`、`queueAttackSequence(battle, dealt, incoming)`。

- [ ] **Step 1:** 扩充测试，断言攻击函数、110ms 错峰与独立伤害片段存在。
- [ ] **Step 2:** 确认新增断言失败。
- [ ] **Step 3:** 实现弹道坐标、攻击者后坐、命中环、伤害数字和敌方反击视觉。
- [ ] **Step 4:** 将 `tickBattle()` 的旧单次浮字替换为视觉队列，确保真实伤害仍只结算一次。
- [ ] **Step 5:** 运行测试，确认全部通过。

### Task 3: 浏览器回归验证

**Files:**
- Verify: `index.html`

**Interfaces:**
- Consumes: 完整单页原型。

- [ ] **Step 1:** 解析内联脚本，确认 JavaScript 可编译。
- [ ] **Step 2:** 以无头浏览器打开页面，观察至少 5 个 tick。
- [ ] **Step 3:** 检查三模型节点、FX 层、弹道生成、战斗计时和战报增长。
- [ ] **Step 4:** 检查源码无 `localStorage` 和外部资源，原训练/评估入口仍存在。