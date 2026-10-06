# api

`api.autional.cn` 的**对外后端入口**（Vercel 项目 `cn-api`）。

本仓**不含任何业务代码**，只承载一个反向代理配置。

## 职责

```
浏览器 -> <portal>.autional.cn/bff        （各 app 同域代理）
       -> api.autional.cn/bff             （本仓：Vercel rewrite）
       -> ${API_ORIGIN}/bff               （内部源站，原样转发、无路径前缀）
       -> 后端实例
```

- 对外唯一后端域名 = **`api.autional.cn`**（Vercel，境外 -> 不触发 ICP）
- 内部源站 = 环境变量 `API_ORIGIN`；**环境区分由源站域名承担**（`cn.<...>` = `.cn` 环境），不再使用 `/_cn/` 路径前缀
- 门户身份由前端 `X-Entry-Plane` 头携带

## 内容

| 文件 | 说明 |
|---|---|
| `vercel.ts` | 6 条 rewrite：`/bff`、`/api/v1`、`/oauth`、`/.well-known` -> `${API_ORIGIN}/...` |
| `package.json` | 仅依赖 `@vercel/config`（`vercel.ts` 的运行时/类型） |
| `public/index.html` | 根路径占位页（`noindex`）；API 端点不在根路径 |
| `LICENSE` | AGPL-3.0（与 `autional-cn/*` 一致） |

## 配置

**源站地址不入仓**，由环境变量提供：

| 变量 | 作用域 | 示例值 |
|---|---|---|
| `API_ORIGIN` | Production / Preview / Development | `https://<origin-host>`（**内部源站**，不带 `/_cn/` 前缀） |

未设置时 `vercel.ts` **故意抛错**（fail-closed），构建会失败 —— 这是刻意的，避免静默产出指向错误源站的路由。

> ⚠️ 说明：`vercel.json` **不支持环境变量插值**，所以这里用的是 Vercel 官方的
> **`vercel.ts`（build-time 动态配置）**。二者**只能存在一个**。

## 约定

- **不要**在配置里写「逐门户」目标：对外只有这一个入口。
- **不要**把源站改回带 `/_cn/` 前缀的形式（该路径选路方案已弃用，环境由源站域名区分）。
- 改动本仓 = 改 `api.autional.cn` 的代理行为；改完 push 即自动部署。

## 关联

- 设计依据：`AUTIONAL-CN-DEPLOY-PLAN.md`（单一后端入口 + 环境级源站域名选路）
- 执行/运维记录：`AUTIONAL-CN-DEPLOY-EXECUTION-LOG.md`

## per-tenant discovery rewrite 约定（2026-10-06）

- 形如 `/<slug>/.well-known/<path>` 的转发，**不要**用 path-to-regexp 的「首段动态参数 + `:path*`」写法
  （`routes.rewrite('/:slug/.well-known/:path*', ...)`）——**本环境实测 Vercel 不匹配**，一律 404。
- **正确写法 = 正则源 + 反向引用**：
  `routes.rewrite('^/([^/]+)/[.]well-known/(.*)$', `${ORIGIN}/$1/.well-known/$2`)`
- 根级协议坐标仍用普通前缀匹配：`routes.rewrite('/.well-known/:path*', ...)`。
