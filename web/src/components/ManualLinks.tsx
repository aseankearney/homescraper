"use client";

import type { ManualLink } from "@/lib/types";
import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";

interface ManualLinksProps {
  links: ManualLink[];
}

export default function ManualLinks({ links }: ManualLinksProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50/80 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
          <Globe className="h-4 w-4" />
          Housing Search Links (Zillow, Realtor.com, etc.)
        </span>
        <ChevronDown
          className={`h-4 w-4 text-amber-700 transition-transform dark:text-amber-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="grid gap-2 border-t border-amber-200 px-4 pb-4 pt-3 sm:grid-cols-2 sm:px-5 dark:border-amber-900/50">
          {links.map((link) => (
            <a
              key={link.source}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/40"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
