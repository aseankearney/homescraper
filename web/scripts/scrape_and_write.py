import json
import os
import random
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from urllib.parse import quote_plus, urljoin

import requests
from bs4 import BeautifulSoup
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build


SEARCH_CONFIG = {
    "min_price": 2000,
    "max_price": 2700,
    "min_bedrooms": 1,
    "locations": [
        "Woodland Hills",
        "West Hills",
        "Newbury Park",
        "Calabasas",
        "Sherman Oaks",
        "Thousand Oaks",
        "Oak Park",
        "Simi Valley",
    ],
    "max_per_city": 150,
}

# Expanded city/neighborhood keywords for flexible matching
LOCATION_KEYWORDS = {
    "Woodland Hills": ["woodland hills", "woodland", "91364", "91367", "91371"],
    "West Hills": ["west hills", "canoga park", "winnetka", "91307", "91304"],
    "Newbury Park": ["newbury park", "newbury", "91320"],
    "Calabasas": ["calabasas", "91302"],
    "Sherman Oaks": ["sherman oaks", "sherman", "91403", "91423"],
    "Thousand Oaks": ["thousand oaks", "t.o.", "91360", "91362"],
    "Oak Park": ["oak park", "91377"],
    "Simi Valley": ["simi valley", "simi", "93063", "93065"],
}

NO_PET_MARKERS = [
    "no pets",
    "no pet",
    "pets not allowed",
    "pet free",
    "no dogs",
    "no cats",
]

CITY_ALIASES = {
    "canoga park": "West Hills",
    "winnetka": "West Hills",
    "reseda": "Woodland Hills",
    "encino": "Woodland Hills",
    "northridge": "Woodland Hills",
}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

DETAIL_SQFT_FETCH_LIMIT_PER_CITY = 35
DETAIL_SQFT_FETCH_TIMEOUT_SECONDS = 20
DETAIL_SQFT_FETCH_SLEEP_RANGE_SECONDS = (0.8, 1.6)

BACKFILL_MISSING_SQFT_LIMIT = 30


def normalize_city(city: str) -> str:
    key = city.strip().lower()
    return CITY_ALIASES.get(key, city)


def detect_city_from_text(text: str, queried_city: str) -> str:
    """
    Try to detect which city a listing belongs to from its text.
    Returns normalized city name, defaulting to queried city.
    """
    text_lower = text.lower()
    
    # First check if queried city or its keywords are in the text
    if queried_city in LOCATION_KEYWORDS:
        for keyword in LOCATION_KEYWORDS[queried_city]:
            if keyword in text_lower:
                return normalize_city(queried_city)
    
    # Fall back to checking all known cities
    for city, keywords in LOCATION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return normalize_city(city)
    
    # If nothing matches, accept the queried city anyway
    # (Craigslist search should have already filtered geographically)
    return normalize_city(queried_city)


def is_no_pets_listing(text: str) -> bool:
    lower = text.lower()
    return any(marker in lower for marker in NO_PET_MARKERS)


def infer_property_type(title: str, description: str) -> str:
    combined = f"{title} {description}".lower()
    if re.search(r"\b(house|single[\s-]?family|sfr)\b", combined):
        return "house"
    if re.search(r"\b(apartment|apt|studio)\b", combined):
        return "apartment"
    if re.search(r"\b(condo|condominium)\b", combined):
        return "condo"
    if re.search(r"\b(townhouse|town[\s-]?house|townhome)\b", combined):
        return "townhouse"
    if re.search(r"\b(adu|granny[\s-]?flat|in[\s-]?law|guest[\s-]?house)\b", combined):
        return "adu"
    return "other"


def category_bucket(property_type: str) -> str:
    if property_type in ("house", "adu"):
        return "House"
    if property_type == "apartment":
        return "Apartment"
    if property_type in ("condo", "townhouse"):
        return "Condo & Townhouse"
    return "Other / Unknown"


def extract_square_feet(text: str) -> Optional[int]:
    patterns = [
        r"(\d{3,5})\s*(?:sq\.?\s*ft\.?|sqft|sf)\b",
        r"\b(\d{3,5})\s*-\s*sq\.?\s*ft\.?\b",
        r"(\d{3,5})\s*ft2\b",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if not m:
            continue
        value = int(m.group(1))
        if 200 <= value <= 20000:
            return value
    return None


def is_blocked_html(html_text: str) -> bool:
    lower = html_text.lower()
    return (
        "your request has been blocked" in lower
        or "<title>blocked</title>" in lower
        or "help_blocks" in lower
    )


def make_headers(referer: str) -> Dict[str, str]:
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": referer,
    }


