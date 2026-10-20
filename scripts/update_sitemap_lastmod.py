"""Write <lastmod> into sitemap.xml.

Articles use their JSON-LD dateModified (falling back to datePublished);
other pages use the date of the last Git commit that touched the file.
"""

import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://madlab.cpe.ku.ac.th/punpiti/"
LD = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)


def page_for(url):
    rel = url[len(BASE):] or "index.html"
    return ROOT / rel


def article_date(page):
    for block in LD.findall(page.read_text()):
        data = json.loads(block)
        value = data.get("dateModified") or data.get("datePublished")
        if value:
            return value[:10]
    return None


def git_date(page):
    out = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", str(page.relative_to(ROOT))],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout.strip()
    return out or None


def main():
    sitemap = ROOT / "sitemap.xml"
    text = re.sub(r"\s*<lastmod>[^<]*</lastmod>", "", sitemap.read_text())
    missing = []

    def add(match):
        url = match.group(1)
        page = page_for(url)
        date = (article_date(page) if "/articles/" in url else None) or git_date(page)
        if not date:
            missing.append(url)
            return match.group(0)
        return f"{match.group(0)}\n    <lastmod>{date}</lastmod>"

    text = re.sub(r"<loc>([^<]+)</loc>", add, text)
    sitemap.write_text(text)
    print(f"lastmod written; {len(missing)} URLs without a date")
    for url in missing:
        print("  ", url)


if __name__ == "__main__":
    main()
