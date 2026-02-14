import { NextResponse } from "next/server";
import { readAllListings } from "@/lib/sheets";
import type { GroupedListings, Listing } from "@/lib/types";

export const revalidate = 0; // Don't cache

export async function GET() {
  try {
    const all = await readAllListings();
    
    const grouped: GroupedListings = {
      active: {},
      loved: {},
      noped: {},
    };

    for (const listing of all) {
      const status = listing.status || "new";
      const bucket = listing.category_bucket || "Other / Unknown";

      if (status === "love") {
        if (!grouped.loved[bucket]) grouped.loved[bucket] = {};
        if (!grouped.loved[bucket][listing.city]) grouped.loved[bucket][listing.city] = [];
        grouped.loved[bucket][listing.city].push(listing);
      } else if (status === "nope") {
        if (!grouped.noped[bucket]) grouped.noped[bucket] = {};
        if (!grouped.noped[bucket][listing.city]) grouped.noped[bucket][listing.city] = [];
        grouped.noped[bucket][listing.city].push(listing);
      } else {
        // new or empty status → active
        if (!grouped.active[bucket]) grouped.active[bucket] = {};
        if (!grouped.active[bucket][listing.city]) grouped.active[bucket][listing.city] = [];
        grouped.active[bucket][listing.city].push(listing);
      }
    }

    // Sort within each city by price ascending
    const sortListings = (group: Record<string, Record<string, Listing[]>>) => {
      for (const bucket in group) {
        for (const city in group[bucket]) {
          group[bucket][city].sort((a, b) => a.price - b.price);
        }
      }
    };
    
    sortListings(grouped.active);
    sortListings(grouped.loved);
    sortListings(grouped.noped);

    return NextResponse.json(grouped);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
