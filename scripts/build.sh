#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Installing dependencies..."
pnpm install

echo "Building project..."
pnpm run build

echo "Build completed!"
