#!/bin/bash

set -ex

OUTPUT_DIR="visualizations/day16"
INPUT_FILE="inputs/day-16.txt"

npm run build

rm -rf "${OUTPUT_DIR}"
node dist/day16-vis.js -i "${INPUT_FILE}" -o "${OUTPUT_DIR}/frames"

pushd "${OUTPUT_DIR}/frames"
  find . -name '*.svgz' | xargs -P 8 -IFILE mogrify -format png FILE
  ffmpeg -framerate 60 -i "%05d.png" ../day16.mp4
popd
