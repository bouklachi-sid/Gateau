import { storageGetSignedUrl } from "./storage";

const META_GRAPH_BASE = "https://graph.facebook.com/v26.0";

function getPageAccessToken() {
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("Le jeton d’accès de Page Meta n’est pas encore configuré.");
  return token;
}

async function resolvePageAccessToken(pageId: string) {
  const configuredToken = getPageAccessToken();
  const identityResponse = await fetch(`${META_GRAPH_BASE}/me?fields=id&access_token=${encodeURIComponent(configuredToken)}`);
  const identityRaw = await identityResponse.text();
  if (!identityResponse.ok) {
    throw new Error(`Meta a refusé la vérification du jeton (${identityResponse.status}) : ${identityRaw}`);
  }
  const identity = JSON.parse(identityRaw) as { id?: string };
  if (identity.id === pageId) return configuredToken;

  const accountsResponse = await fetch(`${META_GRAPH_BASE}/me/accounts?fields=id,access_token&access_token=${encodeURIComponent(configuredToken)}`);
  const accountsRaw = await accountsResponse.text();
  if (!accountsResponse.ok) {
    throw new Error(`Meta a refusé la récupération du jeton de Page (${accountsResponse.status}) : ${accountsRaw}`);
  }
  const accounts = JSON.parse(accountsRaw) as { data?: Array<{ id?: string; access_token?: string }> };
  const page = accounts.data?.find((candidate) => candidate.id === pageId);
  if (!page?.access_token) {
    throw new Error("Aucun jeton de publication n’a été trouvé pour la Page Facebook configurée.");
  }
  return page.access_token;
}

export function metaTokenIsConfigured() {
  return Boolean(process.env.META_PAGE_ACCESS_TOKEN?.trim());
}

export async function validateMetaToken() {
  const token = getPageAccessToken();
  const response = await fetch(`${META_GRAPH_BASE}/me?fields=id,name&access_token=${encodeURIComponent(token)}`);
  const body = await response.text();
  if (!response.ok) throw new Error(`Le jeton Meta est invalide ou ne peut pas être vérifié (${response.status}) : ${body}`);
  return JSON.parse(body) as { id: string; name?: string };
}

export async function validateMetaPage(pageId: string) {
  const token = getPageAccessToken();
  const response = await fetch(`${META_GRAPH_BASE}/${encodeURIComponent(pageId)}?fields=id,name&access_token=${encodeURIComponent(token)}`);
  const body = await response.text();
  if (!response.ok) throw new Error(`Meta a refusé la connexion (${response.status}) : ${body}`);
  return JSON.parse(body) as { id: string; name: string };
}

async function publicMediaUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/manus-storage/")) return storageGetSignedUrl(url.replace("/manus-storage/", ""));
  throw new Error("L’image à publier doit provenir du stockage sécurisé de la plateforme ou d’une URL HTTPS.");
}

export async function publishToFacebook(input: {
  pageId: string;
  message: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
}) {
  const token = await resolvePageAccessToken(input.pageId);
  const body = new URLSearchParams();
  body.set("access_token", token);
  body.set("message", input.message);

  const endpoint = input.imageUrl ? `${META_GRAPH_BASE}/${encodeURIComponent(input.pageId)}/photos` : `${META_GRAPH_BASE}/${encodeURIComponent(input.pageId)}/feed`;
  if (input.imageUrl) body.set("url", await publicMediaUrl(input.imageUrl));
  if (input.linkUrl && !input.imageUrl) body.set("link", input.linkUrl);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Meta a refusé la publication (${response.status}) : ${raw}`);
  const data = JSON.parse(raw) as { id?: string; post_id?: string };
  return { metaPostId: data.post_id ?? data.id ?? "" };
}
