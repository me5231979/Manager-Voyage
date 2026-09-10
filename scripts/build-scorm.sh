#!/usr/bin/env bash
# Build manager-voyage-scorm.zip, a SCORM 1.2 package Oracle Learning can ingest.
# The SCO is dashboard/index.html. Run from the repo root: bash scripts/build-scorm.sh
set -euo pipefail
OUT=manager-voyage-scorm.zip
rm -f "$OUT"
SHA=$(git rev-parse --short HEAD 2>/dev/null || echo dev)
sed -i.bak "s/?v=[0-9a-z]*/?v=${SHA}/g" dashboard/index.html
zip -qr "$OUT" imsmanifest.xml dashboard/index.html assets/css assets/js assets/fonts assets/img
mv dashboard/index.html.bak dashboard/index.html
echo "Built $OUT ($(du -h "$OUT" | cut -f1), build ${SHA}). Upload to Oracle Learning as SCORM 1.2 content."
