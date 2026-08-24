const token = process.env.META_PAGE_ACCESS_TOKEN;

if (!token) {
  throw new Error("META_PAGE_ACCESS_TOKEN est requis pour diagnostiquer les permissions.");
}

const response = await fetch(`https://graph.facebook.com/v26.0/me/permissions?access_token=${encodeURIComponent(token)}`);
const result = await response.json();

if (!response.ok) {
  throw new Error(`Meta a refusé le diagnostic (${response.status}) : ${JSON.stringify(result)}`);
}

const permissions = (result.data || []).map(({ permission, status }) => ({ permission, status }));
console.log(JSON.stringify({ permissions }, null, 2));
