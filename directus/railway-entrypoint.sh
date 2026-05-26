#!/bin/sh
set -e

mkdir -p /data/uploads

if [ ! -s /data/data.db ]; then
  echo "Seeding data.db from image..."
  cp /seed/data.db /data/data.db
fi

if [ -z "$(ls -A /data/uploads 2>/dev/null)" ]; then
  echo "Seeding uploads from image..."
  cp -r /seed/uploads/. /data/uploads/
fi

chown -R node:node /data

exec su-exec node "$@"
