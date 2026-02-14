import { XMLParser } from "fast-xml-parser";
import type { Listing } from "./types";
import {
  normalizeCity,
  inferPropertyType,
  categoryBucket,
  isNoPetsListing,
  extractSquareFeet,
} from "./filtering";
import { SEARCH_CONFIG } from "./config";

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  "enc:enclosure"?: { "@_url"?: string };
  "dc:date"?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function fetchWithRetries(urls: string[]): Promise<string> {
  const userAgents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  let lastError = "Unknown fetch error";

  for (const url of urls) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const userAgent = userAgents[(attempt - 1) % userAgents.length];
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": userAgent,
            Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
            Referer: "https://losangeles.craigslist.org/",
          },
        });

        if (!response.ok) {
          lastError = `HTTP ${response.status}`;
          if (response.status === 403 || response.status === 429 || response.status >= 500) {
            const backoffMs = 400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300);
            await sleep(backoffMs);
            continue;
          }
          throw new Error(lastError);
        }

        return await response.text();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error.message : "Unknown fetch error";
        const backoffMs = 400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300);
        await sleep(backoffMs);
      }
    }
  }

  throw new Error(lastError);
}

async function fetchCityRss(cityQuery: string): Promise<Listing[]> {
  const { minPrice, maxPrice, minBedrooms } = SEARCH_CONFIG;
  const encodedQuery = encodeURIComponent(cityQuery);
  const rssUrls = [
    `https://losangeles.craigslist.org/search/apa?format=rss&query=${encodedQuery}&min_price=${minPrice}&max_price=${maxPrice}&min_bedrooms=${minBedrooms}`,
    `https://losangeles.craigslist.org/search/apa?query=${encodedQuery}&min_price=${minPrice}&max_price=${maxPrice}&min_bedrooms=${minBedrooms}&format=rss&sort=date`,
    `https://losangeles.craigslist.org/search/apa?query=${encodedQuery}&format=rss`,
  ];

  try {
    const xml = await fetchWithRetries(rssUrls);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(xml);

    const items = toArray<RSSItem>(parsed?.rss?.channel?.item);
    const listings: Listing[] = [];

    for (const item of items) {
      const title = item.title || "";
      const url = item.link || "";
      const description = item.description || "";
      const timestamp = item["dc:date"] || new Date().toISOString();
      const combinedText = `${title} ${description}`;

      // Filter out "no pets" listings
      if (isNoPetsListing(title) || isNoPetsListing(description)) {
        continue;
      }

      // Extract price
      const priceMatch = title.match(/\$(\d+)/);
      const price = priceMatch ? parseInt(priceMatch[1]) : 0;

      // Extract bedrooms
      const bedroomMatch = title.match(/(\d+)br/i);
      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : 1;

      // Extract city from title or description
      let city = cityQuery;
      const titleLower = title.toLowerCase();
      for (const loc of SEARCH_CONFIG.locations) {
        if (titleLower.includes(loc.toLowerCase())) {
          city = loc;
          break;
        }
      }
      city = normalizeCity(city);

      // Infer property type
      const propertyType = inferPropertyType(title, description);
      const squareFeet = extractSquareFeet(combinedText);

      // Generate listing ID from URL
      const idMatch = url.match(/\/(\d+)\.html/);
      const listingId = `craigslist:${idMatch ? idMatch[1] : Date.now()}`;

      listings.push({
        listing_id: listingId,
        source: "craigslist",
        first_seen_at: timestamp,
        city,
        price,
        bedrooms,
        square_feet: squareFeet,
        property_type: propertyType,
        category_bucket: categoryBucket(propertyType),
        status: "new",
        address: title.split("-").slice(1).join("-").trim() || title,
        url,
      });
    }

    return listings;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch ${cityQuery}: ${message}`);
  }
}

export async function scrapeAllCities(): Promise<{
  listings: Listing[];
  errors: string[];
}> {
  const { locations } = SEARCH_CONFIG;
  const results = await Promise.allSettled(
    locations.map((city) => fetchCityRss(city))
  );

  const listings: Listing[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      listings.push(...result.value);
    } else {
      errors.push(result.reason.message);
    }
  }

  return { listings, errors };
}