def fetch_listing_detail_sqft(
    session: requests.Session, listing_url: str
) -> Optional[int]:
    """
    Try harder: fetch the listing detail page and extract sqft.

    Craigslist often encodes sqft as `850ft2` in the posting attribute group.
    """
    try:
        resp = session.get(
            listing_url,
            headers=make_headers("https://losangeles.craigslist.org/"),
            timeout=DETAIL_SQFT_FETCH_TIMEOUT_SECONDS,
        )
    except Exception:
        return None

    if resp.status_code != 200:
        return None
    if is_blocked_html(resp.text):
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # Most reliable: attribute group spans (e.g. "2BR / 1Ba 850ft2")
    attr_texts = [s.get_text(" ", strip=True) for s in soup.select(".attrgroup span")]
    combined = " ".join(attr_texts)
    sqft = extract_square_feet(combined)
    if sqft:
        return sqft

    # Fallback: search whole body (slower, but catches some posts)
    body_text = soup.get_text(" ", strip=True)
    return extract_square_feet(body_text)


def extract_price(text: str) -> int:
    m = re.search(r"\$(\d[\d,]*)", text)
    if not m:
        return 0
    return int(m.group(1).replace(",", ""))


def extract_bedrooms(text: str) -> int:
    m = re.search(r"(\d+)\s*(?:br|bed|bedroom)s?\b", text, re.IGNORECASE)
    if not m:
        return 1
    return int(m.group(1))


def get_sheets_service():
    raw = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not raw:
        raise RuntimeError("Missing GOOGLE_SERVICE_ACCOUNT_JSON env var")

    creds_info = json.loads(raw)
    creds = Credentials.from_service_account_info(
        creds_info, scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    return build("sheets", "v4", credentials=creds)


def get_sheet_id() -> str:
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    if not sheet_id:
        raise RuntimeError("Missing GOOGLE_SHEET_ID env var")
    return sheet_id


def get_existing_ids(service, sheet_id: str) -> Set[str]:
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=sheet_id, range="Sheet1!A2:A")
        .execute()
    )
    values = result.get("values", [])
    return {row[0] for row in values if row and row[0]}


def append_rows(service, sheet_id: str, rows: List[List[object]]) -> None:
    if not rows:
        return
    (
        service.spreadsheets()
        .values()
        .append(
            spreadsheetId=sheet_id,
            range="Sheet1!A:L",
            valueInputOption="RAW",
            body={"values": rows},
        )
        .execute()
    )


def fetch_city(
    session: requests.Session, city_query: str, existing_ids: Set[str]
) -> List[Dict[str, object]]:
    encoded = quote_plus(city_query)
    url = (
        "https://losangeles.craigslist.org/search/apa?"
        f"query={encoded}"
        f"&min_price={SEARCH_CONFIG['min_price']}"
        f"&max_price={SEARCH_CONFIG['max_price']}"
        f"&min_bedrooms={SEARCH_CONFIG['min_bedrooms']}"
        "&availabilityMode=0"
        "&sale_date=all+dates"
    )

    resp = session.get(url, headers=make_headers("https://losangeles.craigslist.org/"), timeout=25)
    if resp.status_code != 200:
        raise RuntimeError(f"HTTP {resp.status_code}")

    if is_blocked_html(resp.text):
        raise RuntimeError("Blocked by Craigslist")

    soup = BeautifulSoup(resp.text, "html.parser")
    cards = soup.select(".cl-static-search-result, .result-row")

    listings: List[Dict[str, object]] = []
    detail_fetches = 0
    for card in cards:
        link_tag = card.select_one("a[href]")
        if not link_tag:
            continue

        href = link_tag.get("href", "").strip()
        if not href:
            continue
        full_url = urljoin("https://losangeles.craigslist.org", href)

        # Extract title from multiple possible locations
        title_tag = card.select_one(".title, .titlestring, .posting-title, .cl-posting-title")
        title = (title_tag.get_text(" ", strip=True) if title_tag else "").strip()
        if not title:
            title = link_tag.get_text(" ", strip=True)

        # Extract price
        price_tag = card.select_one(".price, .priceinfo, .result-price, .priceinfo .price")
        price_text = price_tag.get_text(" ", strip=True) if price_tag else title
        price = extract_price(price_text if "$" in price_text else title)
        if price < SEARCH_CONFIG["min_price"] or price > SEARCH_CONFIG["max_price"]:
            continue

        # Get full card text and location metadata
        body_text = card.get_text(" ", strip=True)
        
        # Extract location info from "housing" or "meta" tags
        housing_tag = card.select_one(".housing, .result-hood, .meta .result-hood")
        location_text = housing_tag.get_text(" ", strip=True) if housing_tag else ""
        
        # Combine all text for city detection
        combined_text = f"{title} {body_text} {location_text}"
        
        bedrooms = extract_bedrooms(combined_text)
        if bedrooms < SEARCH_CONFIG["min_bedrooms"]:
            continue

        if is_no_pets_listing(combined_text):
            continue

        # Use flexible city detection instead of strict filter
        city = detect_city_from_text(combined_text, city_query)
        property_type = infer_property_type(title, body_text)
        sqft = extract_square_feet(combined_text)

        id_match = re.search(r"/(\d+)\.html", full_url)
        listing_id = f"craigslist:{id_match.group(1)}" if id_match else f"craigslist:{hash(full_url)}"

        # Skip if we already have this listing (avoids extra detail-page fetches)
        if listing_id in existing_ids:
            continue

        # If sqft isn't in the search-card snippet, fetch the detail page (limited)
        if not sqft and detail_fetches < DETAIL_SQFT_FETCH_LIMIT_PER_CITY:
            sqft = fetch_listing_detail_sqft(session, full_url)
            detail_fetches += 1
            time.sleep(random.uniform(*DETAIL_SQFT_FETCH_SLEEP_RANGE_SECONDS))

        listings.append(
            {
                "listing_id": listing_id,
                "source": "craigslist",
                "first_seen_at": datetime.now(timezone.utc).isoformat(),
                "city": city,
                "price": price,
                "bedrooms": bedrooms,
                "square_feet": sqft,
                "property_type": property_type,
                "category_bucket": category_bucket(property_type),
                "status": "new",
                "address": title,
                "url": full_url,
            }
        )

        if len(listings) >= SEARCH_CONFIG["max_per_city"]:
            break

    return listings


