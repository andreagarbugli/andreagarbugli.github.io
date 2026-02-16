#include "base.h"

WASM_EXPORT int
c_add(int a, int b) {
    int result = a + b;
    log_number(result);
    return result;
}
