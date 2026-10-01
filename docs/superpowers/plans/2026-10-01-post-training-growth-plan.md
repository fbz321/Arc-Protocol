# 后训练养成可视化 Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 将现有训练滑杆升级为《魔导协议》的主要养成入口，提供实时训练预览、五维成长可视化和训练后结算反馈，同时保持原有数值与战斗规则不变。

**Architecture:** 继续采用当前单页、单文件 HTML 架构。训练模块新增一个“预览/结算”数据层：由现有 state.ratios、state.vector、state.inventory 和深度公式派生训练快照，再由独立渲染函数更新 DOM。五维成长使用 CSS 条形图和 DOM 文本，不引入 Canvas、外部资源或持久化。

**Tech Stack:** 原生 HTML、CSS、JavaScript；Node.js 内置测试；无外部依赖。

## Global Constraints

- 保持 P(d) = 100 * 1.15^(d-1)，只支持 d1-d15。
- 保持 C(d) = 2 * 1.10^(d-1)。
- 训练配比 Bulwark / Weaver / Conductor 总和始终为 100%。
- 训练仍使用当前库存、离线日志和容量上限逻辑，不增加 localStorage、存档或抽卡。
- 训练预览只展示派生值，不提前消耗日志或写入向量。
- 执行训练后才修改 state.vector 与 state.inventory。
- 不改变既有战斗伤害、治疗、胜负和卡关报告结算。
- 不使用远程图片、官方 Logo 文件或新的运行时依赖。

---

### Task 1: 建立训练养成可视化的契约测试

**Files:**
- Modify: tests/animation.test.mjs 或创建同目录 tests/training-growth.test.mjs
- Test: index.html

**Interfaces:**
- Consumes: 当前 index.html 的训练模块和内联脚本。
- Produces: 可验证的 DOM id、训练预览函数和结算函数契约。

- [ ] Step 1: 写失败测试

