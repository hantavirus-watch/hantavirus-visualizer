#!/usr/bin/env python3
"""
Hantavirus outbreak scraper.
Fetches hantavirus-related reports from ProMED and WHO RSS feeds,
geocodes locations, and writes outbreak.json for the visualizer.
"""

import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError
from xml.etree import ElementTree as ET

# ── Config ─────────────────────────────────────────────────────────────────────

OUTPUT_PATH = Path(__file__).parent / "hanta-visualizer" / "public" / "outbreak.json"

FEEDS = [
    {
        "source": "ProMED",
        "url": "https://promedmail.org/feed/",
    },
    {
        "source": "WHO DON",
        "url": "https://www.who.int/feeds/entity/csr/don/en/rss.xml",
    },
    {
        "source": "CDC",
        "url": "https://tools.cdc.gov/api/v2/resources/media/132608.rss",
    },
]

HANTA_KEYWORDS = [
    "hantavirus", "hantaviral", "hanta virus",
    "hps", "hantavirus pulmonary syndrome",
    "hemorrhagic fever with renal syndrome", "hfrs",
    "sin nombre", "andes virus", "puumala", "seoul virus",
    "hantaan",
]

# Known locations with coordinates for pattern matching
KNOWN_LOCATIONS = [
    {"name": "Argentina", "coords": [-34.6037, -58.3816], "patterns": [r"\bargentina\b", r"\bpatagonia\b"]},
    {"name": "Chile", "coords": [-33.4569, -70.6483], "patterns": [r"\bchile\b", r"\bchilean\b"]},
    {"name": "Brazil", "coords": [-15.7939, -47.8828], "patterns": [r"\bbrazil\b", r"\bbrasil\b"]},
    {"name": "Bolivia", "coords": [-16.2902, -63.5887], "patterns": [r"\bbolivia\b"]},
    {"name": "Panama", "coords": [8.9936, -79.5197], "patterns": [r"\bpanama\b"]},
    {"name": "Uruguay", "coords": [-34.9011, -56.1915], "patterns": [r"\buruguay\b"]},
    {"name": "Paraguay", "coords": [-23.4425, -58.4438], "patterns": [r"\bparaguay\b"]},
    {"name": "Peru", "coords": [-12.0464, -77.0428], "patterns": [r"\bperu\b", r"\bperuvian\b"]},
    {"name": "USA", "coords": [38.8951, -77.0364], "patterns": [r"\bunited states\b", r"\busa\b", r"\bu\.s\.\b", r"\bamerica\b"]},
    {"name": "Canada", "coords": [45.4215, -75.6972], "patterns": [r"\bcanada\b", r"\bcanadian\b"]},
    {"name": "Germany", "coords": [52.5200, 13.4050], "patterns": [r"\bgermany\b", r"\bgerman\b", r"\bdeutschland\b"]},
    {"name": "Finland", "coords": [60.1699, 24.9384], "patterns": [r"\bfinland\b", r"\bfinnish\b"]},
    {"name": "Sweden", "coords": [59.3293, 18.0686], "patterns": [r"\bsweden\b", r"\bswedish\b"]},
    {"name": "Russia", "coords": [55.7558, 37.6176], "patterns": [r"\brussia\b", r"\brussian\b"]},
    {"name": "China", "coords": [39.9042, 116.4074], "patterns": [r"\bchina\b", r"\bchinese\b"]},
    {"name": "South Korea", "coords": [37.5665, 126.9780], "patterns": [r"\bkorea\b", r"\bkorean\b", r"\bsouth korea\b"]},
    {"name": "Japan", "coords": [35.6762, 139.6503], "patterns": [r"\bjapan\b", r"\bjapanese\b"]},
    {"name": "Spain", "coords": [40.4168, -3.7038], "patterns": [r"\bspain\b", r"\bspanish\b", r"\bespa[ñn]a\b"]},
    {"name": "France", "coords": [48.8566, 2.3522], "patterns": [r"\bfrance\b", r"\bfrench\b"]},
    {"name": "Canary Islands", "coords": [28.2916, -16.6291], "patterns": [r"\bcanary islands\b", r"\bcanarias\b", r"\btenerife\b", r"\bgran canaria\b"]},
    {"name": "Balkans", "coords": [44.0, 21.0], "patterns": [r"\bserbia\b", r"\bbalkans\b", r"\bbosnia\b", r"\bcroatia\b", r"\bkosovo\b"]},
]


# ── Helpers ────────────────────────────────────────────────────────────────────

def is_hanta_related(text: str) -> bool:
    low = text.lower()
    return any(kw in low for kw in HANTA_KEYWORDS)


def resolve_location(text: str):
    low = text.lower()
    for loc in KNOWN_LOCATIONS:
        for pattern in loc["patterns"]:
            if re.search(pattern, low):
                return loc["name"], loc["coords"]
    return None, None


def parse_date(raw: str) -> str:
    """Parse various date formats into ISO-8601 UTC."""
    if not raw:
        return datetime.now(timezone.utc).isoformat()
    for fmt in (
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S GMT",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(raw.strip(), fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).isoformat()
        except ValueError:
            continue
    return datetime.now(timezone.utc).isoformat()


def fetch_feed(url: str, source: str) -> list[dict]:
    items = []
    try:
        req = Request(url, headers={"User-Agent": "HantavirusVisualizer/1.0"})
        with urlopen(req, timeout=15) as resp:
            body = resp.read()
        root = ET.fromstring(body)
    except (URLError, ET.ParseError) as exc:
        print(f"  [WARN] {source}: {exc}")
        return items

    # Support both RSS <item> and Atom <entry>
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entries = root.findall(".//item") or root.findall(".//atom:entry", ns)

    for entry in entries:
        def text(tag):
            el = entry.find(tag) or entry.find(f"atom:{tag}", ns)
            return (el.text or "").strip() if el is not None else ""

        title = text("title")
        link  = text("link") or text("id")
        pub   = text("pubDate") or text("published") or text("updated")
        desc  = text("description") or text("summary") or text("content")

        combined = f"{title} {desc}"
        if not is_hanta_related(combined):
            continue

        location_name, coords = resolve_location(combined)

        items.append({
            "title": title,
            "link": link,
            "published": parse_date(pub),
            "source": source,
            "location_name": location_name or "Unknown",
            **({"coordinates": coords} if coords else {}),
        })

    print(f"  {source}: {len(items)} hantavirus items found")
    return items


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Fetching hantavirus outbreak data...")
    all_items = []

    for feed in FEEDS:
        print(f"  → {feed['source']}")
        items = fetch_feed(feed["url"], feed["source"])
        all_items.extend(items)
        time.sleep(1)  # polite delay between requests

    # Deduplicate by link
    seen = set()
    unique = []
    for item in all_items:
        if item["link"] not in seen:
            seen.add(item["link"])
            unique.append(item)

    # Sort newest first
    unique.sort(key=lambda x: x["published"], reverse=True)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(unique, ensure_ascii=False, indent=2))
    print(f"\nWrote {len(unique)} items → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
