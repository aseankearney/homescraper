"use client";

import { ChevronDown, Lightbulb, Search } from "lucide-react";
import { useState } from "react";

export default function Tips() {
  const [open, setOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border border-indigo-100 bg-white/85 shadow-sm backdrop-blur dark:border-indigo-900/40 dark:bg-slate-900/65">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          <Lightbulb className="h-4 w-4" />
          How to use this board
        </span>
        <ChevronDown
          className={`h-4 w-4 text-indigo-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="space-y-2 border-t border-indigo-100 px-4 pb-4 pt-3 text-sm text-gray-700 dark:border-indigo-900/40 dark:text-gray-300 sm:px-5">
          <li className="flex items-start gap-2.5">
            <Search className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <span>
              Searching <strong>8 cities</strong> · $2,000-$2,700 · 1+ bedrooms
              · Houses, Apartments, Condos &amp; Townhouses
            </span>
          </li>
          <li>Use Love to save favorites.</li>
          <li>Use Nope to hide listings from the main board.</li>
          <li>Check the Nope Archive for hidden listings.</li>
        </ul>
      )}
    </section>
  );
}
