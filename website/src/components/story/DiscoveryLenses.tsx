"use client";

import { useState } from "react";
import { focusDiscoveryPath } from "@/components/nexus/store";
import { DISCOVERY_LENSES } from "@/lib/site";

/**
 * Three illustrative strategic lenses. Hover, focus or tap one to send the
 * Jade Signal along the pathway it represents inside the Nexus.
 */
export function DiscoveryLenses() {
  const [active, setActive] = useState<string | null>(null);
  const set = (id: string | null) => {
    setActive(id);
    focusDiscoveryPath(id);
  };

  return (
    <div>
      <p className="type-label text-haze" id="lenses-label">
        Illustrative lenses
      </p>
      <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3" aria-labelledby="lenses-label">
        {DISCOVERY_LENSES.map((lens, i) => {
          const on = active === lens.path;
          return (
            <li key={lens.path} className="bg-navy-deep/80 backdrop-blur-sm">
              <button
                type="button"
                aria-pressed={on}
                onMouseEnter={() => set(lens.path)}
                onMouseLeave={() => set(null)}
                onFocus={() => set(lens.path)}
                onBlur={() => set(null)}
                onClick={() => set(on ? null : lens.path)}
                className="group flex h-full w-full flex-col items-start gap-2 p-5 text-left transition-colors duration-200 hover:bg-sapphire/15 aria-pressed:bg-sapphire/20"
              >
                <span className="flex w-full items-center justify-between">
                  <span className="type-label text-haze">0{i + 1}</span>
                  <span
                    aria-hidden
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${on ? "bg-jade shadow-[0_0_14px_2px_rgba(131,253,128,0.6)]" : "bg-ocean/70"}`}
                  />
                </span>
                <span className="text-[1.0625rem] font-medium text-ink">{lens.title}</span>
                <span className="text-sm leading-relaxed text-mist">{lens.body}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
