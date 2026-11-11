import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-navy-deep">
      <div className="mx-auto grid max-w-[96rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-20">
        <div className="lg:col-span-6">
          <p className="type-label text-haze">{SITE.name}</p>
          <p className="type-title mt-5 max-w-md text-ink">
            Identifying Opportunity.
            <br />
            <span className="text-jade">Engineering Growth.</span>
          </p>
          <p className="mt-5 text-sm text-haze">{SITE.disciplines.replaceAll("•", "·")}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
          <div>
            <p className="type-label text-haze">Explore</p>
            <ul className="mt-5 space-y-3 text-[0.9375rem]">
              <li>
                <Link href="/" className="link-quiet">
                  Home
                </Link>
              </li>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-quiet">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="type-label text-haze">Clients</p>
            <ul className="mt-5 space-y-3 text-[0.9375rem]">
              <li>
                <a href={SITE.portalUrl} className="link-quiet" rel="noopener">
                  Client Portal sign-in
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="type-label text-haze">Begin</p>
            <Link href="/engagement" className="mt-5 inline-block text-[0.9375rem] text-jade underline-offset-4 hover:underline">
              Request a Strategic Introduction
            </Link>
          </div>
        </nav>
        <div className="flex flex-col gap-2 border-t border-line pt-8 text-xs text-haze sm:flex-row sm:justify-between lg:col-span-12">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>The Future Doesn&rsquo;t Build Itself.</p>
        </div>
      </div>
    </footer>
  );
}
