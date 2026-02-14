import { NextRequest, NextResponse } from "next/server";
import { updateListingStatus } from "@/lib/sheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listing_id, status } = body;

    if (!listing_id || !status) {
      return NextResponse.json(
        { error: "Missing listing_id or status" },
        { status: 400 }
      );
    }

    if (!["new", "love", "nope"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const success = await updateListingStatus(listing_id, status);

    if (success) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Status update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
