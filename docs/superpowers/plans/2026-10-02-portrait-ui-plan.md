# 魔导协议竖屏改版 Implementation Plan

> **For agentic workers:** Use executing-plans to implement this plan task-by-task in the user's shared workspace.

**Goal:** 将现有单文件游戏改为精简的竖屏优先界面，不改玩法。

**Architecture:** 保留 index.html 内现有数据及数值逻辑。新增一个明确的 portrait-ui 样式段，重组 HTML 和折叠容器，少量 JS 负责摘要、视图状态及引导展开。

**Tech Stack:** 原生 HTML/CSS/JavaScript；Node 内置测试；browser-use CDP。

## Global Constraints
- 单文件、无新增外部依赖、无持久化，不修改数值公式。
- 320px 至桌面无横向溢出；桌面居中 480px 游戏区域。
- 保留现有 id、引导目标、训练候选选择语义。
- 尊重安全区、键盘焦点和 reduced-motion。

### Task 1: 布局回归契约
**Files:** Create tests/portrait-ui.test.mjs; Modify index.html.
- [x] 写测试：独立 portrait-ui 样式段、480px 最大宽度、固定四栏导航、安全区、敌上我下、原生 details 战报/引导/资源和五维。
- [x] node tests/portrait-ui.test.mjs，确认因缺失新布局失败。
- [x] 实施紧凑外壳、战场、导航与折叠区；保持原节点 id。
- [x] 重跑新测试和全部 tests/*.test.mjs。

### Task 2: 操作顺序与折叠状态
**Files:** Modify index.html; Extend tests/portrait-ui.test.mjs.
- [x] 测试配置→滑杆→指令→预览→训练按钮的 DOM 顺序，引导展开详情，战报摘要更新，任务分组。
- [x] 在明确缺少行为时运行失败测试。
- [x] 实施训练重排、模型详情、任务排序和已领取折叠；加入引导展开和训练入口。
- [x] 全部契约测试通过，并做运行时 DOM 检查。

### Task 3: 浏览器验收与修整
**Files:** Optional tests/portrait-runtime.test.mjs; documentation progress.
- [x] CDP 检查 320/390/480/1440 宽度的 scrollWidth、战场坐标、底栏位置和截图。
- [x] 检查切换四页、训练候选生成/选择、任务领取、引导及折叠战报；确认无 JS 错误。
- [x] 修复检查发现的问题并重跑全部测试、git diff --check。
- [x] 向用户报告修改与实际验证结果，不自动提交或合并。
