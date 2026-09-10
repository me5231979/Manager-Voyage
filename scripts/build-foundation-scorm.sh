#!/usr/bin/env bash
# Build manager-voyage-foundation-scorm.zip, a standalone SCORM 1.2 package of
# the Foundation course for Oracle Learning. Run from the repo root.
set -euo pipefail
OUT=manager-voyage-foundation-scorm.zip
STAGE=$(mktemp -d)
SHA=$(git rev-parse --short HEAD 2>/dev/null || echo dev)
mkdir -p "$STAGE/foundation" "$STAGE/assets/css" "$STAGE/assets/js" "$STAGE/assets/fonts" "$STAGE/assets/img" "$STAGE/assets/video"
cp foundation/index.html foundation/pager.js foundation/app.js foundation/narration-scripts.js "$STAGE/foundation/"
sed -i "s/?v=[0-9a-z]*/?v=${SHA}/g" "$STAGE/foundation/index.html"
# dashboard links do not exist inside the package; point them at the live site
sed -i 's#href="../dashboard/"#href="https://me5231979.github.io/Manager-Voyage/dashboard/" target="_blank" rel="noopener"#g; s#href="../"#href="https://me5231979.github.io/Manager-Voyage/" target="_blank" rel="noopener"#g' "$STAGE/foundation/index.html"
cp assets/css/course.css "$STAGE/assets/css/"
cp assets/js/config.js assets/js/program-data.js assets/js/scorm.js assets/js/oracle.js "$STAGE/assets/js/"
cp assets/fonts/*.woff2 "$STAGE/assets/fonts/"
cp assets/img/favicon.svg assets/img/favicon-96.png assets/img/vu-lockup-white.png assets/img/vu-centered-white.png assets/img/hero-poster.jpg "$STAGE/assets/img/"
cp assets/video/hero-montage.mp4 "$STAGE/assets/video/"
# narration and the custom videos, when they have been built (see .github/workflows/fetch-media.yml)
[ -d assets/audio/foundation ] && mkdir -p "$STAGE/assets/audio/foundation" && cp assets/audio/foundation/*.mp3 "$STAGE/assets/audio/foundation/" 2>/dev/null || true
[ -d assets/video/foundation ] && mkdir -p "$STAGE/assets/video/foundation" && cp assets/video/foundation/*.mp4 "$STAGE/assets/video/foundation/" 2>/dev/null || true
[ -d assets/img/foundation ] && mkdir -p "$STAGE/assets/img/foundation" && cp assets/img/foundation/*.jpg "$STAGE/assets/img/foundation/" 2>/dev/null || true
FILES=$(cd "$STAGE" && find . -type f | sed 's#^\./##' | sort | sed 's#.*#      <file href="&"/>#')
cat > "$STAGE/imsmanifest.xml" <<XML
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="edu.vanderbilt.flh.managervoyage.foundation" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="mvf_org">
    <organization identifier="mvf_org">
      <title>Manager Voyage: Foundation, What Vanderbilt Expects of a Manager</title>
      <item identifier="mvf_item" identifierref="mvf_res"><title>Foundation: What Vanderbilt Expects of a Manager</title></item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="mvf_res" type="webcontent" adlcp:scormtype="sco" href="foundation/index.html">
$FILES
    </resource>
  </resources>
</manifest>
XML
rm -f "$OUT"
(cd "$STAGE" && zip -qr "$OLDPWD/$OUT" .)
rm -rf "$STAGE"
echo "Built $OUT ($(du -h "$OUT" | cut -f1), build ${SHA}). Upload to Oracle Learning as SCORM 1.2 content."
