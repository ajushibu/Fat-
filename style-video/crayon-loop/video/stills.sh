#!/bin/bash
# usage: ./stills.sh <outdir> frame...   (renders Remotion stills with the preinstalled headless Chromium)
cd "$(dirname "$0")"
OUT=$1; shift; mkdir -p "$OUT"
BROWSER=${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
for f in "$@"; do
  npx remotion still src/index.ts TeaBreak "$OUT/s$(printf %03d $f).png" --frame=$f --browser-executable="$BROWSER" --log=error
done
