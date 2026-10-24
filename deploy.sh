#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"
if [[ "${1:-}" == "--help" ]]; then
    printf 'Usage: [SERVER_NAME=todo.example.com] [BACKEND_URL=http://127.0.0.1:8000] ./deploy.sh\nRequires Arch Linux with systemd, Node.js 22.12+, npm, sudo, and curl.\n'
    exit 0
fi
[[ $# -eq 0 ]] || { printf 'Unknown argument. Use --help.\n' >&2; exit 1; }
SERVER_NAME="${SERVER_NAME:-_}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
[[ "$SERVER_NAME" =~ ^[a-zA-Z0-9_.-]+$ ]] || { printf 'Invalid SERVER_NAME.\n' >&2; exit 1; }
[[ "$BACKEND_URL" =~ ^http://[a-zA-Z0-9.-]+:[0-9]+$ ]] || { printf 'BACKEND_URL must be http://host:port without a trailing slash.\n' >&2; exit 1; }
for command in node npm sudo systemctl pacman curl; do
    command -v "$command" >/dev/null || { printf 'Required command: %s\n' "$command" >&2; exit 1; }
done
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 12)) { console.error("Node.js 22.12+ is required"); process.exit(1); }'
sudo -v

# Build as the repository owner, outside the live document root.
npm --prefix "$ROOT_DIR" ci --include=dev
npm --prefix "$ROOT_DIR" run build
sudo pacman -S --needed --noconfirm nginx python
RELEASE="$(date -u +%Y%m%dT%H%M%S)-$$"
WEB_ROOT=/var/www/m-todo-frontend
sudo install -d -m 0755 "$WEB_ROOT/releases/$RELEASE"
sudo cp -R "$ROOT_DIR/dist/." "$WEB_ROOT/releases/$RELEASE/"
sudo chown -R root:root "$WEB_ROOT/releases/$RELEASE"
sudo chmod -R a+rX "$WEB_ROOT/releases/$RELEASE"
sudo ln -s "$WEB_ROOT/releases/$RELEASE" "$WEB_ROOT/.current-$RELEASE"
sudo mv -Tf "$WEB_ROOT/.current-$RELEASE" "$WEB_ROOT/current"

sudo tee /etc/nginx/m-todo-frontend.conf >/dev/null <<NGINX
server {
    listen 80;
    server_name $SERVER_NAME;
    root $WEB_ROOT/current;
    index index.html;

    location /api/ {
        proxy_pass $BACKEND_URL/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /assets/ {
        try_files \$uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
NGINX
# Arch's stock nginx.conf has no sites-enabled or conf.d include. Add an
# explicit include first inside http so the app also handles requests by IP.
# Keep the rest of the configuration and back up the original before editing.
sudo python3 - <<'PYTHON'
from pathlib import Path
import re
import shutil

path = Path('/etc/nginx/nginx.conf')
text = path.read_text()
include = 'include /etc/nginx/m-todo-frontend.conf;'
if not re.search(r'^\s*include\s+/etc/nginx/m-todo-frontend\.conf\s*;', text, re.M):
    updated, count = re.subn(r'^(\s*http\s*\{)', r'\1\n    ' + include, text, count=1, flags=re.M)
    if count != 1:
        raise SystemExit('Cannot locate http block in /etc/nginx/nginx.conf; add the include manually.')
    backup = path.with_name('nginx.conf.before-m-todo')
    if not backup.exists():
        shutil.copy2(path, backup)
    path.write_text(updated)
PYTHON
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
curl --fail --silent --show-error -H "Host: $SERVER_NAME" http://127.0.0.1/ >/dev/null
curl --fail --silent --show-error -H "Host: $SERVER_NAME" http://127.0.0.1/api/categories >/dev/null
printf 'Frontend deployed: http://%s (use the server IP if SERVER_NAME=_).\nAPI proxy: %s\n' "$SERVER_NAME" "$BACKEND_URL"
