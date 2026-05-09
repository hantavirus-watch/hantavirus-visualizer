#!/usr/bin/env python3
"""
Hantavirus Telegram bot.
Reads outbreak.json and sends a formatted summary to a Telegram chat.

Required environment variables:
  TELEGRAM_BOT_TOKEN  – token from @BotFather
  TELEGRAM_CHAT_ID    – target chat/channel ID (e.g. @mychannel or numeric ID)

Optional:
  FORCE_SEND=1        – send even if nothing changed since last run
"""

import json
import os
import sys
import hashlib
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError
from urllib.parse import urlencode

# ── Config ─────────────────────────────────────────────────────────────────────

OUTBREAK_JSON = Path(__file__).parent / "hanta-visualizer" / "public" / "outbreak.json"
STATE_FILE    = Path(__file__).parent / ".telegram_state"
SITE_URL      = "https://hantavirus-watch.github.io/hantavirus-visualizer/"
MAX_CLUSTERS  = 5   # max locations to list in the message

TOKEN   = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
FORCE   = os.environ.get("FORCE_SEND", "") == "1"


# ── Helpers ────────────────────────────────────────────────────────────────────

def tg_api(method: str, payload: dict) -> dict:
    url  = f"https://api.telegram.org/bot{TOKEN}/{method}"
    data = json.dumps(payload).encode()
    req  = Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except URLError as exc:
        print(f"[ERROR] Telegram API error: {exc}")
        sys.exit(1)


def send_message(text: str, disable_preview: bool = True):
    return tg_api("sendMessage", {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": disable_preview,
        "link_preview_options": {"is_disabled": disable_preview},
    })


def severity_emoji(count: int) -> str:
    if count >= 5:
        return "🔴"
    if count >= 3:
        return "🟠"
    return "🟡"


def severity_label(count: int) -> str:
    if count >= 5:
        return "HIGH"
    if count >= 3:
        return "MEDIUM"
    return "LOW"


def build_message(clusters: list[dict], total_reports: int) -> str:
    lines = [
        "🦠 <b>HantaWatch — Outbreak Update</b>",
        "",
        f"📊 <b>{total_reports}</b> reports · <b>{len(clusters)}</b> active clusters",
        "",
        "📍 <b>Top locations:</b>",
    ]

    for cluster in clusters[:MAX_CLUSTERS]:
        emoji = severity_emoji(cluster["reportCount"])
        label = severity_label(cluster["reportCount"])
        name  = cluster["locationName"]
        count = cluster["reportCount"]
        lines.append(f"{emoji} <b>{name}</b> — {count} reports <i>({label})</i>")

    if len(clusters) > MAX_CLUSTERS:
        lines.append(f"  <i>…and {len(clusters) - MAX_CLUSTERS} more locations</i>")

    lines += [
        "",
        f'🔗 <a href="{SITE_URL}">Open live map</a>',
    ]

    return "\n".join(lines)


def fingerprint(clusters: list) -> str:
    """Hash cluster list to detect changes since last run."""
    key = json.dumps(
        [{"loc": c["locationName"], "n": c["reportCount"]} for c in clusters],
        sort_keys=True
    )
    return hashlib.sha256(key.encode()).hexdigest()[:16]


def load_state() -> str:
    if STATE_FILE.exists():
        return STATE_FILE.read_text().strip()
    return ""


def save_state(fp: str):
    STATE_FILE.write_text(fp)


# ── Data processing ────────────────────────────────────────────────────────────

def group_to_clusters(data: list[dict]) -> list[dict]:
    """Reproduce the same grouping logic as the React app."""
    groups: dict[str, dict] = {}
    for item in data:
        name = item.get("location_name") or "Unknown"
        coords = item.get("coordinates")
        if not coords:
            continue
        key = f"{name}:{coords[0]:.4f}:{coords[1]:.4f}"
        if key in groups:
            groups[key]["reportCount"] += 1
        else:
            groups[key] = {"locationName": name, "reportCount": 1}

    return sorted(groups.values(), key=lambda x: -x["reportCount"])


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    if not TOKEN or not CHAT_ID:
        print("Skipping Telegram update: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are not set.")
        return

    if not OUTBREAK_JSON.exists():
        print(f"[ERROR] {OUTBREAK_JSON} not found. Run scraper.py first.")
        sys.exit(1)

    data     = json.loads(OUTBREAK_JSON.read_text())
    clusters = group_to_clusters(data)
    total    = len(data)

    fp = fingerprint(clusters)
    if not FORCE and fp == load_state():
        print("No changes since last run — skipping Telegram message.")
        return

    msg = build_message(clusters, total)
    result = send_message(msg)

    if result.get("ok"):
        save_state(fp)
        print(f"Message sent ✓ ({len(clusters)} clusters, {total} reports)")
    else:
        print(f"[ERROR] Telegram returned: {result}")
        sys.exit(1)


if __name__ == "__main__":
    main()
