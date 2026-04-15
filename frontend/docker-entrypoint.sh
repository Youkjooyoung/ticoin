#!/bin/sh
set -e

# Defaults
: "${BACKEND_URL:=http://backend:8090}"

# envsubst로 nginx.conf 생성 (다른 $ 토큰은 보존)
envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "[ticoin-frontend] BACKEND_URL=${BACKEND_URL}"
exec nginx -g "daemon off;"
