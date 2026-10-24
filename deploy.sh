#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"
if [[ "${1:-}" == "--help" ]]; then
    printf 'Usage: [SERVER_NAME=todo.example.com] [BACKEND_URL=http://127.0.0.1:8000] ./deploy.sh\nRequires Node.js 22.12+, npm, sudo, and Debian/Ubuntu with systemd.\n'
    exit 0
fi
[[ $# -eq 0 ]] || { printf 'Unknown argument. Use --help.\n' >&2; exit 1; }
SERVER_NAME="${SERVER_NAME:-_}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
[[ "$SERVER_NAME" =~ ^[a-zA-Z0-9_.-]+$ ]] || { printf 'Invalid SERVER_NAME.\n' >&2; exit 1; }
[[ "$BACKEND_URL" =~ ^http://[a-zA-Z0-9.-]+:[0-9]+$ ]] || { printf 'BACKEND_URL must be http://host:port without a trailing slash.\n' >&2; exit 1; }
for command in node npm sudo systemctl apt-get curl; do
    command -v "$command" >/dev/null || { printf 'Required command: %s\n' "$command" >&2; exit 1; }
done
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 12)) { console.error("Node.js 22.12+ is required"); process.exit(1); }'
sudo -v

# Build as the repository owner, outside the live document root.
npm --prefix "$ROOT_DIR" ci --include=dev
npm --prefix "$ROOT_DIR" run build
sudo apt-get update
sudo apt-get install -y nginx
RELEASE="$(date -u +%Y%m%dT%H%M%S)-$$"
WEB_ROOT=/var/www/m-todo-frontend
sudo install -d -m 0755 "$WEB_ROOT/releases/$RELEASE"
sudo cp -R "$ROOT_DIR/dist/." "$WEB_ROOT/releases/$RELEASE/"
sudo chown -R root:root "$WEB_ROOT/releases/$RELEASE"
sudo chmod -R a+rX "$WEB_ROOT/releases/$RELEASE"
sudo ln -s "$WEB_ROOT/releases/$RELEASE" "$WEB_ROOT/.current-$RELEASE"
sudo mv -Tf "$WEB_ROOT/.current-$RELEASE" "$WEB_ROOT/current"

sudo tee /etc/nginx/sites-available/m-todo-frontend >/dev/null <<NGINX
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
sudo ln -sfn /etc/nginx/sites-available/m-todo-frontend /etc/nginx/sites-enabled/m-todo-frontend
# Disable only the stock Debian/Ubuntu site, leaving custom sites in place.
if [[ "$(readlink -f /etc/nginx/sites-enabled/default)" == /etc/nginx/sites-available/default ]]; then
    sudo rm /etc/nginx/sites-enabled/default
fi
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
curl --fail --silent --show-error -H "Host: $SERVER_NAME" http://127.0.0.1/ >/dev/null
curl --fail --silent --show-error -H "Host: $SERVER_NAME" http://127.0.0.1/api/categories >/dev/null
printf 'Frontend deployed: http://%s (use the server IP if SERVER_NAME=_).\nAPI proxy: %s\n' "$SERVER_NAME" "$BACKEND_URL"
