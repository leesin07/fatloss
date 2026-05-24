#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Starting development server..."
pnpm run dev
