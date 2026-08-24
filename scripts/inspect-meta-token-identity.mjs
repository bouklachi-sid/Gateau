const pageId = "1313747908483475";
const token = process.env.META_PAGE_ACCESS_TOKEN;

if (!token) throw new Error("META_PAGE_ACCESS_TOKEN est requis.");

const meResponse = await fetch(`https://graph.facebook.com/v26.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`);
const me = await meResponse.json();
if (!meResponse.ok) throw new Error(`Échec de lecture /me : ${JSON.stringify(me)}`);

const accountsResponse = await fetch(`https://graph.facebook.com/v26.0/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(token)}`);
const accounts = await accountsResponse.json();
if (!accountsResponse.ok) throw new Error(`Échec de lecture /me/accounts : ${JSON.stringify(accounts)}`);

const matchingPage = (accounts.data ?? []).find((page) => page.id === pageId);
console.log(JSON.stringify({
  tokenIdentity: { id: me.id, name: me.name },
  pageFound: Boolean(matchingPage),
  page: matchingPage ? { id: matchingPage.id, name: matchingPage.name, hasAccessToken: Boolean(matchingPage.access_token) } : null,
}, null, 2));
