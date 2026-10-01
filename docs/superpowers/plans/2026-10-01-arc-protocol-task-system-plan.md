# Arc Protocol 任务系统与详细新手引导 Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

Goal: 在单页原型中加入一次性主线任务系统，并把十步新手引导纳入任务列表，支持手动领取奖励和完成后查看/重播。

Architecture: 延续当前单文件 HTML 架构，在 index.html 的内存 state 中加入任务状态、引导步骤和奖励领取状态；用第四个任务视图渲染列表，用现有事件状态作为任务进度来源。为保持契约可测试，新增静态 tests/task-system.test.mjs，检查标记、数据定义、状态守卫和无持久化约束。

Tech Stack: 原生 HTML/CSS/JavaScript、Node.js ESM 契约测试、无外部依赖。

## Global Constraints
- 任务和奖励只存在当前页面内存，不使用 localStorage、sessionStorage、indexedDB。
- 新手引导只能完成和领取一次，但完成后必须可查看全部步骤和重播提示。
- 任务奖励必须手动领取，领取后不得重复增加资源。
- 不暂停战斗 Tick，不接真实模型 API，不增加每日任务、抽卡、CDN 或远程图片。
- 图片只做本地占位和提示词，不生成或加载图片资源。

---

### Task 1: 建立任务契约与设计文档

Files:
- Create: docs/superpowers/specs/2026-10-01-arc-protocol-task-system-design.md
- Create: tests/task-system.test.mjs

- [ ] 写入静态契约：任务视图、任务 ID、tasks 状态、claimTask、十步引导、用途说明、图片占位和禁止持久化 API。
- [ ] 运行 node tests/task-system.test.mjs，先确认新契约失败。

### Task 2: 添加任务视图和详细引导标记

Files:
- Modify: index.html 导航和 workspace 标记。
- Modify: index.html 任务卡、引导阅读器、图片占位样式。

- [ ] 增加第四个任务视图，包含 taskList、taskSummary 和 guideReader。
- [ ] 每张任务卡展示状态、目标、进度、奖励、用途说明和操作按钮。
- [ ] 添加四个无 src 的图像占位，并展示用途和提示词。

### Task 3: 实现任务状态、进度、领取和引导阅读器

Files:
- Modify: index.html state、任务定义、渲染、事件绑定和进度钩子。

- [ ] 增加 taskDefinitions、getTaskStatus、claimTask、renderTasks、openGuideReader。
- [ ] 领取守卫必须阻止未知、未完成和已领取任务。
- [ ] 查看完整引导和重新播放不得修改任务完成状态或增加奖励。

### Task 4: 扩展引导文案并接入进度

Files:
- Modify: index.html guide rendering 和事件处理。

- [ ] 将七步记录扩展为十步，包含资源、战斗、Tick、训练、配置、比例、预览和仓库。
- [ ] 引导 UI 增加“这个东西有什么用”说明块。
- [ ] 在战斗观察、训练成功、仓库聚焦、d2 战斗和蓝图导出后刷新任务进度。
- [ ] 运行全量测试和内联脚本语法检查。

### Task 5: Review、提交和汇报

- [ ] 检查 diff，确认没有远程 URL、持久化 API 或图片资源。
- [ ] 运行完整验证套件。
- [ ] 提交：feat: add task system and detailed onboarding
