"""Check article registration, sitemap coverage, and shared analytics locally."""

import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
MEASUREMENT_ID = "G-BWX7PFH4XM"


class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            self.sources.append(dict(attrs).get("src", ""))


def main():
    registry = json.loads(
        (ROOT / "assets/articles-data.js").read_text().split("=", 1)[1].strip().rstrip(";")
    )
    urls = [node.text for node in ET.parse(ROOT / "sitemap.xml").findall(".//{*}loc")]
    text_urls = (ROOT / "sitemap.txt").read_text().splitlines()
    registered = [item["archive_path"] for item in registry]
    files = {str(p.relative_to(ROOT)) for p in (ROOT / "articles").glob("*.html")}
    errors = []
    for label, values in (("registry", registered), ("XML sitemap", urls), ("text sitemap", text_urls)):
        errors.extend(f"Duplicate {label} entry: {v}" for v, n in Counter(values).items() if n > 1)
    if set(urls) != set(text_urls):
        errors.append("XML and text sitemaps differ")
    errors.extend(f"Unregistered article: {p}" for p in sorted(files - set(registered)))
    analytics = ROOT / "assets/site-analytics.js"
    if f'measurementId: "{MEASUREMENT_ID}"' not in analytics.read_text():
        errors.append("Shared analytics does not use the Urban measurement ID")
    for item in registry:
        relative = item["archive_path"]
        page = ROOT / relative
        if not page.is_file():
            errors.append(f"Missing article: {relative}")
            continue
        matches = [u for u in urls if urlsplit(u).path.endswith("/punpiti/" + relative)]
        if len(matches) != 1:
            errors.append(f"Expected one sitemap entry: {relative}")
        elif f'<link rel="canonical" href="{matches[0]}"' not in page.read_text():
            errors.append(f"Canonical differs from sitemap: {relative}")
    pages = sorted(files | {p.name for p in ROOT.glob("*.html")})
    checked = 0
    for relative in pages:
        page = ROOT / relative
        content = page.read_text()
        if "</head>" not in content or 'http-equiv="refresh"' in content.lower():
            continue
        parser = Scripts()
        parser.feed(content)
        sources = [s for s in parser.sources if urlsplit(s).path.endswith("site-analytics.js")]
        if len(sources) != 1 or (page.parent / urlsplit(sources[0]).path).resolve() != analytics:
            errors.append(f"Expected one shared analytics script: {relative}")
        checked += 1
    for error in errors:
        print("FAIL:", error)
    print(f"{len(registry)} articles; {len(urls)} sitemap URLs; {checked} pages checked; {len(errors)} errors")
    return bool(errors)


if __name__ == "__main__":
    raise SystemExit(main())
