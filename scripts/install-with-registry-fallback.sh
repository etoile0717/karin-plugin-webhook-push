#!/usr/bin/env bash
set -euo pipefail

echo "Running npm install with default registry..."
if npm install; then
  exit 0
fi

echo "npm install failed. Switching registry to https://registry.npmmirror.com"
npm config set registry https://registry.npmmirror.com
npm install
