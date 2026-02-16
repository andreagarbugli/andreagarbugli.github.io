---
title: "The 'No-Magic' Approach to C in WASM"
date: 2026-02-16
summary: "Building WASM binaries without Emscripten to understand the raw binary interface."
topics: ["system programming", "wasm/web", "c programming"]
updated: 2026-02-16
series: "no-magic-wasm"
seriesTitle: "No-Magic WASM in C"
seriesPart: 1
---

Most tutorials on WebAssembly (WASM) start with [Emscripten](https://emscripten.org/). While it's a powerful toolchain that emulates a POSIX environment, it often hides the underlying mechanics behind layers of "magic" glue code.

This series takes the opposite approach. We will skip the heavy toolchains and use `clang` directly to compile C to WASM, interfacing with JavaScript using nothing but the raw WebAssembly Web API.

## Why No-Magic?

By stripping away the abstraction, we gain three main advantages:

- **Transparency**: You understand exactly how memory is shared between C and JavaScript.
- **Size**: Without the C standard library emulation, binaries stay incredibly small (often just a few hundred bytes).
- **Portability**: This setup works anywhere WASM does, without dependency on specific loader scripts.

## Project Setup

Our goal is to create a single <code>.wasm</code> file that exports a mathematical function and calls back into a JavaScript logger. The C source is organized to keep examples isolated but easy to compile.

- `code/c/base.h`: Defines our export macros and JS imports.
- `code/c/01_add.c`: Our first logic implementation.
- `code/c/full.c`: An aggregator that includes all parts into one translation unit.

> **The Header** — In `code/c/base.h`, we define `WASM_EXPORT` using Clang attributes to ensure symbols aren't stripped and are visible to the linker.

```c
// code/c/base.h
#define WASM_EXPORT __attribute__((used, visibility("default")))

// We tell the compiler this function exists elsewhere (in JS)
extern void log_number(int n);
```

The implementation in `code/c/01_add.c` is straightforward C, but decorated with our macro so it survives the compilation process.

```c
// code/c/01_add.c
#include "base.h"

WASM_EXPORT int c_add(int a, int b) {
    int result = a + b;
    log_number(result);
    return result;
}
```

## The Build Command

This is where the magic (or lack thereof) happens. We call `clang` directly, passing specific flags to target the WebAssembly VM.

```bash
./code/build.sh
```

Or if you want the raw command:

```bash
clang ./code/c/full.c -o ./web/assets/wasm/c.wasm \
    --target=wasm32       \
    -nostdlib             \
    -Wl,--export-all      \
    -Wl,--no-entry        \
    -Wl,--allow-undefined \
    -I ./code/c
```

Let's break down the critical linker flags (`-Wl,...`):

- `--target=wasm32`: Instruction set for the 32-bit WASM VM.
- `-nostdlib`: Do not use the system C library. This means no `printf` or `malloc` unless we provide them.
- `--export-all`: Tells the linker to make all non-static functions available to the JavaScript host.
- `--no-entry`: WebAssembly modules don't need a `main()` function.
- `--allow-undefined`: This is vital. It allows the C code to reference `log_number` without failing, expecting the host (JS) to provide it at instantiation.

## Example: Call into WASM

Finally, we load the module using the standard browser API. We must provide the `env` object containing any functions we declared as `extern` in C.

```javascript
const { instance } = await WebAssembly.instantiateStreaming(
    fetch("/assets/wasm/c.wasm"),
    {
        env: {
            log_number: (n) => console.log("C says:", n),
        },
    }
);

const result = instance.exports.c_add(20, 22);
console.log("Result:", result);
```

That is the entire pipeline. No glue code, no 100KB runtime—just your code and the browser.

<hr />

_In the next part, we'll look at the more complex topic of **strings and memory management**._
