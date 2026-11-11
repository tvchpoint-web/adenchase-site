"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Sets every [data-photo] background as a plain url() — the full image on wide screens, the
 * lighter one on phones — so photography works in every browser, including older Safari.
 */
export function PhotoLoader() {
  const pathname = usePathname();
  useEffect(() => {
    const apply = () => {
      const small = window.innerWidth < 768;
      document.querySelectorAll<HTMLElement>("[data-photo]").forEach((el) => {
        const url = `url(/photos/${el.dataset.photo}${small ? "-m" : ""}.webp)`;
        if (el.style.backgroundImage !== url) el.style.backgroundImage = url;
      });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [pathname]);
  return null;
}
