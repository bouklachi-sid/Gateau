const pageId = "1313747908483475";
const configuredToken = process.env.META_PAGE_ACCESS_TOKEN;
const imageUrl = "https://gateauxfb-wp7fggme.manus.space/manus-storage/post-02_d977a630.jpeg";

if (!configuredToken) throw new Error("META_PAGE_ACCESS_TOKEN est requis pour publier.");

const identityResponse = await fetch(`https://graph.facebook.com/v26.0/me?fields=id&access_token=${encodeURIComponent(configuredToken)}`);
const identity = await identityResponse.json();
if (!identityResponse.ok) throw new Error(`Meta a refusé la vérification du jeton (${identityResponse.status}) : ${JSON.stringify(identity)}`);

let pageAccessToken = configuredToken;
if (identity.id !== pageId) {
  const accountsResponse = await fetch(`https://graph.facebook.com/v26.0/me/accounts?fields=id,access_token&access_token=${encodeURIComponent(configuredToken)}`);
  const accounts = await accountsResponse.json();
  if (!accountsResponse.ok) throw new Error(`Meta a refusé la récupération du jeton de Page (${accountsResponse.status}) : ${JSON.stringify(accounts)}`);
  const page = (accounts.data ?? []).find((candidate) => candidate.id === pageId);
  if (!page?.access_token) throw new Error("Jeton de publication de la Page introuvable.");
  pageAccessToken = page.access_token;
}

const caption = `حلوى بيضاء لذوق ناعم

اختيار ناعم وأنيق لعشاق الحلويات الخفيفة، مثالي لضيافة العائلة واللقاءات الجميلة.

للطلب والاستفسار، تواصلي معنا على 0555 18 84 55.

#حلويات_جزائرية #ضيافة_ناعمة #حلويات_العيد #الجزائر`;

const payload = new URLSearchParams({ url: imageUrl, caption, access_token: pageAccessToken });
const response = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photos`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: payload,
});
const result = await response.json();
if (!response.ok) throw new Error(`Meta a refusé la publication (${response.status}) : ${JSON.stringify(result)}`);

console.log(JSON.stringify({ pageId, postId: result.post_id ?? result.id, mediaId: result.id, sourcePostId: 30002 }, null, 2));
