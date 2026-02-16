#!/usr/bin/env bash
set -e

mkdir -p web/assets/wasm

clang ./code/c/full.c -o ./web/assets/wasm/c.wasm \
    --target=wasm32       \
    -nostdlib             \
    -Wl,--export-all      \
    -Wl,--no-entry        \
    -Wl,--allow-undefined \
    -I ./code/c
