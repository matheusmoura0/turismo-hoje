const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs = text => String(text ?? '').split(/\n{2,}/).map(s => s.trim()).filter(Boolean).map(s => `<p>${esc(s).replace(/\n/g,'<br>')}</p>`).join('');
export async function onRequest({ params, env }) {
  if (!/^\d+$/.test(String(params.id))) return new Response('Notícia não encontrada', { status: 404 });
  const origin = (env.HUB_ORIGIN || 'https://hub.cm.com.br').replace(/\/$/, '');
  let article;
  try {
    const response = await fetch(`${origin}/api/v1/articles/${params.id}`, { headers: { accept: 'application/json' }, cf: { cacheTtl: 60, cacheEverything: true } });
    if (!response.ok) return new Response('Notícia não encontrada', { status: response.status === 404 ? 404 : 502 });
    article = await response.json();
  } catch { return new Response('Conteúdo temporariamente indisponível', { status: 502 }); }
  const title = esc(article.title || 'Turismo Hoje');
  const description = esc(String(article.description || article.content || '').replace(/<[^>]*>/g,' ').slice(0,190));
  let safeImage = '';
  try { const imageUrl = new URL(article.image_url); if (['http:', 'https:'].includes(imageUrl.protocol)) safeImage = imageUrl.href; } catch {}
  const image = safeImage ? `<figure><img src="${esc(safeImage)}" alt=""><figcaption>${esc(article.image_credit || '')}</figcaption></figure>` : '';
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${description}"><link rel="canonical" href="https://turismohoje.com.br/materia/${params.id}"><meta property="og:type" content="article"><meta property="og:title" content="${title} | Turismo Hoje"><meta property="og:description" content="${description}">${safeImage?`<meta property="og:image" content="${esc(safeImage)}">`:''}<link rel="stylesheet" href="/assets/styles.css"><title>${title} | Turismo Hoje</title></head><body><header class="masthead"><div class="brand-row"><a class="brand" href="/"><span class="brand-mark">TH</span><span><b>TURISMO<span>HOJE</span></b><small>JORNALISMO DE VIAGEM</small></span></a><a href="/" class="muted">← Todas as notícias</a></div></header><main><article class="article"><div class="crumbs"><a href="/">Início</a> / ${esc(article.category||'Turismo')}</div><span class="kicker">${esc(article.category||'TURISMO')}</span><h1>${title}</h1><p class="dek">${description}</p><div class="byline"><span>${esc(article.author||'Redação Turismo Hoje')}</span><span>·</span><time>${esc(article.published_at?new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(new Date(article.published_at)):'')}</time></div>${image}<div class="article-body">${paragraphs(article.content||article.description||'')}</div><p class="muted">${esc(article.credit||'Turismo Hoje')}</p></article></main><footer><a class="brand brand-footer" href="/"><span class="brand-mark">TH</span><span><b>TURISMO<span>HOJE</span></b><small>JORNALISMO DE VIAGEM</small></span></a><p>Jornalismo para viajar melhor.</p><small>© ${new Date().getFullYear()} Turismo Hoje</small></footer></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=60', 'x-content-type-options': 'nosniff' } });
}
