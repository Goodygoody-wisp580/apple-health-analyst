---
name: apple-health-analyst
description: 分析 Apple Health 导出 ZIP。先运行本地 prepare 生成 summary.json 和 insights.json，再基于这些结构化事实生成 report.llm.json，最后渲染中文 Markdown 和离线 HTML 健康报告。
---

# Apple Health 分析助手

当用户想在 Codex 中分析 Apple Health 导出 ZIP，并且 ZIP 体量大到不适合直接放进上下文时，使用这个 skill。

## 工作流
1. 确认输入是 Apple Health 官方导出 ZIP。
2. 运行本地 `prepare`，输出 `summary.json` 和 `insights.json`。
3. 先读 `summary.json` 获取稳定事实，再读 `insights.json` 获取图表序列、风险信号、数据缺口、`historicalContext` 和 narrative 边界。
4. 严格按 `report.llm.json` schema 生成 narrative 文件。
5. 运行 `render`，输出 `report.llm.json`、`report.md` 和 `report.html`。

## 命令
```bash
# 标准两步流程（推荐，让 LLM 生成 narrative）
npm run dev -- prepare /path/to/export.zip --out ./output
npm run dev -- render --insights ./output/insights.json --narrative ./output/report.llm.json --out ./output

# 快速模式（跳过 LLM，用内置 deterministic fallback narrative）
npm run dev -- analyze /path/to/export.zip --out ./output --format markdown,json,html
```

## 输出文件（默认在 `./output/` 下）
- `summary.json`：稳定机器摘要
- `insights.json`：LLM 与网页专用富结构洞察
- `report.llm.json`：符合 schema 的 narrative JSON
- `report.md`：中文报告
- `report.html`：离线单文件网页报告

## 生成 narrative 前必须读取
- `summary.json`
- `insights.json`
- [references/report-llm-json.md](references/report-llm-json.md)
- [references/safety-boundaries.md](references/safety-boundaries.md)

## 约束
- 只能引用 `summary.json` 和 `insights.json` 里的事实，不要自造数据。
- 可以做中文健康管理建议，但不要给医学诊断、治疗方案或疾病判断。
- 写 narrative 时优先结合 `historicalContext` 的最近 30 天、过去 180 天和全时段背景，不要只围绕最近 30 天下结论。
- 如果某个模块标记为 `insufficient_data`，直接说明数据不足。
- 如果出现明显异常或持续恶化，可以给出保守的复查/就医提醒。
- 不要直接生成最终 HTML；先写 `report.llm.json`，再交给 `render`。

## 错误处理
- **ZIP 格式错误**：如果 `prepare` 报 "找不到 HealthData XML"，确认用户提供的是 Apple Health 官方导出 ZIP（`导出.zip`），而不是手动压缩的文件。
- **内存不足**：大 ZIP（>2GB）可能导致内存不足。建议用 `--from` 和 `--to` 限定时间范围，减小解析量。
- **narrative 校验失败**：`render` 会校验 `report.llm.json` 的结构。如果报错，检查 `chart_callouts` 中的 `chart_id` 是否和 `insights.json` 中的图表 ID 一致。
