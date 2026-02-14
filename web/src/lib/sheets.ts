import { google, sheets_v4 } from "googleapis";
import type { Listing } from "./types";

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON env var");

  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEET_ID env var");
  return id;
}

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

/** Read all listing rows from Sheet1 */
export async function readAllListings(): Promise<Listing[]> {
  const sheets = await getSheetsClient();
  const sheetId = getSheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A2:L",
  });

  const rows = res.data.values || [];
  return rows.map((row) => ({
    listing_id: row[0] || "",
    source: row[1] || "",
    first_seen_at: row[2] || "",
    city: row[3] || "",
    price: parseFloat(row[4]) || 0,
    bedrooms: parseFloat(row[5]) || 0,
    square_feet: row[11] ? parseFloat(row[11]) || undefined : undefined,
    property_type: row[6] || "",
    category_bucket: row[7] || "",
    status: row[8] || "new",
    address: row[9] || "",
    url: row[10] || "",
  }));
}

/** Get set of existing listing IDs */
export async function getExistingIds(): Promise<Set<string>> {
  const sheets = await getSheetsClient();
  const sheetId = getSheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A2:A",
  });

  const rows = res.data.values || [];
  return new Set(rows.map((r) => r[0]).filter(Boolean));
}

/** Append new listings to the sheet */
export async function appendListings(listings: Listing[]): Promise<number> {
  if (listings.length === 0) return 0;

  const sheets = await getSheetsClient();
  const sheetId = getSheetId();

  const rows = listings.map((l) => [
    l.listing_id,
    l.source,
    l.first_seen_at,
    l.city,
    l.price,
    l.bedrooms,
    l.property_type,
    l.category_bucket,
    l.status || "new",
    l.address,
    l.url,
    l.square_feet ?? "",
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:L",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  return listings.length;
}

/** Update a listing's status */
export async function updateListingStatus(
  listingId: string,
  status: string
): Promise<boolean> {
  const sheets = await getSheetsClient();
  const sheetId = getSheetId();

  // Find the row with this listing_id
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A2:A",
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === listingId);
  if (rowIndex === -1) return false;

  const actualRow = rowIndex + 2; // +2 because header is row 1, data starts at row 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Sheet1!I${actualRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });

  return true;
}
