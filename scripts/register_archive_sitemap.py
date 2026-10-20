"""Add the canonical article sitemap to a host's existing root robots.txt."""

import argparse
import os
from pathlib import Path
import shutil
import tempfile

DIRECTIVE = "Sitemap: https://madlab.cpe.ku.ac.th/punpiti/sitemap.xml"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--robots", required=True, type=Path)
    parser.add_argument("--backup", required=True, type=Path)
    args = parser.parse_args()
    original = args.robots.read_text()
    if DIRECTIVE in [line.strip() for line in original.splitlines()]:
        print("Canonical archive sitemap is already registered")
        return
    if args.backup.exists():
        raise SystemExit("Choose a fresh backup path")
    args.backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(args.robots, args.backup)
    fd, temporary = tempfile.mkstemp(dir=args.robots.parent, prefix=".robots-")
    try:
        with os.fdopen(fd, "w") as out:
            out.write(original.rstrip() + "\n" + DIRECTIVE + "\n")
        shutil.copymode(args.robots, temporary)
        os.replace(temporary, args.robots)
    finally:
        Path(temporary).unlink(missing_ok=True)
    print("Added canonical archive sitemap; original rules preserved")


if __name__ == "__main__":
    main()
