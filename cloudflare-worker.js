/**
 * DabourStudio — Cloudflare Worker Reverse Proxy for dabourstudio.dev
 *
 * يتيح لك هذا الملف ربط النطاق dabourstudio.dev مباشرة بتطبيقك المنشور
 * على Cloud Run عبر Cloudflare Workers & Pages في أقل من دقيقة.
 */

const ORIGIN_URL = 'https://ais-pre-hli37i7jbju7qvoigwr7vo-550138306820.europe-west2.run.app';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, ORIGIN_URL);

    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set('X-Forwarded-Host', url.hostname);

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: modifiedHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual',
    });

    return fetch(proxyRequest);
  },
};
