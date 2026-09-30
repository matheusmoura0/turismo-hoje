export async function onRequest({ request, env }) {
  const origin = (env.HUB_ORIGIN || 'https://hub.cm.com.br').replace(/\/$/, '');
  const url = new URL(`${origin}/api/v1/sites/by-domain/articles`);
  url.searchParams.set('domain', 'turismohoje.com.br');
  try {
    const response = await fetch(url, { headers: { accept: 'application/json' }, cf: { cacheTtl: 60, cacheEverything: true } });
    return new Response(response.body, { status: response.status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=60, s-maxage=60', 'access-control-allow-origin': '*' } });
  } catch {
    return Response.json({ error: 'Hub indisponível' }, { status: 502, headers: { 'cache-control': 'no-store' } });
  }
}
