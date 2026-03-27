# apple-health-analyst

用于本地分析 Apple Health 导出 ZIP 的工具。

## 功能
- 直接读取官方 Apple Health 导出 ZIP，不会解压到当前工作目录
- 按指标选择主数据源，而不是盲目合并所有设备数据
- 生成 `summary.json`、`report.md` 和 `report.html`
- 既可作为独立 CLI 使用，也可作为 Codex skill 使用

## 隐私
- 完全本地运行
- 不依赖服务器
- 除非你主动分享生成文件，否则不会上传健康数据

## 快速开始
```bash
npm install
npm run build
node dist/cli.js analyze /path/to/导出.zip --out ./output
```

开发模式：
```bash
npm run dev -- analyze /path/to/导出.zip --from 2026-01-01 --to 2026-03-26 --out ./output
```

## CLI
```bash
apple-health-analyst analyze <export.zip> \
  --from YYYY-MM-DD \
  --to YYYY-MM-DD \
  --format markdown,json,html \
  --out <dir>
```

说明：
- Apple Health 导出默认是全量历史数据，建议配合 `--from` 和 `--to` 聚焦分析区间
- 工具会忽略 `export_cda.xml`，即使主 XML 文件名乱码也能识别
- 发布前可用 `node dist/cli.js ...` 或 `npm run dev -- ...` 先行验证

## 输出文件
- `summary.json`：稳定的机器可读摘要
- `report.md`：简洁的人工可读报告
- `report.html`：可分享的 HTML 报告

## 支持的数据
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

v1 附件处理范围：
- ECG CSV 文件：只计数
- 训练路线 GPX 文件：只计数
- 图片附件：只计数

## 限制
- 不会生成单一健康评分
- 不提供医学诊断
- v1 不深入分析 ECG 波形或 GPS 路线
- 步数和距离数据不会跨设备强行合并为高置信度评分

## Skill 用法
仓库根目录同时也是 skill 根目录。在 Codex 中可这样使用：

```text
使用 $apple-health-analyst 分析我的 Apple Health 导出 ZIP，并总结睡眠、恢复、活动和身体成分。
```

## 开发
```bash
npm run build
npm test
```
