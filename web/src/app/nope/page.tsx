"use client";

import CategorySection from "@/components/CategorySection";
import type { GroupedListings, Listing } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const EMPTY_GROUPED: GroupedListings = {
  active: {},
  loved: {},
  noped: {},
};

function mergeCities(
  group: Record<string, Record<string, Listing[]>>,
  keys: string[]
) {
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

export default function NopePage() {
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Nope Archive
          </h1>
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
            Back to active listings
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
            <CategorySection
              title="Houses"
              cities={mergeCities(grouped.noped, ["House"])}
              onStatusChanged={loadListings}
              accentColor="border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/35"
            />
            <CategorySection
              title="Apartments"
              cities={mergeCities(grouped.noped, ["Apartment"])}
              onStatusChanged={loadListings}
              accentColor="border-blue-200 bg-blue-100/70 dark:border-blue-900 dark:bg-blue-950/40"
            />
            <CategorySection
              title="Condos & Townhouses"
              cities={mergeCities(grouped.noped, [
                "Condo & Townhouse",
                "Condo/Townhouse",
              ])}
              onStatusChanged={loadListings}
              accentColor="border-purple-200 bg-purple-100/70 dark:border-purple-900 dark:bg-purple-950/40"
            />
            <CategorySection
              title="Other / Unknown"
              cities={mergeCities(grouped.noped, [
                "Other / Unknown",
                "Other/Unknown",
              ])}
              onStatusChanged={loadListings}
              accentColor="border-gray-200 bg-gray-100/70 dark:border-gray-700 dark:bg-gray-800/50"
            />
          </div>
        )}

        <footer className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
          There&apos;s No Place Like a New Home · Nope Archive
        </footer>
      </div>
    </main>
  );
}
