#!/usr/bin/env python3
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

BASE_URL = "https://jaynishshah.com"
BASE_HOSTS = {"jaynishshah.com", "www.jaynishshah.com"}
OUTPUT_DIR = Path("src")
USER_AGENT = "Mozilla/5.0 (compatible; EleventyClone/1.0)"

SITEMAPS = [
    "https://jaynishshah.com/wp-sitemap-posts-post-1.xml",
    "https://jaynishshah.com/wp-sitemap-posts-page-1.xml",
    "https://jaynishshah.com/wp-sitemap-taxonomies-category-1.xml",
    "https://jaynishshah.com/wp-sitemap-taxonomies-post_tag-1.xml",
    "https://jaynishshah.com/wp-sitemap-users-1.xml",
]

URL_RE = re.compile(r"url\(([^)]+)\)")
IMPORT_RE = re.compile(r"@import\s+(?:url\()?['\"]?([^'\"\)]+)['\"]?\)?", re.I)


def fetch_bytes(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req) as resp:
        return resp.read()


def normalize_url(url: str) -> str:
    url, _ = urldefrag(url)
    return url


def is_internal(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme in ("http", "https"):
        return parsed.netloc in BASE_HOSTS
    return False


def url_to_path(url: str) -> Path:
    parsed = urlparse(url)
    path = parsed.path
    if not path or path == "/":
        path = "/index.html"
    elif path.endswith("/"):
        path = f"{path}index.html"
    else:
        _, ext = os.path.splitext(path)
        if not ext:
            path = f"{path}/index.html"
    return OUTPUT_DIR / path.lstrip("/")


def write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def extract_urls_from_css(css_text: str, base_url: str) -> set[str]:
    urls = set()
    for match in URL_RE.findall(css_text):
        url = match.strip().strip("'\"")
        if not url:
            continue
        if url.startswith("data:"):
            continue
        urls.add(urljoin(base_url, url))
    for match in IMPORT_RE.findall(css_text):
        url = match.strip().strip("'\"")
        if not url:
            continue
        urls.add(urljoin(base_url, url))
    return urls


class AssetParser(HTMLParser):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url
        self.assets = set()
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        attrs = {key.lower(): value for key, value in attrs}

        if "style" in attrs:
            self.assets.update(extract_urls_from_css(attrs["style"], self.base_url))

        if tag == "link":
            rel = attrs.get("rel", "").lower()
            rel_values = set(rel.split())
            allowed_rel = {
                "stylesheet",
                "icon",
                "apple-touch-icon",
                "manifest",
                "preload",
                "modulepreload",
            }
            if "href" in attrs and rel_values & allowed_rel:
                self._add(attrs["href"])
        elif tag == "script":
            if "src" in attrs:
                self._add(attrs["src"])
        elif tag in {"img", "source", "video", "audio", "track"}:
            for key in ("src", "poster", "data-src", "data-srcset"):
                if key in attrs:
                    self._add(attrs[key])
            if "srcset" in attrs:
                for part in attrs["srcset"].split(","):
                    url = part.strip().split(" ")[0]
                    if url:
                        self._add(url)

        if tag == "style":
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == "style":
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.assets.update(extract_urls_from_css(data, self.base_url))

    def _add(self, url: str) -> None:
        if not url:
            return
        if url.startswith("data:"):
            return
        if url.startswith("mailto:") or url.startswith("tel:") or url.startswith("javascript:"):
            return
        abs_url = urljoin(self.base_url, url)
        self.assets.add(abs_url)


def fetch_sitemap_urls() -> list[str]:
    urls = []
    ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for sitemap in SITEMAPS:
        xml_bytes = fetch_bytes(sitemap)
        root = ET.fromstring(xml_bytes)
        for node in root.findall("ns:url", ns):
            loc = node.find("ns:loc", ns)
            if loc is not None and loc.text:
                urls.append(loc.text)
    return urls


def download_pages(page_urls: list[str]) -> tuple[dict[str, Path], set[str]]:
    page_map = {}
    asset_urls = set()
    for url in page_urls:
        html_bytes = fetch_bytes(url)
        html_text = html_bytes.decode("utf-8", "ignore")
        local_path = url_to_path(url)
        write_bytes(local_path, html_text.encode("utf-8"))
        page_map[url] = local_path
        parser = AssetParser(url)
        parser.feed(html_text)
        asset_urls.update(parser.assets)
    return page_map, asset_urls


def download_assets(initial_assets: set[str]) -> None:
    queue = list(initial_assets)
    seen = set()
    while queue:
        url = normalize_url(queue.pop())
        if url in seen:
            continue
        seen.add(url)
        if not is_internal(url):
            continue
        try:
            data = fetch_bytes(url)
        except Exception:
            continue
        local_path = url_to_path(url)
        write_bytes(local_path, data)
        if local_path.suffix.lower() == ".css":
            css_text = data.decode("utf-8", "ignore")
            extra_assets = extract_urls_from_css(css_text, url)
            for asset in extra_assets:
                if asset not in seen:
                    queue.append(asset)


def rewrite_internal_urls() -> None:
    replacements = [
        ("https://www.jaynishshah.com/", "/"),
        ("http://www.jaynishshah.com/", "/"),
        ("https://jaynishshah.com/", "/"),
        ("http://jaynishshah.com/", "/"),
        ("https://www.jaynishshah.com", "/"),
        ("http://www.jaynishshah.com", "/"),
        ("https://jaynishshah.com", "/"),
        ("http://jaynishshah.com", "/"),
    ]

    for path in OUTPUT_DIR.rglob("*"):
        if path.suffix.lower() not in (".html", ".css"):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for old, new in replacements:
            text = text.replace(old, new)
        if path.suffix.lower() == ".html":
            text = text.replace("/index.php/", "/")
        path.write_text(text, encoding="utf-8")


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    urls = fetch_sitemap_urls()
    page_map, assets = download_pages(urls)
    download_assets(assets)
    rewrite_internal_urls()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
