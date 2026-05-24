#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Installing dependencies..."
pnpm install

echo "Prepare completed!"
