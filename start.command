#!/bin/bash
# Vinden demo — Mac and Linux.
# First run installs packages; every run starts the demo API (port 4100) and the
# web app (port 5180) with sample data, then opens the app in the browser.

cd "$(dirname "$0")" || exit 1

pause() { read -r -p "Press Enter to close." _; }

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install the LTS version from https://nodejs.org, then run this again."
  pause; exit 1
fi
if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=12)||(a===20&&b>=19)?0:1)'; then
  echo "This demo needs Node.js 20.19 or newer (you have $(node -v)). Install the LTS version from https://nodejs.org."
  pause; exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run: installing packages (about a minute, needs internet)..."
  npm ci --no-audit --no-fund || { echo "Install failed."; pause; exit 1; }
fi

echo
echo "Starting Vinden at http://localhost:5180 — signed in as Ishaan Sethi."
echo "Keep this window open while you use it. Press Ctrl-C here to stop."
echo
( sleep 6; open http://localhost:5180 2>/dev/null || xdg-open http://localhost:5180 >/dev/null 2>&1 ) &
npm run dev
