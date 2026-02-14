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
    "max_per_city": 120,
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


def normalize_city(city: str) -> str:
    key = city.strip().lower()
    return CITY_ALIASES.get(key, city)


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
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if not m:
            continue
        value = int(m.group(1))
        if 200 <= value <= 20000:
            return value
    return None


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


def fetch_city(city_query: str) -> List[Dict[str, object]]:
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

    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://losangeles.craigslist.org/",
    }

    resp = requests.get(url, headers=headers, timeout=25)
    if resp.status_code != 200:
        raise RuntimeError(f"HTTP {resp.status_code}")

    lower = resp.text.lower()
    if "your request has been blocked" in lower:
        raise RuntimeError("Blocked by Craigslist")

    soup = BeautifulSoup(resp.text, "html.parser")
    cards = soup.select(".cl-static-search-result, .result-row")

    listings: List[Dict[str, object]] = []
    city_lower = city_query.lower()
    for card in cards:
        link_tag = card.select_one("a[href]")
        if not link_tag:
            continue

        href = link_tag.get("href", "").strip()
        if not href:
            continue
        full_url = urljoin("https://losangeles.craigslist.org", href)

        title_tag = card.select_one(".title, .titlestring, .posting-title")
        title = (title_tag.get_text(" ", strip=True) if title_tag else "").strip()
        if not title:
            title = link_tag.get_text(" ", strip=True)

        price_tag = card.select_one(".price, .priceinfo, .result-price")
        price_text = price_tag.get_text(" ", strip=True) if price_tag else title
        price = extract_price(price_text if "$" in price_text else title)
        if price < SEARCH_CONFIG["min_price"] or price > SEARCH_CONFIG["max_price"]:
            continue

        body_text = card.get_text(" ", strip=True)
        if city_lower not in body_text.lower():
            continue

        bedrooms = extract_bedrooms(f"{title} {body_text}")
        if bedrooms < SEARCH_CONFIG["min_bedrooms"]:
            continue

        if is_no_pets_listing(body_text):
            continue

        city = normalize_city(city_query)
        property_type = infer_property_type(title, body_text)
        sqft = extract_square_feet(f"{title} {body_text}")

        id_match = re.search(r"/(\d+)\.html", full_url)
        listing_id = f"craigslist:{id_match.group(1)}" if id_match else f"craigslist:{hash(full_url)}"

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


def main() -> None:
    started_at = datetime.now(timezone.utc).isoformat()
    print(f"[scrape] started at {started_at}")
    print("[scrape] using Python requests + BeautifulSoup (Craigslist HTML)")

    service = get_sheets_service()
    sheet_id = get_sheet_id()
    existing_ids = get_existing_ids(service, sheet_id)

    all_listings: List[Dict[str, object]] = []
    errors: List[str] = []

    for city in SEARCH_CONFIG["locations"]:
        try:
            city_listings = fetch_city(city)
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

    summary = {
        "startedAt": started_at,
        "totalFetched": len(all_listings),
        "dedupedFetched": len(deduped),
        "newListings": len(new_listings),
        "addedCount": len(rows),
        "errorCount": len(errors),
        "errors": errors,
    }
    print("[scrape] summary:")
    print(json.dumps(summary, indent=2))

    if len(all_listings) == 0 and errors:
        print("[scrape] Warning: no listings fetched. Source may be blocking requests.")


if __name__ == "__main__":
    main()
