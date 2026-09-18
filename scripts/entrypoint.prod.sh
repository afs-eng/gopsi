#!/bin/sh
set -eu

if [ "${RUN_COLLECTSTATIC:-true}" = "true" ]; then
  uv run python manage.py collectstatic --noinput
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  uv run python manage.py migrate --noinput
fi

exec "$@"