def listing_to_row(l: Dict[str, object]) -> List[object]:
    return [
        l["listing_id"],
        l["source"],
        l["first_seen_at"],
        l["city"],
        l["price"],
        l["bedrooms"],
        l["property_type"],
        l["category_bucket"],
        l["status"],
        l["address"],
        l["url"],
        l["square_feet"] or "",
    ]


def get_recent_missing_sqft_rows(
    service, sheet_id: str, limit: int
) -> List[Dict[str, object]]:
    """
    Backfill sqft for recent rows where sqft column is empty.
    Returns rows with row_num + url + listing_id.
    """
    res = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=sheet_id, range="Sheet1!A2:L")
        .execute()
    )
    values = res.get("values", [])

    missing: List[Dict[str, object]] = []
    # Walk from bottom so we backfill newest first.
    for idx in range(len(values) - 1, -1, -1):
        row = values[idx]
        listing_id = row[0] if len(row) > 0 else ""
        url = row[10] if len(row) > 10 else ""
        sqft_val = row[11] if len(row) > 11 else ""
        if not listing_id or not url:
            continue
        if str(sqft_val).strip() != "":
            continue
        missing.append({"row_num": idx + 2, "url": url, "listing_id": listing_id})
        if len(missing) >= limit:
            break
    return missing


def update_sqft_cell(service, sheet_id: str, row_num: int, sqft: int) -> None:
    (
        service.spreadsheets()
        .values()
        .update(
            spreadsheetId=sheet_id,
            range=f"Sheet1!L{row_num}",
            valueInputOption="RAW",
            body={"values": [[sqft]]},
        )
        .execute()
    )


def main() -> None:
    started_at = datetime.now(timezone.utc).isoformat()
    print(f"[scrape] started at {started_at}")
    print("[scrape] using Python requests + BeautifulSoup (Craigslist HTML)")

    service = get_sheets_service()
    sheet_id = get_sheet_id()
    existing_ids = get_existing_ids(service, sheet_id)
    session = requests.Session()

    all_listings: List[Dict[str, object]] = []
    errors: List[str] = []

    for city in SEARCH_CONFIG["locations"]:
        try:
            city_listings = fetch_city(session, city, existing_ids)
            all_listings.extend(city_listings)
            print(f"✓ {city}: {len(city_listings)} listings")
        except Exception as exc:  # noqa: BLE001
            msg = f"Failed to fetch {city}: {exc}"
            errors.append(msg)
            print(f"✗ {msg}")
        time.sleep(random.uniform(1.2, 2.4))

    deduped: List[Dict[str, object]] = []
    seen_ids: Set[str] = set()
    for listing in all_listings:
        lid = str(listing["listing_id"])
        if lid in seen_ids:
            continue
        seen_ids.add(lid)
        deduped.append(listing)

    new_listings = [l for l in deduped if l["listing_id"] not in existing_ids]
    rows = [listing_to_row(l) for l in new_listings]
    append_rows(service, sheet_id, rows)

    # Backfill sqft for recent rows missing it (kept small to avoid blocks)
    backfill_done = 0
    backfill_candidates = get_recent_missing_sqft_rows(
        service, sheet_id, BACKFILL_MISSING_SQFT_LIMIT
    )
    for candidate in backfill_candidates:
        sqft = fetch_listing_detail_sqft(session, str(candidate["url"]))
        if sqft:
            update_sqft_cell(service, sheet_id, int(candidate["row_num"]), sqft)
            backfill_done += 1
        time.sleep(random.uniform(*DETAIL_SQFT_FETCH_SLEEP_RANGE_SECONDS))

    summary = {
        "startedAt": started_at,
        "totalFetched": len(all_listings),
        "dedupedFetched": len(deduped),
        "newListings": len(new_listings),
        "addedCount": len(rows),
        "sqftBackfilled": backfill_done,
        "errorCount": len(errors),
        "errors": errors,
    }
    print("[scrape] summary:")
    print(json.dumps(summary, indent=2))

    if len(all_listings) == 0 and errors:
        print("[scrape] Warning: no listings fetched. Source may be blocking requests.")


if __name__ == "__main__":
    main()
