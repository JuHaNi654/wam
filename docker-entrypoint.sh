#!/bin/sh
set -eu

if [ "$1" = "start-server" ]; then
  /app/wam init-db
fi

exec /app/wam "$@"
