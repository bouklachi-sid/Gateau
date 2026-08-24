const pageId = "1313747908483475";
const token = process.env.META_PAGE_ACCESS_TOKEN;
const imageUrl = "https://gateauxfb-wp7fggme.manus.space/manus-storage/patisserie-assortiment-commandes_0b2fed50.png";

if (!token) {
  throw new Error("META_PAGE_ACCESS_TOKEN est requis pour publier la première communication.");
}

const caption = `Une douceur, une attention, un moment à partager.

Découvrez notre assortiment de pâtisseries traditionnelles et modernes, préparé avec soin pour vos envies gourmandes et vos occasions spéciales.

Pour commander : 0671 00 00 00

#GateauxAlgeriens #PatisserieAlgerienne #DouceursTraditionnelles #CommandeGateaux #Algerie`;

const payload = new URLSearchParams({
  url: imageUrl,
  caption,
  access_token: token,
});

const response = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photos`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: payload,
});

const result = await response.json();
if (!response.ok) {
  throw new Error(`Meta a refusé la première publication (${response.status}) : ${JSON.stringify(result)}`);
}

console.log(JSON.stringify({ pageId, postId: result.post_id ?? result.id, mediaId: result.id }, null, 2));
