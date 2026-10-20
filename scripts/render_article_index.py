"""Build crawlable article cards from the registry; use --check before publishing."""

import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START = "    <!-- BEGIN GENERATED ARTICLE LIST -->"
END = "    <!-- END GENERATED ARTICLE LIST -->"


def render():
    articles = json.loads((ROOT / "assets/articles-data.js").read_text().split("=", 1)[1].strip().rstrip(";"))
    lines = [START, '    <section id="article-list" class="article-list" aria-live="polite">']
    for article in articles:
        esc = lambda value: html.escape(str(value or ""), quote=True)
        text_only = article.get("image_index") is None
        classes = "article-row article-row--text" if text_only else "article-row"
        lines.append(f'      <a class="{classes}" href="{esc(article["archive_path"])}">')
        if not text_only:
            image = article.get("image_index") or "assets/convergence.png"
            lines.append(f'        <img src="{esc(image)}" alt="{esc(article.get("image_alt"))}" loading="lazy" decoding="async">')
        meta = " / ".join(filter(None, [article.get("category"), article.get("display_date")]))
        lines.extend([
            '        <div class="article-row__body">',
            f'          <div class="meta">{esc(meta)}</div>',
            f'          <h3>{esc(article["title"])}</h3>',
            f'          <p>{esc(article.get("summary"))}</p>',
            '        </div>',
            '      </a>',
        ])
    lines.extend(['    </section>', END])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    path = ROOT / "articles.html"
    page = path.read_text()
    before, remaining = page.split(START, 1)
    _, after = remaining.split(END, 1)
    expected = before + render() + after
    if args.check:
        if expected != page:
            raise SystemExit("Article cards are stale: run python3 scripts/render_article_index.py")
        print("Static article index matches the registry")
    else:
        path.write_text(expected)
        print("Rendered article cards into articles.html")


if __name__ == "__main__":
    main()
