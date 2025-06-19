#!/bin/sh
APP_DIR="/app"
cd "$APP_DIR" || exit 1
npm install
npm run build
while true; do
  echo "📤 start $(date)"
  node dist/index.js >> /app/log.txt 2>&1
  echo "⏳ wait 60s..."
  sleep 60
done
