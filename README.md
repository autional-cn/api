# api

`api.autional.cn` 的**对外后端入口**（Vercel 项目 `cn-api`）。

本仓**不含任何业务代码**，只承载一个反向代理配置。

## 职责

```
浏览器 -> <portal>.autional.cn/bff        （各 app 同域代理）
       -> api.autional.cn/bff             （本仓：Vercel rewrite）
       -> <API_ORIGIN>/_cn/bff            （内部源站，ingress 去前缀）
       -> .cn 实例（独立部署，按 root_domain=autional.cn 配置）
```

- 对外唯一后端域名 = **`api.autional.cn`**（Vercel，境外 -> 不触发 ICP）
- 内部源站 = 环境变量 `API_ORIGIN` + `/_cn/` 路径前缀，**对浏览器不可见**
- `.cn` / `.mobi` 分流由 `/_cn/` 前缀承担；门户身份由前端 `X-Entry-Plane` 头携带

## 内容

| 文件 | 说明 |
|---|---|
| `vercel.ts` | 4 条 rewrite：`/bff`、`/api/v1`、`/oauth`、`/.well-known` -> `${API_ORIGIN}/_cn/...` |
| `package.json` | 仅依赖 `@vercel/config`（`vercel.ts` 的运行时/类型） |
| `public/index.html` | 根路径占位页（`noindex`）；API 端点不在根路径 |
| `LICENSE` | AGPL-3.0（与 `autional-cn/*` 一致） |

## 配置

**源站地址不入仓**，由环境变量提供：

| 变量 | 作用域 | 示例值 |
|---|---|---|
| `API_ORIGIN` | Production / Preview / Development | `https://<origin-host>`（**内部源站**，不带 `/_cn/`） |

未设置时 `vercel.ts` **故意抛错**（fail-closed），构建会失败 —— 这是刻意的，避免静默产出指向错误源站的路由。

> ⚠️ 说明：`vercel.json` **不支持环境变量插值**，所以这里用的是 Vercel 官方的
> **`vercel.ts`（build-time 动态配置）**。二者**只能存在一个**。

## 约定

- **不要**在配置里写「逐门户」目标：对外只有这一个入口。
- **不要**把源站改成不带 `/_cn/` 前缀的形式（会落到 `.mobi` 实例 / 受众不匹配）。
- 改动本仓 = 改 `api.autional.cn` 的代理行为；改完 push 即自动部署。

## 关联

- 设计依据：`AUTIONAL-CN-DEPLOY-PLAN.md` 5.3 / 5.4（单一后端入口 + `/_cn/` 选路 + 独立 `.cn` 实例）
- 执行/运维记录：`AUTIONAL-CN-DEPLOY-EXECUTION-LOG.md`
