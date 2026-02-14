import { NextRequest, NextResponse } from "next/server";
import { scrapeAllCities } from "@/lib/scraper";
import { appendListings, getExistingIds } from "@/lib/sheets";

export const maxDuration = 10; // Vercel hobby plan limit

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const secret = process.env.CRON_SECRET;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingIds = await getExistingIds();
    const { listings, errors } = await scrapeAllCities();

    const newListings = listings.filter((l) => !existingIds.has(l.listing_id));
    const addedCount = await appendListings(newListings);

    return NextResponse.json({
      success: true,
      new_count: addedCount,
      total_fetched: listings.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Scrape error:", error);
    return NextResponse.json(
      {
        success: false,
        new_count: 0,
        total_fetched: 0,
        errors: [message],
      },
      { status: 500 }
    );
  }
}
