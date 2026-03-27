# apple-health-analyst

面向 Codex skill 的本地 Apple Health 分析工具。

它的职责不是把整份 Apple Health ZIP 直接塞给模型，而是先用 Node.js 做确定性预处理：
- 读取官方导出 ZIP，不解压到当前工作目录
- 选择每个指标的主数据源，避免跨设备盲目混合
- 把大体量历史压缩成适合 LLM 阅读的结构化洞察
- 生成 `summary.json`、`insights.json`、`report.llm.json`、`report.md`、`report.html`
- 输出可直接双击打开的单文件 HTML 报告

## 设计目标
- 普通用户可以在 Codex 中用“一句话 + ZIP 路径”调用 skill
- Node 负责事实提取、趋势压缩、图表数据和风险信号
- Codex / GPT-5.4 只负责基于结构化产物写中文 narrative
- 报告提供健康管理建议，不做医学诊断

## 隐私
- 完全本地运行
- 不依赖服务器
- 不在 Node 里调用 OpenAI API
- 除非你主动分享产物，否则不会上传健康数据

## 快速开始
```bash
npm install
npm run build
node dist/cli.js analyze /path/to/export.zip --out ./output
```

开发模式：
```bash
npm run dev -- analyze /path/to/export.zip --out ./output
```

## CLI
### `prepare`
读取 ZIP，输出稳定机器摘要与 LLM/网页专用洞察。

```bash
apple-health-analyst prepare <export.zip> \
  --from YYYY-MM-DD \
  --to YYYY-MM-DD \
  --out <dir>
```

输出：
- `summary.json`
- `insights.json`

### `render`
读取 `insights.json` 和符合 schema 的 `report.llm.json`，渲染最终报告。

```bash
apple-health-analyst render \
  --insights ./output/insights.json \
  --narrative ./output/report.llm.json \
  --out ./output
```

输出：
- `report.llm.json`
- `report.md`
- `report.html`

### `analyze`
兼容入口。它会先执行 `prepare`，再用内置 deterministic fallback narrative 生成一套可直接查看的完整报告。

```bash
apple-health-analyst analyze <export.zip> \
  --from YYYY-MM-DD \
  --to YYYY-MM-DD \
  --format markdown,json,html \
  --out <dir>
```

`--format` 语义：
- `json`：写出 `summary.json`、`insights.json`、`report.llm.json`
- `markdown`：写出 `report.md`
- `html`：写出 `report.html`

## 输出文件
- `summary.json`：稳定的机器摘要，保留基础分析结果与主数据源选择
- `insights.json`：给 Codex 和 HTML 渲染使用的富结构洞察，包含图表序列、风险信号、数据缺口、source confidence
- `report.llm.json`：Codex 生成的 narrative JSON，字段 schema 见 [`.agents/skills/apple-health-analyst/references/report-llm-json.md`](/Users/ruochen/workspace/apple-health-analyst/.agents/skills/apple-health-analyst/references/report-llm-json.md)
- `report.md`：中文可读报告
- `report.html`：离线单文件网页报告，内联 CSS 与 SVG 图表

## 历史压缩策略
为了控制上下文和网页体量，时序数据默认按以下规则压缩：
- 近 30 天：保留日级
- 31-180 天：压缩为周级
- 180 天以前：压缩为月级

这只影响 `insights.json` 和图表层，不影响原始解析与主数据源判断。

## Skill 用法
项目级 skill 已按 Codex repo 规则放到 `.agents/skills/apple-health-analyst/`：
- [`.agents/skills/apple-health-analyst/SKILL.md`](/Users/ruochen/workspace/apple-health-analyst/.agents/skills/apple-health-analyst/SKILL.md)
- [`.agents/skills/apple-health-analyst/agents/openai.yaml`](/Users/ruochen/workspace/apple-health-analyst/.agents/skills/apple-health-analyst/agents/openai.yaml)
- [`.agents/skills/apple-health-analyst/references/report-llm-json.md`](/Users/ruochen/workspace/apple-health-analyst/.agents/skills/apple-health-analyst/references/report-llm-json.md)
- [`.agents/skills/apple-health-analyst/references/safety-boundaries.md`](/Users/ruochen/workspace/apple-health-analyst/.agents/skills/apple-health-analyst/references/safety-boundaries.md)

推荐按三步工作流使用：

1. 运行 `prepare`
2. 让 Codex 读取 `summary.json` 和 `insights.json`，生成符合 schema 的 `report.llm.json`
3. 运行 `render`

自然语言示例：

```text
使用 $apple-health-analyst 分析 /path/to/export.zip。
先运行 prepare，读取 summary.json 和 insights.json，
按照 skill 要求生成 report.llm.json，再运行 render，最后给我中文结论。
```

skill 的 narrative schema 和安全边界见：
- [`.agents/skills/apple-health-analyst/references/report-llm-json.md`](/Users/ruochen/workspace/apple-health-analyst/.agents/skills/apple-health-analyst/references/report-llm-json.md)
- [`.agents/skills/apple-health-analyst/references/safety-boundaries.md`](/Users/ruochen/workspace/apple-health-analyst/.agents/skills/apple-health-analyst/references/safety-boundaries.md)

## 当前覆盖
- 睡眠
- 静息心率
- HRV
- 血氧
- 呼吸频率
- 最大摄氧量
- 体重
- 体脂率
- 活动摘要
- 训练记录

附件范围：
- ECG CSV：计数
- 训练路线 GPX：计数
- 图片附件：计数

## 限制
- 不会生成单一“健康评分”
- 不会在 Node 中调用大模型
- 不提供医学诊断或治疗建议
- v1 不深入分析 ECG 波形或 GPS 路线
- 步数和距离不会跨设备强行合并成高置信度结论

## 开发
```bash
npm run build
npm test
```
