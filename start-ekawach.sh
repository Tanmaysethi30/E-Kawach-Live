#!/usr/bin/env bash
echo "========================================================"
echo "  E-KAWACH Local Server & Domain Launcher (ekawach.co.in)"
echo "========================================================"
echo ""
echo "1. Checking environment..."
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "2. Starting E-KAWACH server on port 3000..."
npm run dev &
SERVER_PID=$!

sleep 3

echo ""
echo "========================================================"
echo "  E-KAWACH is now active!"
echo "  - Local Access:  http://localhost:3000"
echo "  - Live Domain:   https://ekawach.co.in (if tunnel configured)"
echo "========================================================"
echo "Press Ctrl+C to stop the server."

trap "kill $SERVER_PID 2>/dev/null" EXIT
wait
