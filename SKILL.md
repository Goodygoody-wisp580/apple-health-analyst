---
name: apple-health-analyst
description: 在本地分析 Apple Health 导出 ZIP，按指标选择主数据源，并生成睡眠、恢复、活动和身体成分的 JSON、Markdown 与 HTML 报告。
---

# Apple Health 分析助手

当用户想分析 Apple Health 导出 ZIP，尤其是在导出中包含多个设备或 App 数据源时，使用这个 skill。

## 工作流
1. 确认输入是 Apple Health 导出 ZIP。
2. 使用本地输出目录运行 CLI。
3. 优先读取 `summary.json` 获取结构化事实。
4. 当用户需要简洁文字总结时，使用 `report.md`。
5. 明确指出缺失数据和警告。

## 命令
```bash
npm run dev -- analyze /path/to/export.zip --from YYYY-MM-DD --to YYYY-MM-DD --format markdown,json,html --out ./output
```

## 约束
- 除非用户显式提供 `--from` 和 `--to`，否则将 Apple Health 导出视为全量历史导出。
- 不要在 CLI 输出之外手动合并数据源；以 `summary.json` 中选定的主数据源为准。
- 只汇报趋势和警告，不做诊断。
- 如果某个模块标记为 `insufficient_data`，直接说明数据不足即可，不要过度推断。

## 输出
- `summary.json`：数据源选择、覆盖范围、警告和指标汇总
- `report.md`：简洁报告
- `report.html`：可分享的 HTML 报告
