#!/bin/sh
set -eu

uv run python manage.py collectstatic --noinput

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  uv run python manage.py migrate --noinput
fi

exec "$@"
