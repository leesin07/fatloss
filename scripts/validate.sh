#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Running type check..."
pnpm ts-check

echo "Validation completed!"