增加以下契约检查：

    const growthChecks = [
      ['renders training preview container', /id="trainingPreview"/.test(html)],
      ['renders five-dimension growth rows', /id="growthRows"/.test(html) && /data-dimension="Bulwark"/.test(html)],
      ['renders capacity warning marker', /class="capacity-marker"/.test(html)],
      ['renders training settlement card', /id="trainingResult"/.test(html)],
      ['defines preview renderer', /function renderTrainingPreview\s*\(/.test(html)],
      ['defines settlement renderer', /function renderTrainingResult\s*\(/.test(html)],
      ['updates preview on slider input', /renderTrainingPreview\(\)/.test(html)],
      ['keeps persistence disabled', !/localStorage/.test(html)]
    ];
    assert.deepEqual(growthChecks.filter(([, ok]) => !ok), [], 'Missing growth contracts');

- [ ] Step 2: 运行测试确认失败

Run: node --test tests/training-growth.test.mjs

Expected: FAIL，因为现有页面还没有这些可视化 DOM 和函数。

- [ ] Step 3: 保留失败输出并进入实现

不修改测试断言来绕过失败；后续实现必须补齐对应结构和函数。

---

### Task 2: 重构训练面板为“后训练驾驶舱”

**Files:**
- Modify: index.html 的训练 section HTML 与相关 CSS

**Interfaces:**
- Consumes: 现有 state、三个 range、三个 command radio、trainBtn 和 exportBtn。
- Produces: #trainingPreview、#growthRows、#trainingResult、#trainingProjection 等稳定 DOM 入口。

- [ ] Step 1: 添加养成总览头部

在训练 section 内增加：

    <div class="growth-overview" id="trainingOverview">
      <div><span>协议深度</span><strong id="trainingDepth">d1</strong></div>
      <div><span>可写入容量</span><strong id="trainingCapacity">0 / 100 P</strong></div>
      <div><span>预计训练次数</span><strong id="trainingRuns">0 次</strong></div>
      <div><span>当前指令</span><strong id="trainingCommand">护卫</strong></div>
    </div>

- [ ] Step 2: 添加实时预览卡片

增加 #trainingPreview，显示本次预计写入点、LOG 消耗、主适性与战斗影响；预览必须由 JS 动态填充，不把派生数值写死在 HTML。

- [ ] Step 3: 添加五维成长条

增加 #growthRows，为 Bulwark、Vanguard、Marksman、Weaver、Conductor 各生成一行，包含当前值、容量比例、50% 警戒线和本次预览增长层。每行使用 data-dimension 标识维度。

- [ ] Step 4: 添加训练结算卡

增加默认隐藏的 #trainingResult，包括：写入总量、三个配比维度增量、训练前后摘要和战斗影响摘要。没有执行训练时不显示结算内容。

- [ ] Step 5: 增加 CSS 视觉层级

训练模块使用更清晰的“驾驶舱”层次：总览数字、预览卡、成长条、滑杆、指令、动作按钮、结算卡。新增 CSS 必须复用当前暗色、青色、蓝色、琥珀色变量；移动端在 960px 和 680px 断点下保持不横向溢出。

---

### Task 3: 实现训练预览派生逻辑

**Files:**
- Modify: index.html 内联脚本
- Test: tests/training-growth.test.mjs

**Interfaces:**
- Consumes: capacity(depth)、cost(depth)、totalWritten()、pendingLogs()、state.ratios、state.vector。
- Produces: getTrainingPreview()、renderTrainingPreview()、renderGrowthRows()。

- [ ] Step 1: 实现纯派生函数

增加：

    function getTrainingPreview(){
      var p=capacity(state.depth);
      var available=state.inventory+pendingLogs();
      var remaining=Math.max(0,p-totalWritten());
      var points=Math.min(Math.floor(available/cost(state.depth)),Math.floor(remaining));
      var allocations={},left=points;
      ['Bulwark','Weaver','Conductor'].forEach(function(key,index){
        var value=index===2?left:Math.floor(points*state.ratios[key]/100);
        allocations[key]=value;
        left-=value;
      });
      return {capacity:p, remaining:remaining, available:available, points:points,
        logCost:points*cost(state.depth), allocations:allocations,
        projected:Object.assign({},state.vector,{Bulwark:state.vector.Bulwark+allocations.Bulwark,
          Weaver:state.vector.Weaver+allocations.Weaver,
          Conductor:state.vector.Conductor+allocations.Conductor})};
    }

该函数不得修改 state。

- [ ] Step 2: 实现预览渲染

renderTrainingPreview() 更新总览、预览卡、训练按钮 disabled 状态、认知固化提示和战斗影响摘要。滑杆、指令、深度变化后都必须调用它。

- [ ] Step 3: 实现五维成长条渲染

renderGrowthRows(preview) 为每个维度更新当前层、预览增量层、宽度百分比以及 50% marker 的位置；超过 50% 时加上 solid 类，但不在预览阶段修改实际向量。

- [ ] Step 4: 接入现有渲染入口

让 renderTraining()、renderAll()、onRatioInput()、深度切换和指令切换都刷新预览及成长条；初次 init() 后立即显示真实预览。

- [ ] Step 5: 运行测试

Run: node --test tests/training-growth.test.mjs

Expected: PASS，且不影响原有 tests/animation.test.mjs。

---

### Task 4: 接入训练结算反馈

**Files:**
- Modify: index.html 内联脚本
- Test: tests/training-growth.test.mjs

**Interfaces:**
- Consumes: getTrainingPreview() 和现有 executeTraining()。
- Produces: renderTrainingResult(before, after, preview)，只在训练成功后展示。

- [ ] Step 1: 在 executeTraining 中保存训练前快照

执行写入前复制 state.vector、state.inventory、当前深度和当前指令；使用预览分配结果完成原有写入，不重复计算不同的点数。

- [ ] Step 2: 写入成功后渲染结算

新增：

    function renderTrainingResult(before, after, preview){
      var changes=['Bulwark','Weaver','Conductor'].map(function(key){
        return key+' +'+fmt(after[key]-before[key]);
      });
      $('trainingResult').classList.add('show');
      $('trainingResult').querySelector('[data-result="points"]').textContent='+'+fmt(preview.points)+' P';
      $('trainingResult').querySelector('[data-result="delta"]').textContent=changes.join(' · ');
    }

同时显示训练前后总写入、主适性和战斗倍率摘要。

- [ ] Step 3: 在重新演算或切换深度时保留最近一次结果但刷新预测

不写入 localStorage；只保留当前页面内存中的最近一次结算。无成功训练结果时保持隐藏。

- [ ] Step 4: 运行完整测试

Run: node --test tests/training-growth.test.mjs tests/animation.test.mjs

Expected: 两个测试文件均 PASS。

---

### Task 5: 回归验证与文档更新

**Files:**
- Modify: docs/superpowers/specs/2026-10-01-arc-protocol-animation-design.md 或新增训练设计说明
- Verify: index.html、tests/*.mjs

**Interfaces:**
- Consumes: 已实现的后训练 DOM、函数和测试。
- Produces: 可复核的设计说明和验证结果。

- [ ] Step 1: 更新设计说明

补充训练预览、成长条 50% marker、结算卡和“不持久化”的说明。

- [ ] Step 2: 运行语法检查

抽取 index.html 内联 script 后执行 node --check，预期退出码 0。

- [ ] Step 3: 运行全部契约测试

Run: node --test tests/animation.test.mjs tests/training-growth.test.mjs

Expected: 所有测试通过，失败数为 0。

- [ ] Step 4: 做静态约束检查

确认：localStorage 匹配数 = 0；远程图片/脚本匹配数 = 0；训练预览不会修改 state.vector；训练按钮仍调用 executeTraining。

- [ ] Step 5: 删除验证临时文件

只删除本轮生成的截图或临时验证文件，不删除用户原有文件。
