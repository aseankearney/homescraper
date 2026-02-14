"use client";

import CategorySection from "@/components/CategorySection";
import Header from "@/components/Header";
import ManualLinks from "@/components/ManualLinks";
import Tips from "@/components/Tips";
import { buildManualLinks } from "@/lib/config";
import type { GroupedListings, Listing } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const EMPTY_GROUPED: GroupedListings = {
  active: {},
  loved: {},
  noped: {},
};

function countListings(group: Record<string, Record<string, Listing[]>>): number {
  return Object.values(group).reduce(
    (sum, cities) =>
      sum +
      Object.values(cities).reduce((inner, listings) => inner + listings.length, 0),
    0
  );
}

function mergeCities(
  group: Record<string, Record<string, Listing[]>>,
  keys: string[]
): Record<string, Listing[]> {
  const merged: Record<string, Listing[]> = {};
  for (const key of keys) {
    const bucket = group[key];
    if (!bucket) continue;
    for (const [city, listings] of Object.entries(bucket)) {
      merged[city] = [...(merged[city] || []), ...listings];
    }
  }
  return merged;
}

function mergeAllCities(
  group: Record<string, Record<string, Listing[]>>
): Record<string, Listing[]> {
  const merged: Record<string, Listing[]> = {};
  for (const bucket of Object.values(group)) {
    for (const [city, listings] of Object.entries(bucket)) {
      merged[city] = [...(merged[city] || []), ...listings];
    }
  }
  return merged;
}

export default function HomePage() {
  const [grouped, setGrouped] = useState<GroupedListings>(EMPTY_GROUPED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListings = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/listings", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load listings");
      const data = (await res.json()) as GroupedListings;
      setGrouped(data);
    } catch {
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const manualLinks = useMemo(() => buildManualLinks(), []);
  const activeCount = countListings(grouped.active);
  const lovedCount = countListings(grouped.loved);
  const nopedCount = countListings(grouped.noped);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-5">
        <Header />

        <Tips />

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>{activeCount} active listings</span>
          <span>{lovedCount} loved</span>
          <span>{nopedCount} noped</span>
          <Link href="/nope" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
            View Nope Archive
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-300">
            Loading listings...
          </div>
        ) : (
          <div className="space-y-3">
            <ManualLinks links={manualLinks} />

            <CategorySection
              title="Houses"
              cities={mergeCities(grouped.active, ["House"])}
              onStatusChanged={loadListings}
              accentColor="border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/35"
            />
            <CategorySection
              title="Apartments"
              cities={mergeCities(grouped.active, ["Apartment"])}
              onStatusChanged={loadListings}
              accentColor="border-blue-200 bg-blue-100/70 dark:border-blue-900 dark:bg-blue-950/40"
            />
            <CategorySection
              title="Condos & Townhouses"
              cities={mergeCities(grouped.active, [
                "Condo & Townhouse",
                "Condo/Townhouse",
              ])}
              onStatusChanged={loadListings}
              accentColor="border-purple-200 bg-purple-100/70 dark:border-purple-900 dark:bg-purple-950/40"
            />
            <CategorySection
              title="Other / Unknown"
              cities={mergeCities(grouped.active, [
                "Other / Unknown",
                "Other/Unknown",
              ])}
              onStatusChanged={loadListings}
              accentColor="border-gray-200 bg-gray-100/70 dark:border-gray-700 dark:bg-gray-800/50"
            />
            <CategorySection
              title="Loved"
              cities={mergeAllCities(grouped.loved)}
              onStatusChanged={loadListings}
              accentColor="border-pink-200 bg-pink-100/70 dark:border-pink-900 dark:bg-pink-950/35"
            />
          </div>
        )}

        <footer className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
          There&apos;s No Place Like a New Home · Updated at 10 AM &amp; 2 PM PT ·
          Data sourced from Craigslist
        </footer>
      </div>
    </main>
  );
}
