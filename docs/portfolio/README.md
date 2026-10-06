# 提交材料

本目录把《魔导协议》的简短策划与可运行作品说明配成一组材料。

- [TeX 策划案](arc-protocol-plan.tex)：放置数值卡牌方向，约三页；包含核心循环、数值公式、节奏样表和实现边界。
- [PDF 策划案](arc-protocol-plan.pdf)：方便预览与提交。
- [Vibe Coding 作品说明](vibe-coding-showcase.md)：公开试玩入口、个人 / AI 分工及约两分钟演示脚本。

## 编译

需要带 `ctex` 与 Fandol 字体的 TeX 环境，使用 XeLaTeX。建议把辅助文件输出到临时目录，不提交 `.aux`、`.log`、`.out`。

```powershell
$build = Join-Path $env:TEMP "arc-protocol-portfolio-build"
New-Item -ItemType Directory -Force -Path $build | Out-Null
xelatex -interaction=nonstopmode -halt-on-error -output-directory="$build" docs/portfolio/arc-protocol-plan.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory="$build" docs/portfolio/arc-protocol-plan.tex
Copy-Item -LiteralPath "$build/arc-protocol-plan.pdf" -Destination docs/portfolio/arc-protocol-plan.pdf
```

在仓库根目录执行上述命令。没有外部图片依赖；作者使用仓库账号 `fbz321`，正式提交前可按实际身份修改。

## 提交前确认

1. 个人贡献与 AI 分工需符合实际参与情况，不把 AI 生成代码说成全部独立手写。
2. 策划案区分已实现与规划内容；数值表是模型预测，不是实测成绩。
3. 试玩是下载 ZIP 后打开页面，不是在线托管站点；刷新会重置。
4. 本目录不包含录屏视频，作品说明提供的是演示脚本和现有公开试玩链接。
