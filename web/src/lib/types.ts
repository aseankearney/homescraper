export interface Listing {
  listing_id: string;
  source: string;
  first_seen_at: string;
  city: string;
  price: number;
  bedrooms: number;
  square_feet?: number;
  property_type: string;
  category_bucket: string;
  status: string;
  address: string;
  url: string;
}

export interface GroupedListings {
  active: Record<string, Record<string, Listing[]>>;
  loved: Record<string, Record<string, Listing[]>>;
  noped: Record<string, Record<string, Listing[]>>;
}

export interface ManualLink {
  source: string;
  label: string;
  url: string;
}

export interface ScrapeResult {
  success: boolean;
  new_count: number;
  total_fetched: number;
  errors?: string[];
}

export interface StatusUpdateResult {
  ok: boolean;
  error?: string;
}
