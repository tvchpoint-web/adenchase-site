/**
 * npm run indexnow -- <url> [<url> …]
 *
 * Notifies IndexNow (Bing, Yandex, Seznam and others; https://www.indexnow.org) that published
 * pages on adenchase.com are new or changed. Run it only AFTER a production publication.
 * Preview and other non-production URLs are refused. The key file proves ownership of the
 * domain: https://adenchase.com/17d84a5f18e223feee342e280b9f0dec.txt (public/17d84a5f18e223feee342e280b9f0dec.txt).
 */
const KEY = "17d84a5f18e223feee342e280b9f0dec";
const HOST = "adenchase.com";
const urls = process.argv.slice(2);
if (!urls.length) {
  console.error("Usage: npm run indexnow -- https://adenchase.com/insights/<slug> [more URLs]");
  process.exit(1);
}
for (const u of urls) {
  let url;
  try {
    url = new URL(u);
  } catch {
    console.error(`Refusing ${u}: not a full URL (expected https://${HOST}/...).`);
    process.exit(1);
  }
  if (url.protocol !== "https:" || url.hostname !== HOST) {
    console.error(`Refusing ${u}: only production URLs on https://${HOST} are submitted.`);
    process.exit(1);
  }
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow responded ${res.status} ${res.statusText}`, res.status === 200 || res.status === 202 ? "(accepted)" : "");
if (res.status >= 400) process.exit(1);
