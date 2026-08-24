const pageId = "1313747908483475";
const token = process.env.META_PAGE_ACCESS_TOKEN;

if (!token) {
  throw new Error("META_PAGE_ACCESS_TOKEN est requis pour la publication de test.");
}

const payload = new URLSearchParams({
  message: "Publication de test technique — la connexion automatisée de la Page est en cours de validation. Merci de ne pas prendre ce message en compte.",
  access_token: token,
});

const response = await fetch(`https://graph.facebook.com/v26.0/${pageId}/feed`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: payload,
});

const result = await response.json();
if (!response.ok) {
  throw new Error(`Meta a refusé la publication de test (${response.status}) : ${JSON.stringify(result)}`);
}

console.log(JSON.stringify({ pageId, postId: result.id }, null, 2));
