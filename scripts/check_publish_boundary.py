"""Check staged website files before committing or publishing."""

from pathlib import PurePosixPath
import re
import subprocess


PATTERNS = {
    "private key": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "GitHub token": r"gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}",
    "API token": r"sk-(?:ant-)?[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{35}",
    "other service token": r"glpat-[A-Za-z0-9_-]{20,}|hf_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{20,}",
    "personal home path": r"/(?:home/[A-Za-z0-9._-]+|mnt/[A-Za-z]/Users/[A-Za-z0-9._ -]+)/",
}


def main():
    names = subprocess.check_output(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
    ).decode().split("\0")
    errors = []
    checked = 0
    for name in filter(None, names):
        path = PurePosixPath(name)
        if (
            path.parts[0] in {".ai", ".git", "private", "internal", "local-profiles"}
            or path.name == ".env" or path.name.startswith(".env.")
            or name.endswith((".private.md", ".private.json", ".pem", ".key", ".p12", ".pfx", ".kdbx"))
        ):
            errors.append(f"Private path: {name}")
        data = subprocess.check_output(["git", "show", f":{name}"])
        checked += 1
        if b"\0" in data:
            continue
        try:
            content = data.decode("utf-8")
        except UnicodeDecodeError:
            errors.append(f"Unrecognized text encoding: {name}")
            continue
        for label, pattern in PATTERNS.items():
            if re.search(pattern, content):
                errors.append(f"{label}: {name}")
    for error in errors:
        print("FAIL:", error)
    print(f"Publish boundary: {checked} staged files checked; {len(errors)} errors")
    return bool(errors)


if __name__ == "__main__":
    raise SystemExit(main())
