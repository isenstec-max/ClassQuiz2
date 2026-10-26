#!/usr/bin/env bash
# Update + restart ClassQuiz2 (HTTPS on port 3000)
# Domena: https://industry4.fvt.tuke.sk:3000
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"

echo ">> Overujem SSL certifikaty v $HOME/certs..."
if [ ! -d "$HOME/certs" ]; then
    echo "CHYBA: Priecinok $HOME/certs neexistuje!"
    exit 1
fi

# Zabezpecenie kompatibility nazvov certifikatov pre Caddy
# Podpora pre cert.pem/key.pem aj fullchain.pem/privkey.pem
if [ -f "$HOME/certs/fullchain.pem" ] && [ ! -f "$HOME/certs/cert.pem" ]; then
    echo ">> Prelinkuvavam fullchain.pem -> cert.pem..."
    ln -sf "$HOME/certs/fullchain.pem" "$HOME/certs/cert.pem"
fi
if [ -f "$HOME/certs/privkey.pem" ] && [ ! -f "$HOME/certs/key.pem" ]; then
    echo ">> Prelinkuvavam privkey.pem -> key.pem..."
    ln -sf "$HOME/certs/privkey.pem" "$HOME/certs/key.pem"
fi

mkdir -p uploads

echo ">> Aktualizujem konfiguraciu z git repozitara..."
git pull || true

# Ak obraz classquiz-backend:local neexistuje alebo bol vyziadany rebuild
if ! docker image inspect classquiz-backend:local >/dev/null 2>&1 || [[ "${1:-}" == "--build-backend" || "${1:-}" == "--rebuild" ]]; then
    echo ">> Zostavujem lokalny backend obraz (classquiz-backend:local)..."
    docker build -t classquiz-backend:local .
fi

echo ">> Stahujem najnovsi frontend z Docker Hub (smarttechlab/classquiz2:latest)..."
docker compose -f "$COMPOSE_FILE" pull frontend

echo ">> Spustam / restartujem ClassQuiz2..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo ">> Hotovo! ClassQuiz2 bezi na https://industry4.fvt.tuke.sk:3000"
docker compose -f "$COMPOSE_FILE" ps

echo ">> Upratujem nepouzivane stare images..."
docker image prune -f
