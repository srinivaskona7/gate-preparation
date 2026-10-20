# GATE CSE 2026 Coding Questions & Solutions Reference

Solutions for the C programming questions from GATE 2026 CS (Paper 1 & Paper 2).

---

## Paper 1 (Session 1)

### Q1: Loop and Integer Division
**Problem Statement:**
```c
#include <stdio.h>
int main() {
    int a = 6;
    int b = 0;
    while (a < 10) {
        a = a / 12 + 1;
        a += b;
    }
    printf("%d", a);
    return 0;
}
```
**Options:**
- (A) The program gets stuck in an infinite loop.
- (B) The program prints 9 as output.
- (C) The program prints 10 as output.
- (D) The program prints 6 as output.

**Answer:** **(A) The program gets stuck in an infinite loop.**

**Explanation:**
- Initial state: `a = 6`, `b = 0`.
- Iteration 1: `a / 12` evaluates to `0` (integer division in C). `a = 0 + 1 = 1`. `a += b` leaves `a = 1`.
- Iteration 2: `a < 10` holds (`1 < 10`). `1 / 12 = 0`, so `a = 0 + 1 = 1`.
- `a` remains `1` indefinitely. The condition `a < 10` is never broken.

---

### Q2: Recursive I/O Call Stack Unwinding
**Problem Statement:**
```c
#include <stdio.h>
void fX();

int main() {
    fX();
    return 0;
}

void fX() {
    char a;
    if ((a = getchar()) != '\n')
        fX();
    if (a != '\n')
        putchar(a);
}
```
*Assumption: Input is `1234\n`.*

**Options:**
- (A) The program will not terminate.
- (B) The program will terminate with no output.
- (C) The program will terminate with `4321` as output.
- (D) The program will terminate with `1234` as output.

**Answer:** **(C) The program will terminate with 4321 as output.**

**Explanation:**
- Characters are pushed to the recursion stack: `'1'`, `'2'`, `'3'`, `'4'`.
- Upon reading `'\n'`, recursion terminates and unwinds.
- Because `putchar(a)` sits after the recursive call, the characters print in LIFO order: `4`, `3`, `2`, `1`.

---

## Paper 2 (Session 2)

### Q1: Pointer Arithmetic vs Value Difference
**Problem Statement:**
```c
#include <stdio.h> 
int main() { 
    double a[2] = {20.0, 25.0}, *p, *q; 
    p = a; 
    q = p + 1; 
    printf("%d,%d", (int)(q - p), (int)(*q - *p)); 
    return 0; 
}
```
**Options:**
- (A) 4,8
- (B) 8,5
- (C) 1,5
- (D) 1,8

**Answer:** **(C) 1,5**

**Explanation:**
- `p` points to `a[0]`; `q = p + 1` points to `a[1]`.
- Pointer subtraction `(q - p)` returns element distance: `1`.
- Value subtraction `(*q - *p)` is `25.0 - 20.0 = 5.0`, cast to `(int)` gives `5`.
- Output: `1,5`.

---

### Q2: Nested Doubling Loop Operations
**Problem Statement:**
```c
int count = 0;
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= i; j *= 2) {
        count++;
    }
}
```
**Complexity Analysis:**
- Inner loop runs $\lfloor \log_2(i) \rfloor + 1$ times.
- Summing over $i=1 \dots n$: $\sum_{i=1}^{n} (\lfloor \log_2(i) \rfloor + 1) = \mathbf{\Theta(n \log n)}$.
