#!/bin/sh
set -e

mkdir -p /data/uploads
chown -R node:node /data

exec su-exec node "$@"