import { CITY_ALIASES, NO_PET_MARKERS } from "./config";

export function normalizePropertyType(value: string): string {
  const lower = value.toLowerCase().trim();
  if (lower.includes("house") && !lower.includes("townhouse")) return "house";
  if (lower.includes("apartment") || lower.includes("apt")) return "apartment";
  if (lower.includes("condo")) return "condo";
  if (lower.includes("townhouse") || lower.includes("town house")) return "townhouse";
  if (lower.includes("adu")) return "adu";
  return "other";
}

export function categoryBucket(propertyType: string): string {
  const normalized = normalizePropertyType(propertyType);
  switch (normalized) {
    case "house":
    case "adu":
      return "House";
    case "apartment":
      return "Apartment";
    case "condo":
    case "townhouse":
      return "Condo & Townhouse";
    default:
      return "Other / Unknown";
  }
}

export function isNoPetsListing(text: string): boolean {
  const lower = text.toLowerCase();
  return NO_PET_MARKERS.some((marker) => lower.includes(marker));
}

export function normalizeCity(city: string): string {
  const lower = city.toLowerCase().trim();
  return CITY_ALIASES[lower] || city;
}

export function inferPropertyType(title: string, description: string): string {
  const combined = `${title} ${description}`.toLowerCase();
  
  if (combined.match(/\b(house|single[\s-]family|sfr)\b/)) return "house";
  if (combined.match(/\b(apartment|apt|studio)\b/)) return "apartment";
  if (combined.match(/\b(condo|condominium)\b/)) return "condo";
  if (combined.match(/\b(townhouse|town[\s-]house|townhome)\b/)) return "townhouse";
  if (combined.match(/\b(adu|granny[\s-]flat|in[\s-]law|guest[\s-]house)\b/)) return "adu";
  
  return "other";
}

export function extractSquareFeet(text: string): number | undefined {
  const patterns = [
    /(\d{3,5})\s*(?:sq\.?\s*ft\.?|sqft|sf)\b/i,
    /\b(\d{3,5})\s*-\s*sq\.?\s*ft\.?\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = parseInt(match[1], 10);
    if (!Number.isNaN(value) && value >= 200 && value <= 20000) {
      return value;
    }
  }

  return undefined;
}
