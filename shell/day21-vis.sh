#!/bin/bash

set -ex

OUTPUT_DIR="visualizations/day21"
TARGET="$1"

npm run build

rm -rf "${OUTPUT_DIR}"
node dist/day21-visualization.js -i "${TARGET}" -o "${OUTPUT_DIR}/frames"

pushd "${OUTPUT_DIR}/frames"
  find . -name '*.svg' | xargs -P 8 -IFILE mogrify -format png FILE
  ffmpeg -framerate 15 -i "%05d.png" ../day21.gif -y
popd
