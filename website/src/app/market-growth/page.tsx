import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { DisciplinePage } from "@/components/site/DisciplinePage";
import { DISCIPLINES } from "@/lib/site";
import { PHOTO } from "@/lib/photos";

const d = DISCIPLINES[2];

export const metadata: Metadata = pageMeta(d.title, d.metaDescription);

export default function MarketGrowthPage() {
  return <DisciplinePage d={d} photo={PHOTO.marketGrowthHero} />;
}
