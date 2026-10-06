import { routes, type VercelConfig } from '@vercel/config/v1';

/**
 * 对外后端入口 `api.autional.cn` 的唯一源站。
 *
 * 值 **不写入本仓**，取自 Vercel 项目环境变量 `API_ORIGIN`
 * （Project -> Settings -> Environment Variables）。
 * 未设置时 **故意抛错**（fail-closed），避免静默产出坏路由。
 *
 * 过渡期：`API_ORIGIN=https://cn.autional.tianv.mobi`（唯一的 tianv.mobi 桥，**可退役**）；
 * ICP 备案后可改为 `https://api.autional.cn` 直连并删除本代理项目（见部署计划 D13）。
 */
const rawOrigin = process.env.API_ORIGIN;

if (!rawOrigin) {
  throw new Error(
    '[cn-api] 缺少环境变量 API_ORIGIN（Vercel 项目设置里配置后重新部署）',
  );
}

const ORIGIN = rawOrigin.replace(/\/+$/, '');

/** 区域 issuer：边缘注入 X-Autional-Issuer（方案③）。 */
const ISSUER = 'https://api.autional.cn';
const withIssuer = () => ({ requestHeaders: { 'X-Autional-Issuer': ISSUER } });

/**
 * 6 条 rewrite：把对外入口的路径原样转发到源站（**无路径前缀**）。
 * 环境区分由“源站域名”承担（`cn.<...>` = `.cn` 环境），不再使用 `/_cn/` 路径前缀。
 * `/ready`：status 站网关健康聚合探针（站点侧 rewrite 指到 api.autional.cn/ready，
 * 缺此条则打回 Vercel 404 —— status 内容审计 V-01 的代理断点）。
 */
export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/bff/:path*', `${ORIGIN}/bff/:path*`, withIssuer),
    routes.rewrite('/api/v1/:path*', `${ORIGIN}/api/v1/:path*`, withIssuer),
    routes.rewrite('/oauth/:path*', `${ORIGIN}/oauth/:path*`, withIssuer),
    routes.rewrite('/ready', `${ORIGIN}/ready`, withIssuer),
    routes.rewrite('/.well-known/:path*', `${ORIGIN}/.well-known/:path*`, withIssuer),
    routes.rewrite('^/([^/]+)/[.]well-known/(.*)$', `${ORIGIN}/$1/.well-known/$2`),
  ],
};
