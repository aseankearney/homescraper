"use client";

import type { Listing } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import ListingCard from "./ListingCard";

interface CityGroupProps {
  city: string;
  listings: Listing[];
  onStatusChanged: () => void;
}

export default function CityGroup({
  city,
  listings,
  onStatusChanged,
}: CityGroupProps) {
  const [open, setOpen] = useState(false);
  const sorted = useMemo(
    () => [...listings].sort((a, b) => a.price - b.price),
    [listings]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white/70 dark:border-gray-700 dark:bg-slate-900/45">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left sm:px-4"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {city} ({listings.length})
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-2 px-2 pb-2.5 sm:px-4 sm:pb-3">
          {sorted.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              onStatusChanged={onStatusChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
