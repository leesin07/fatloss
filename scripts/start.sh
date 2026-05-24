#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Starting production server..."
pnpm run start
