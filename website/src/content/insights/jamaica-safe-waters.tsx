import type { Article } from "@/lib/insights";
import { P } from "@/components/insights/Prose";

/**
 * DRAFT — the inaugural article (subject: Jamaica Safe Waters and the opportunity to improve
 * water-recreation safety). Its headline, excerpt, category, date and copy have not been supplied
 * yet; the values below are placeholders for the editor and are never shown to visitors while the
 * status is "draft". Replace them with the approved copy, set `date` and change `status` to
 * "published" to release it.
 */
export const article: Article = {
  slug: "jamaica-safe-waters",
  title: "Jamaica Safe Waters (working title — awaiting approved headline)",
  excerpt: "Awaiting approved copy.",
  date: "",
  category: "To be confirmed",
  status: "draft",
  Body: () => <P>Awaiting the final, approved article copy.</P>,
};
