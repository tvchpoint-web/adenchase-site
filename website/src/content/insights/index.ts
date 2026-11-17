import type { Article, Author } from "@/lib/insights";
import { article as issue001 } from "./001-paradise-shouldnt-come-with-preventable-risks";

/**
 * The Opportunity Perspective: every edition, published or draft. Add one line per new edition
 * (see README.md in this folder). Order does not matter; pages sort by date and issue number.
 */
export const ARTICLES: Article[] = [issue001];

/** Authors, referenced by key from each edition. Never invent credentials or biography. */
export const AUTHORS: Record<string, Author> = {
  "emmanuel-adenaike-sr": {
    name: "Emmanuel Adenaike, Sr.",
    title: "Business Development Strategist",
    organization: "ADEN-CHASE Strategies",
    email: "EmmanuelSr@AdenChase.com",
    // The adenchase.com domain had no mail (MX) records when Issue 001 was prepared (17 Nov 2026), so
    // the address is shown as approved but not offered as a link until mail delivery is confirmed.
    emailVerified: false,
  },
};
