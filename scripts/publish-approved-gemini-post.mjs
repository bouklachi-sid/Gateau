const pageId = "1313747908483475";
const sourcePostId = 60001;
const configuredToken = process.env.META_PAGE_ACCESS_TOKEN;
const imageUrl = "https://gateauxfb-wp7fggme.manus.space/manus-storage/business-1/retouched/douceur-studio-commande-0555188455_5d83bc5f.jpeg";

if (!configuredToken) throw new Error("META_PAGE_ACCESS_TOKEN est requis pour publier.");

const identityResponse = await fetch(
  `https://graph.facebook.com/v26.0/me?fields=id&access_token=${encodeURIComponent(configuredToken)}`,
);
const identity = await identityResponse.json();
if (!identityResponse.ok) {
  throw new Error(`Meta a refusé la vérification du jeton (${identityResponse.status}) : ${JSON.stringify(identity)}`);
}

let pageAccessToken = configuredToken;
if (identity.id !== pageId) {
  const accountsResponse = await fetch(
    `https://graph.facebook.com/v26.0/me/accounts?fields=id,access_token&access_token=${encodeURIComponent(configuredToken)}`,
  );
  const accounts = await accountsResponse.json();
  if (!accountsResponse.ok) {
    throw new Error(`Meta a refusé la récupération du jeton de Page (${accountsResponse.status}) : ${JSON.stringify(accounts)}`);
  }
  const page = (accounts.data ?? []).find((candidate) => candidate.id === pageId);
  if (!page?.access_token) throw new Error("Jeton de publication de la Page introuvable.");
  pageAccessToken = page.access_token;
}

const caption = `عزيزتي، اختاري لمناسباتكِ لمسة شوكولا ناعمة وتقديمًا أنيقًا من Douceur Studio. نُحضّر حلوياتنا بعناية لترافق ضيافتكِ ولحظاتكِ الخاصة.

للطلبات: 0555188455

#حلويات_جزائرية #شوكولا #ضيافة_راقية #الجزائر`;

const payload = new URLSearchParams({ url: imageUrl, caption, access_token: pageAccessToken });
const response = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photos`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: payload,
});
const result = await response.json();
if (!response.ok) throw new Error(`Meta a refusé la publication (${response.status}) : ${JSON.stringify(result)}`);

console.log(JSON.stringify({ pageId, postId: result.post_id ?? result.id, mediaId: result.id, sourcePostId }, null, 2));
