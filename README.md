# 可乐丽每日股票行情展示站

这是一个公开的 GitHub Pages 静态展示仓库，用于归档和展示可乐丽（Kuraray Co., Ltd.，3405.T）每日股票行情截图。网页仅使用 HTML、CSS 和原生 JavaScript，不包含后端服务、用户跟踪或登录功能。

## 职责边界

- 本网页**不负责抓取行情**，只读取仓库内已经公开的日报图片和索引 JSON。
- 私人自动化仓库未来只会向本仓库发布公开日报图片（`reports/*.png`）和公开索引（`data/reports.json`）。当前阶段尚未连接任何私人自动化仓库，也未配置 Token 或 Secrets。
- **不得向本仓库提交**密码、Token、Secrets、Excel 模板、私人日志、diagnostics（诊断信息）或其他私人资料。
- 行情展示仅供信息整理，不构成投资建议。

## 目录结构

```text
index.html              # 页面结构
styles.css              # 响应式样式
script.js               # JSON 读取、状态渲染与图片弹窗
data/reports.json       # 公开日报索引
reports/                # 公开日报 PNG 图片
assets/empty-report.svg # 本地空状态插图
```

## `reports.json` 格式

完整的已发布日报示例：

```json
{
  "latest": {
    "date": "2026-07-27",
    "title": "可乐丽每日股票行情（2026.07.27）",
    "image": "reports/2026-07-27.png",
    "updatedAt": "2026-07-27T16:05:00+09:00",
    "status": "published"
  },
  "reports": [
    {
      "date": "2026-07-27",
      "title": "可乐丽每日股票行情（2026.07.27）",
      "image": "reports/2026-07-27.png",
      "updatedAt": "2026-07-27T16:05:00+09:00",
      "status": "published"
    }
  ]
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `latest` | object 或 null | 最新日期状态；无日报时为 `null` |
| `reports` | array | 历史记录列表；网页会按 `date` 从新到旧排序 |
| `date` | string | 交易日期，格式为 `YYYY-MM-DD` |
| `title` | string | 日报标题 |
| `image` | string | 相对于站点目录的图片路径，例如 `reports/2026-07-27.png` |
| `updatedAt` | string | ISO 8601 格式的页面更新时间（建议包含时区） |
| `status` | string | `published`（已发布）或 `market_closed`（休市） |
| `message` | string | 可选；休市等状态的公开提示语 |

休市时，`latest` 可以不含图片：

```json
{
  "latest": {
    "date": "2026-07-28",
    "status": "market_closed",
    "message": "今日日本股市休市，暂无可乐丽常规收盘行情更新。"
  },
  "reports": []
}
```

初始空状态为：

```json
{
  "latest": null,
  "reports": []
}
```

## 本地预览

在仓库根目录运行：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000/>。不要直接双击 `index.html` 测试，因为浏览器可能限制 `file://` 页面通过 `fetch` 读取 JSON。

## GitHub Pages 部署

GitHub Pages 应配置为从 **`main` 分支根目录（`/`）**部署。页面内所有资源都使用相对路径，以便在 `Torti-hy.github.io/stock-daily-report-site/` 项目子路径中正常加载。
