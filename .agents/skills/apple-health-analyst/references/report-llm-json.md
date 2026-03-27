# `report.llm.json` Schema

`report.llm.json` 是 narrative 的唯一输入。`render` 会校验它的字段，再生成 `report.md` 和 `report.html`。

## 必填结构
```json
{
  "schema_version": "1.0.0",
  "overview": "string",
  "key_findings": ["string"],
  "strengths": ["string"],
  "watchouts": ["string"],
  "actions_next_2_weeks": ["string"],
  "when_to_seek_care": ["string"],
  "data_limitations": ["string"],
  "chart_callouts": [
    {
      "chart_id": "sleep | recovery | activity | bodyComposition",
      "title": "string",
      "summary": "string"
    }
  ],
  "disclaimer": "string"
}
```

## 写作要求
- 所有文本默认中文。
- 每个数组至少写 1 项，尽量简洁，优先给普通用户能执行的建议。
- `chart_callouts` 必须覆盖现有图表 id，不能使用未知 id。
- 可以重排重点，但不能违背 `summary.json` / `insights.json` 中的结构化事实。
- 解释趋势时优先同时参考 `historicalContext` 中的 `recent30d`、`trailing180d` 和 `allTime`，避免只拿最近 30 天做判断。
- 允许做相对专业的健康管理解读，例如恢复负荷、作息稳定性、训练与体重变化是否一致，但不要越界到诊断。

## 推荐风格
- `overview`：1 段，总结当前优先级和整体方向。
- `key_findings`：2-4 条，优先写“近期 vs 长期”的关键变化和健康含义。
- `strengths`：1-3 条，写趋势里正在变好的部分。
- `watchouts`：1-4 条，写最值得留意的风险和注意事项。
- `actions_next_2_weeks`：2-4 条，写具体、可执行、周期短的建议。
- `when_to_seek_care`：1-3 条，保守提醒，不写诊断。
- `data_limitations`：1-4 条，说明样本少、来源不稳、覆盖有限等问题。
- `disclaimer`：固定表达“健康管理参考，不构成医疗诊断”这类边界。
