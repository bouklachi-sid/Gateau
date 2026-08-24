const pageId = "1313747908483475";
const configuredToken = process.env.META_PAGE_ACCESS_TOKEN;
const imageUrl = "https://gateauxfb-wp7fggme.manus.space/manus-storage/post-01_e8b84c07.jpeg";

if (!configuredToken) {
  throw new Error("META_PAGE_ACCESS_TOKEN est requis pour publier l’essai.");
}

const accountsResponse = await fetch(`https://graph.facebook.com/v26.0/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(configuredToken)}`);
const accounts = await accountsResponse.json();
if (!accountsResponse.ok) {
  throw new Error(`Meta a refusé la récupération du jeton de Page (${accountsResponse.status}) : ${JSON.stringify(accounts)}`);
}
const page = (accounts.data ?? []).find((candidate) => candidate.id === pageId);
if (!page?.access_token) {
  throw new Error("Le jeton configuré ne permet pas d’obtenir un jeton de publication pour la Page sélectionnée.");
}

const caption = `صباح بطعم الأصالة

حلويات تقليدية محضّرة بعناية لترافق ضيافتكِ الصباحية وتمنح مائدتكِ لمسة دافئة وأصيلة.

للطلب والاستفسار، تواصلي معنا على 0555 18 84 55.

#حلويات_جزائرية #حلويات_تقليدية #ضيافة_راقية #الجزائر`;

const payload = new URLSearchParams({
  url: imageUrl,
  caption,
  access_token: page.access_token,
});

const response = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photos`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: payload,
});

const result = await response.json();
if (!response.ok) {
  throw new Error(`Meta a refusé l’essai (${response.status}) : ${JSON.stringify(result)}`);
}

console.log(JSON.stringify({ pageId, postId: result.post_id ?? result.id, mediaId: result.id, sourcePostId: 30001 }, null, 2));
