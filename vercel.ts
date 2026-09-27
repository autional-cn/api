import { routes, type VercelConfig } from '@vercel/config/v1';

/**
 * 对外后端入口 `api.autional.cn` 的唯一源站。
 *
 * 值 **不写入本仓**，取自 Vercel 项目环境变量 `API_ORIGIN`
 * （Project -> Settings -> Environment Variables）。
 * 未设置时 **故意抛错**（fail-closed），避免静默产出坏路由。
 */
const rawOrigin = process.env.API_ORIGIN;

if (!rawOrigin) {
  throw new Error(
    '[cn-api] 缺少环境变量 API_ORIGIN（Vercel 项目设置里配置后重新部署）',
  );
}

const ORIGIN = rawOrigin.replace(/\/+$/, '');

/**
 * 4 条 rewrite：把对外入口的路径，加上 `/_cn/` 前缀后转发到内部源站。
 * `/_cn/` 是 ingress 用来把流量分给独立 .cn 实例的标记（ingress 会去掉前缀）。
 */
export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/bff/:path*', `${ORIGIN}/_cn/bff/:path*`),
    routes.rewrite('/api/v1/:path*', `${ORIGIN}/_cn/api/v1/:path*`),
    routes.rewrite('/oauth/:path*', `${ORIGIN}/_cn/oauth/:path*`),
    routes.rewrite('/.well-known/:path*', `${ORIGIN}/_cn/.well-known/:path*`),
  ],
};
