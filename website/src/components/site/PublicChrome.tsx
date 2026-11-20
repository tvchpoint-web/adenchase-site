"use client";

import { usePathname } from "next/navigation";

/**
 * The public site's header and footer. Private assessment pages (/private/*) stand alone: no public
 * navigation, so the page is focused and nothing links onward into the rest of the site's menus.
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname?.startsWith("/private/") ? null : <>{children}</>;
}
