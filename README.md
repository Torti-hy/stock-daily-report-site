# 日本股票每日行情展示站

这是一个公开的 GitHub Pages 静态展示仓库，用于归档和展示可乐丽（Kuraray Co., Ltd.，3405.T）与太阳诱电（TAIYO YUDEN CO., LTD.，6976.T）的每日股票行情截图。网页只使用 HTML、CSS 和原生 JavaScript。

## 职责边界

- 网站只读取本仓库内公开的日报图片和索引 JSON，不负责抓取行情。
- 当前尚未连接私人自动化仓库，也不需要或配置 Token、Secret、Deploy Key 或跨仓库权限。
- 后续自动发布需要单独设计、审查并配置；本仓库当前不实现跨仓库上传。
- 不应提交密码、Token、Secrets、私人日志、诊断信息或其他私人资料。
- 行情展示仅供信息整理，不构成投资建议。

## 目录结构

```text
index.html                       # 单面板双股票页面结构
styles.css                       # 响应式样式
script.js                        # 多股票数据读取、切换、状态渲染与图片弹窗
data/reports.json                # 公开的多股票日报索引
reports/kuraray/                 # 可乐丽日报 PNG
reports/taiyo-yuden/             # 太阳诱电日报 PNG
assets/empty-report.svg          # 本地空状态插图
```

图片必须按股票 slug 隔离，例如 `reports/kuraray/2026-07-28.png` 和 `reports/taiyo-yuden/2026-07-28.png`。当前两个目录只有 `.gitkeep`，没有示例或伪造日报图片。

## `data/reports.json` 格式

顶层包含索引更新时间和股票数组；每只股票有稳定的 `slug`、中英文名称、ticker、最新记录及历史记录：

```json
{
  "updatedAt": null,
  "stocks": [
    {
      "slug": "kuraray",
      "name": "可乐丽",
      "ticker": "3405.T",
      "companyName": "Kuraray Co., Ltd.",
      "latest": null,
      "reports": []
    },
    {
      "slug": "taiyo-yuden",
      "name": "太阳诱电",
      "ticker": "6976.T",
      "companyName": "TAIYO YUDEN CO., LTD.",
      "latest": null,
      "reports": []
    }
  ]
}
```

每个 report 至少支持以下字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `date` | string | 交易日期，格式为 `YYYY-MM-DD` |
| `status` | string | `published`（已发布）或 `market_closed`（休市） |
| `image` | string | 本站相对路径；已发布日报按股票目录存放 |
| `title` | string | 日报标题 |
| `updatedAt` | string | ISO 8601 页面更新时间，建议包含时区 |
| `message` | string | 可选；休市提示 |

已发布记录示例：

```json
{
  "date": "2026-07-28",
  "status": "published",
  "image": "reports/kuraray/2026-07-28.png",
  "title": "可乐丽每日股票行情（2026.07.28）",
  "updatedAt": "2026-07-28T16:05:00+09:00"
}
```

页面也临时兼容旧的 `{ "latest": null, "reports": [] }` 结构，并将其视为可乐丽数据；正式索引应始终使用上述多股票结构。当前正式数据保持真实空状态，两只股票的 `latest` 均为 `null`、`reports` 均为空。

## 本地预览

在仓库根目录运行：

```bash
python3 -m http.server 8000
```

访问 <http://localhost:8000/>。不要通过 `file://` 直接打开，因为浏览器可能阻止 `fetch` 读取 JSON。

## GitHub Pages 部署

GitHub Pages 仍应从 **`main` 分支根目录（`/`）**部署。所有 HTML、CSS、JavaScript、JSON、SVG 和日报图片引用均使用相对路径，可在项目子路径中运行。当前没有自动发布连接；未来如需自动发布，必须另行配置并授予经过审查的权限。
