"use client";

import type { Listing } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import CityGroup from "./CityGroup";

interface CategorySectionProps {
  title: string;
  cities: Record<string, Listing[]>;
  accentColor?: string;
  onStatusChanged: () => void;
}

export default function CategorySection({
  title,
  cities,
  accentColor = "border-gray-200 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-800/40",
  onStatusChanged,
}: CategorySectionProps) {
  const [open, setOpen] = useState(false);
  const cityEntries = Object.entries(cities).sort((a, b) => a[0].localeCompare(b[0]));
  const total = cityEntries.reduce((sum, [, items]) => sum + items.length, 0);

  return (
    <section className={`overflow-hidden rounded-xl border shadow-sm ${accentColor}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left sm:px-5 sm:py-4"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {title} ({total})
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
          {cityEntries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
              No listings in this category yet.
            </div>
          ) : (
            cityEntries.map(([city, listings]) => (
              <CityGroup
                key={city}
                city={city}
                listings={listings}
                onStatusChanged={onStatusChanged}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
