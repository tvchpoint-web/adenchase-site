import { editionAssets, editionFingerprint, publishedArticles, view } from "@/lib/insights";
import { templatesEnabled } from "@/lib/editorial/templates";

export const dynamic = "force-static";

/** For `npm run editions` only: the published editions and where their assets go (404 otherwise). */
export function GET() {
  if (!templatesEnabled) return new Response("Not found", { status: 404 });
  const list = publishedArticles()
    .filter((a) => a.status === "published")
    .map((a) => ({ slug: a.slug, issue: a.issue, title: a.title, url: view(a).url, fingerprint: editionFingerprint(a), assets: editionAssets(a) }));
  return Response.json(list);
}
