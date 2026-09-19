#!/bin/sh
set -eu

if [ "${RUN_COLLECTSTATIC:-true}" = "true" ]; then
  uv run --no-sync python manage.py collectstatic --noinput
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  uv run --no-sync python manage.py migrate --noinput
fi

if [ "${BOOTSTRAP_ADMIN:-false}" = "true" ]; then
  if [ -z "${ADMIN_USERNAME:-}" ] || [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
    echo "BOOTSTRAP_ADMIN=true exige ADMIN_USERNAME, ADMIN_EMAIL e ADMIN_PASSWORD." >&2
    exit 1
  fi

  uv run --no-sync python manage.py reset_admin_password \
    --create \
    --username "$ADMIN_USERNAME" \
    --email "$ADMIN_EMAIL" \
    --password "$ADMIN_PASSWORD" \
    --clear-mfa
fi

exec "$@"
