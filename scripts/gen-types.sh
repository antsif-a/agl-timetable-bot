#!/bin/bash

set -e -x

git submodule update --init --recursive

SCRIPT=$(realpath "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
PROJECT_ROOT=$(realpath "$SCRIPTPATH"/..)

OUT_DIR=$(realpath "$PROJECT_ROOT"/lib/vk)

VK_API_REPOSITORY=$(realpath "$PROJECT_ROOT"/lib/vk-api-schema)
VK_API_SCHEMA_DIR="$VK_API_REPOSITORY"/_build

cd "$VK_API_REPOSITORY"
./combine.sh

"$PROJECT_ROOT"/node_modules/.bin/vk-api-schema-typescript-generator \
    --schemaDir "$VK_API_SCHEMA_DIR" \
    --outDir "$OUT_DIR" \
    --methods '*'
