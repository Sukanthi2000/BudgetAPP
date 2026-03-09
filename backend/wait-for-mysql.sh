#!/bin/sh
set -e

host="$DB_HOST"
port=3306

until nc -z "$host" $port; do
  echo "Waiting for MySQL at $host:$port..."
  sleep 2
done

exec "$@"
