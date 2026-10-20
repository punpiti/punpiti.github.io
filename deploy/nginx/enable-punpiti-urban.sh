#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "Run with sudo: sudo bash $0" >&2
    exit 1
fi
task_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
config=/etc/nginx/sites-available/default
snippet=/etc/nginx/snippets/punpiti.locations.conf
test -f /var/www/madlab/site/punpiti/articles.html
test -f "$task_dir/punpiti.locations.conf"

# Validate the existing configuration before making changes.
nginx -t
backup_dir=$(mktemp -d /var/backups/punpiti-nginx.XXXXXXXX)
cp -p "$config" "$backup_dir/default"
if [[ -e $snippet ]]; then
    cp -p "$snippet" "$backup_dir/snippet"
fi
rollback() {
    cp -p "$backup_dir/default" "$config"
    if [[ -e $backup_dir/snippet ]]; then
        cp -p "$backup_dir/snippet" "$snippet"
    else
        rm -f "$snippet"
    fi
    echo "Restored configuration from $backup_dir" >&2
}
trap rollback ERR
install -m 644 "$task_dir/punpiti.locations.conf" "$snippet"
python3 - "$config" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
text = p.read_text()
line = '    include /etc/nginx/snippets/punpiti.locations.conf;'
anchor = '    include /etc/nginx/snippets/madlab-urban-location.conf;'
if line not in text:
    if text.count(anchor) != 1:
        raise SystemExit('Expected one Urban include anchor; no server config changed')
    text = text.replace(anchor, anchor + '\n' + line, 1)
    p.write_text(text)
PY
nginx -t
systemctl reload nginx
trap - ERR
echo "Enabled /punpiti/ on Urban using Madlab files. Backup: $backup_dir"
