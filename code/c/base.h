#ifndef BASE_H
#define BASE_H

#define WASM_EXPORT __attribute__((used, visibility("default")))

// We tell the compiler this function exists elsewhere (in JS)
extern void log_number (int n);

#endif // BASE_H
