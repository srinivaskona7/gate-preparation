# C programming and recursion: derivations

## Ranges of n-bit integers, conversion to unsigned, and integer division
<!-- topics: pds-c-programming.types-conversions -->

**Claim.** Let an integer type have $n$ value bits in total, including the sign bit for a signed type.

1. An unsigned type holds exactly $0, 1, \dots, 2^n - 1$. A signed type in two's complement holds exactly $-2^{n-1}, \dots, 2^{n-1} - 1$, so `signed char` runs from $-128$ to $127$ and a 32-bit `int` from $-2147483648$ to $2147483647$.
2. Converting any integer value $v$ to an $n$-bit unsigned type yields the unique $u \in [0, 2^n - 1]$ with $u \equiv v \pmod{2^n}$, and unsigned arithmetic wraps the same way. With a 32-bit `int`, `(unsigned)-1` is $2^{32} - 1 = 4294967295$.
3. In `i < u` with `int i` and `unsigned u` of the same width, the usual arithmetic conversions turn `i` into `unsigned`, so `-1 < 1u` is false. Types narrower than `int` (`char`, `short`) are first promoted to `int`, so this surprise needs an operand of rank at least `int`.
4. For integers $a$ and $b \ne 0$, C99 and later define $a / b$ as the real quotient truncated toward zero and $a \,\%\, b = a - (a/b)\,b$. Hence $(a/b)\,b + a \,\%\, b = a$ always, $\lvert a \,\%\, b \rvert < \lvert b \rvert$, and a nonzero $a \,\%\, b$ has the sign of $a$.

**Derivation.** (1) An unsigned value with bits $b_{n-1} \dots b_0$ is $\sum_k b_k 2^k$. The $2^n$ bit patterns give distinct sums, the smallest 0 and the largest $\sum_{k<n} 2^k = 2^n - 1$, so every integer in between occurs exactly once. Two's complement gives the top bit the weight $-2^{n-1}$ instead of $+2^{n-1}$: the value is $-b_{n-1}2^{n-1} + \sum_{k<n-1} b_k 2^k$. With $b_{n-1} = 0$ the low $n - 1$ bits give $0, \dots, 2^{n-1} - 1$; with $b_{n-1} = 1$ they give $-2^{n-1}, \dots, -1$. The two halves together are the claimed range, with one more negative value than positive.

(2) The standard defines the conversion to unsigned as repeatedly adding or subtracting $2^n$ until the value lies in range, which is reduction modulo $2^n$; the result is unique because the range has exactly $2^n$ consecutive integers. For $v = -1$ one addition gives $2^n - 1$. In two's complement this leaves the bit pattern unchanged: the pattern of $-1$ is all ones, which read as unsigned is $2^n - 1$.

(3) The usual arithmetic conversions promote small types to `int`, then, if one operand is unsigned of rank at least the other's, convert the signed operand to that unsigned type. Applying (2), $-1$ becomes $2^{32} - 1$, and $2^{32} - 1 < 1$ is false. With `unsigned char c = 1`, the test `-1 < c` promotes `c` to `int` (every `unsigned char` value fits), compares $-1 < 1$ as signed integers, and is true.

(4) Truncation toward zero gives $\lvert a/b \rvert = \lfloor \lvert a \rvert / \lvert b \rvert \rfloor$ with the sign of $a b$. Then $a - (a/b)\,b$ has absolute value $\lvert a \rvert - \lfloor \lvert a \rvert/\lvert b \rvert \rfloor \lvert b \rvert$, which is the remainder of $\lvert a \rvert$ by $\lvert b \rvert$ and lies in $[0, \lvert b \rvert - 1]$, and its sign is that of $a$ because $(a/b)\,b$ has the sign of $a$ and smaller magnitude. Signed overflow, unlike unsigned wrap, is undefined behaviour, so (2) does not extend to `INT_MAX + 1`.

**GATE use.** MCQs on `if (-1 < sizeof(int))` or a comparison of `int` with `unsigned`: the comparison is done in unsigned arithmetic and the negative side becomes huge. NATs on `unsigned char` loops that wrap from 255 to 0, and on `%` with negative operands. The traps are assuming floor division ($-7/2 = -3$, not $-4$) and forgetting that `char` and `short` are promoted to `int` before any comparison.

**Check.** A compiled C program printed `signed char` $-128..127$, `unsigned char` $0..255$, `short` $-32768..32767$, `int` $-2147483648..2147483647$, `(unsigned)-1` $= 4294967295$, `-1 < 1u` $= 0$, `(unsigned char)256` $= 0$ and `(unsigned char)-56` $= 200$. It printed $7/2 = 3$, $-7/2 = -3$, $-7 \,\%\, 2 = -1$ and $7 \,\%\, {-2} = 1$, and over all $a \in [-300, 300]$ and nonzero $b \in [-300, 300]$ it found no case where $(a/b)\,b + a \,\%\, b \ne a$ or a nonzero remainder had a sign different from $a$'s.

## Precedence, short-circuit evaluation and sequence points
<!-- topics: pds-c-programming.operators-precedence, pds-c-programming.side-effects-ub -->

**Claim.** Assume the C11 sequencing rules (C99 sequence points give the same answers below).

1. Precedence and associativity only decide how an expression is parsed, not the order in which subexpressions are evaluated. `x & 1 == 0` parses as `x & (1 == 0)`, which is `x & 0 = 0` for every `x`, and `*p++` parses as `*(p++)`.
2. `&&`, `||`, `?:` and the comma operator sequence their left operand before the rest. `A && B` evaluates `B` only when `A` is nonzero, `A || B` only when `A` is zero, and `(A, B)` yields `B`.
3. An expression has undefined behaviour if it contains a side effect on a scalar object that is unsequenced relative to another side effect on the same object, or to a read of that object's value for any purpose other than computing the stored value. So `i = i++ + 1`, `a[i] = i++` and `x++ * ++x` are undefined, while `i = (i++, i + 1)` and `x = i++ && i++` are defined.
4. `x++` yields the old value of `x` and `++x` the new one; the increment itself is a side effect completed by the next sequence point.

**Derivation.** (1) The grammar gives `==` a higher precedence than `&`, so in `x & 1 == 0` the subexpression `1 == 0` forms first and has value 0; the outer `&` then yields 0. Postfix `++` binds tighter than unary `*`, so `*p++` applies `*` to the value of `p++`, which is the old `p`. Neither fact says which operand of a binary operator is evaluated first: for `+`, `*`, `==` and function arguments the order is unspecified.

(2) The standard places a sequence point after the first operand of each of these four operators, and defines `&&` to skip its second operand when the first compares equal to 0 (dually for `||`). So in `(x > 0 && ++y)` with $x \le 0$, the increment never runs.

(3) Take the expressions one at a time, with $i = 1$ at the start.
- `i = i++ + 1`. The assignment's side effect on `i` is sequenced after the value computations of its operands, but the side effect of `i++` is not sequenced relative to the assignment's side effect. Two unsequenced side effects on `i`: undefined.
- `a[i] = i++`. The left operand reads `i` to choose the element, and the right operand modifies `i`; the two operands of `=` are unsequenced relative to each other, and the read is not for computing the value stored into `i`. Undefined.
- `x++ * ++x`. Both operands of `*` modify `x` with no sequencing between them. Undefined, so no printed value is "the" answer.
- `i = (i++, i + 1)`. The comma sequences `i++` (now $i = 2$) before `i + 1` (value 3), and the assignment's side effect follows the value computation of its right operand, so the result is $i = 3$.
- `x = i++ && i++`. The left `i++` yields 1 and sets $i = 2$, the sequence point after it completes that write, the right `i++` yields 2 and sets $i = 3$, so $x = 1$ and $i = 3$.

(4) is the definition of the two operators; for example after `int x = 5; y = x++ + 10;`, $y = 15$ and $x = 6$, since `x` is not otherwise used in the statement.

**GATE use.** Output MCQs with `&&` or `||` that skip an increment, and MSQs that ask which statements are undefined. The traps are treating `printf("%d %d", x++, ++x)` as merely order-dependent (it is undefined, because function arguments are unsequenced relative to each other), and reading `x & 1 == 0` as an even-test.

**Check.** With $x = 4$ a compiled program printed `x & 1 == 0` $= 0$ and `(x & 1) == 0` $= 1$; `x = (a = 2, a + 3)` gave 5; `(x > 0 && ++y)` with $x = -1$ left $y = 0$; `i = (i++, i + 1)` from $i = 1$ gave 3; `x = i++ && i++` gave $x = 1$, $i = 3$; and `y = x++ + 10` from $x = 5$ gave $y = 15$, $x = 6$. Compiling the five expressions of part (3) with `clang -Wunsequenced` produced exactly three warnings, for `i = i++ + 1`, `a[i] = i++` and `x++ * ++x`, and none for the comma and `&&` forms.

## Pointer arithmetic: scaling, differences and subscripts
<!-- topics: pds-c-programming.pointer-arithmetic -->

**Claim.** Let `p` have type `T *` and point into an array of `T`, and let $n$ be an integer such that $p + n$ stays inside the array or one past its end. Then

$$\operatorname{addr}(p + n) = \operatorname{addr}(p) + n \cdot \operatorname{sizeof}(T).$$

For `p` and `q` of type `T *` into the same array,

$$q - p = \frac{\operatorname{addr}(q) - \operatorname{addr}(p)}{\operatorname{sizeof}(T)},$$

an exact integer that counts elements. Subscripting is defined by `a[i]` $\equiv$ `*(a + i)`, so `a[i]`, `*(i + a)` and `i[a]` denote the same object.

**Derivation.** An array of $N$ objects of type $T$ occupies $N \cdot \operatorname{sizeof}(T)$ contiguous bytes, element $k$ starting at byte offset $k \cdot \operatorname{sizeof}(T)$ from the base, because the elements are laid out with no gaps (any padding a type needs is already inside $\operatorname{sizeof}(T)$; see the struct section). The standard defines $p + n$, for $p$ pointing to element $k$, as a pointer to element $k + n$. Its address is therefore $\text{base} + (k + n)\operatorname{sizeof}(T) = \operatorname{addr}(p) + n \operatorname{sizeof}(T)$. Subtraction is the inverse: if $p$ points to element $j$ and $q$ to element $k$, then $q - p$ is defined as $k - j$, and the byte difference is $(k - j)\operatorname{sizeof}(T)$, which divides exactly. Outside one array the result is undefined, because nothing fixes the distance between two unrelated objects.

The subscript rule follows from the definition `E1[E2]` $\equiv$ `(*((E1) + (E2)))` and the commutativity of pointer-plus-integer addition: `i[a]` is `*(i + a)` = `*(a + i)` = `a[i]`. The array name `a` in these expressions decays to a pointer to `a[0]`, which is why the rule applies to arrays as well as pointers. Multiple indirection unfolds one level at a time: with `int x = 10, *p = &x, **pp = &p`, `*pp` is `p` and `**pp` is `*p` = `x` = 10.

**GATE use.** Output MCQs that move a pointer with `p += k` and then mix `p[j]`, `*(p - j)` and `j[a]`; address MCQs that give a base address and ask for `p + n`. The traps are adding $n$ bytes instead of $n$ elements, reporting a pointer difference in bytes, and calling `2[a]` a compile error.

**Check.** In a compiled program, `int a[] = {2, 4, 6, 8, 10}, *p = a; p += 2;` gave `p[1] + *(p - 2) + 2[a]` $= 8 + 2 + 6 = 16$. For `int arr[10]`, `&arr[7] - &arr[2]` printed 5 while the byte difference was 20. For `double d[5]`, `d + 3` was 24 bytes past `d`, matching $3 \cdot 8$; an `int *` at 1000 with 4-byte `int` gives $1000 + 3 \cdot 4 = 1012$ for $p + 3$. `**pp` printed 10.

## Array layout: row-major and column-major addresses, and what a, *a and &a step by
<!-- topics: pds-c-programming.arrays-2d, pds-c-programming.declarations -->

**Claim.** Let `T m[R][C]` start at address $B$, with $w = \operatorname{sizeof}(T)$ and zero-based indices. C stores it in row-major order:

$$\operatorname{addr}(m[i][j]) = B + (i \cdot C + j)\, w.$$

In column-major order (Fortran) the same element sits at $B + (j \cdot R + i)\,w$. A three-dimensional `T m[D1][D2][D3]` gives

$$\operatorname{addr}(m[i][j][k]) = B + \big((i \cdot D_2 + j)\, D_3 + k\big)\, w.$$

With lower bounds $l_1, l_2$ instead of 0, replace $i$ by $i - l_1$ and $j$ by $j - l_2$. In expressions, `m` has type `T (*)[C]` and steps by $C w$ bytes, `*m` has type `T *` and steps by $w$, and `&m` has type `T (*)[R][C]` and steps by $R C w$; all three hold the address $B$.

**Derivation.** C defines `T m[R][C]` as an array of $R$ elements, each of which is an array `T[C]` of size $Cw$. By the pointer section, element `m[i]` (a row) starts at $B + i \cdot Cw$, and within it element $j$ starts $j w$ further on, which gives the row-major formula. The map $(i, j) \mapsto iC + j$ is a bijection from $[0, R) \times [0, C)$ onto $[0, RC)$, since $j = (iC + j) \bmod C$ and $i = \lfloor (iC + j)/C \rfloor$, so the array is a gapless block of $RC$ elements. Column-major order stores column $j$ as a contiguous run of $R$ elements, so the roles of the indices swap and the offset is $jR + i$. For three dimensions, `m[i]` is a `T[D2][D3]` block of $D_2 D_3 w$ bytes and `m[i][j]` a `T[D3]` row of $D_3 w$ bytes, so the offset in elements is $i D_2 D_3 + j D_3 + k = (iD_2 + j)D_3 + k$. With lower bounds the element's position counted from the first element is $(i - l_1, j - l_2)$, and the formula applies to that.

For the three expressions: `m` used as a value decays to a pointer to its first element, which is the row `m[0]`, of type `T (*)[C]`; adding 1 moves by one row, $Cw$ bytes. `*m` is `m[0]`, an array `T[C]`, which decays to a pointer to `m[0][0]`; adding 1 moves by $w$. `&m` does not decay (the operand of `&` never does) and points to the whole `T[R][C]`, so adding 1 moves by $RCw$. The first byte of the whole array, of its first row and of its first element is the same, so all three print $B$. By the same reading of types, `*(*(m + i) + j)` is `m[i][j]`, `sizeof m` is $RCw$ and `sizeof m[0]` is $Cw$. A parameter `T m[][C]` is a `T (*)[C]`, which is why $C$ must be given: the compiler multiplies by it in the row-major formula. A pointer to a whole array, `int (*p)[5] = &a`, likewise has `sizeof *p` $= 20$ with 4-byte `int` and steps by 20.

**GATE use.** The 2-mark MCQ gives `int a[3][4]` at a base address and asks for `a + 2`, `*a + 2`, `&a + 1` or `*(a + 1) + 2`; write the type of each subexpression, then multiply. Address NATs give lower bounds and an element size, sometimes in column-major order. The traps are treating `a + 1` as one element, forgetting the lower bounds, and using row-major order when the question says column-major.

**Check.** For `int m[3][4]` a compiled program measured byte offsets 32 for `m + 2`, 8 for `*m + 2`, 48 for `&m + 1`, 16 for `m + 1`, 4 for `*m + 1` and 24 for `&m[1][2]`, and `sizeof m` $= 48$, `sizeof m[0]` $= 16$. With base 2000 these are 2032, 2008 and 2048, and `m[1][2]` is at $2000 + (1 \cdot 4 + 2) \cdot 4 = 2024$; in column-major order it would be at $2000 + (2 \cdot 3 + 1) \cdot 4 = 2028$. For `int m3[2][3][4]`, `&m3[1][2][3]` was 92 bytes from the base, which is $((1 \cdot 3 + 2) \cdot 4 + 3) \cdot 4$. An array `A[1..5][1..6]` of 2-byte elements at 1000, row-major, has `A[3][4]` at $1000 + ((3-1) \cdot 6 + (4-1)) \cdot 2 = 1030$. For `int (*pa)[5]`, `sizeof *pa` was 20 and `pa + 1` moved 20 bytes. A script confirmed that $iC + j$ and $jR + i$ are each bijections onto $[0, 12)$ for $R = 3$, $C = 4$.

## Struct and union layout: offsets, tail padding, and the best member order
<!-- topics: pds-c-programming.structs-unions -->

**Claim.** Let the members of a struct have sizes $s_1, \dots, s_n$ and alignments $a_1, \dots, a_n$, where each $a_k$ is a power of two that divides $s_k$ (true for the scalar types on common machines, where $a_k = s_k$), and let $a_{\max} = \max_k a_k$. The compiler places member 1 at $o_1 = 0$ and

$$o_k = \left\lceil \frac{o_{k-1} + s_{k-1}}{a_k} \right\rceil a_k, \qquad \operatorname{sizeof} = \left\lceil \frac{o_n + s_n}{a_{\max}} \right\rceil a_{\max},$$

and the struct's alignment is $a_{\max}$. Every member order gives a size of at least $L = \lceil \sum_k s_k / a_{\max} \rceil a_{\max}$, and ordering the members by nonincreasing alignment attains $L$. A union places every member at offset 0 and has size $\lceil \max_k s_k / a_{\max} \rceil a_{\max}$.

**Derivation.** Member $k$ must start at an address that is a multiple of $a_k$, may not overlap member $k - 1$, and the standard keeps declaration order. If the struct itself starts at a multiple of $a_{\max}$, it suffices that the offset $o_k$ be a multiple of $a_k$ (every $a_k$ divides $a_{\max}$, since all are powers of two). The smallest such offset not below the end $o_{k-1} + s_{k-1}$ of the previous member is that end rounded up to a multiple of $a_k$, which is the formula. For the total size: in an array of structs, element $t$ starts $t \cdot \operatorname{sizeof}$ bytes after element 0, so every element is aligned for its widest member exactly when $\operatorname{sizeof}$ is a multiple of $a_{\max}$. The smallest such size not below the end of the last member is the second formula; the added bytes are the tail padding.

Lower bound: the members occupy disjoint bytes, so any layout has $\operatorname{sizeof} \ge \sum_k s_k$, and the size is a multiple of $a_{\max}$, hence at least $L$. Attaining it: sort the members so that $a_1 \ge a_2 \ge \dots \ge a_n$. By induction, the end $e_{k-1} = s_1 + \dots + s_{k-1}$ of member $k - 1$ is a multiple of $a_k$: each $s_j$ with $j < k$ is a multiple of $a_j$, and $a_j$ is a power of two at least $a_k$, so $a_k$ divides each $s_j$ and therefore their sum. So no member needs internal padding, the members end at $\sum_k s_k$, and rounding up gives exactly $L$.

For a union, all members start at 0 and the storage must hold the largest; the size is again rounded up to a multiple of $a_{\max}$ so that arrays of the union keep every member aligned. The union size equals the largest member only when that member's size is already a multiple of $a_{\max}$.

**GATE use.** NATs ask for `sizeof` of a struct with mixed `char`, `short`, `int` and `double`, sometimes nested or followed by a reordered version, and for the size of a union. State the assumed sizes and alignments first. The traps are omitting the tail padding (`struct { int x; char y; }` is 8, not 5), aligning to the previous member's size instead of the next one's, and taking a union's size as the largest member without rounding.

**Check.** On the test machine, `offsetof` and `sizeof` gave: `struct { char c; int i; char c2; }` at offsets 0, 4, 8 and size 12, with an array stride of 12; `struct { char a; double b; char c; int d; short e; }` at offsets 0, 8, 16, 20, 24 and size 32, and the reordering `double, int, short, char, char` size 16; `struct { int x; char y; }` size 8; `union { char c[5]; int i; }` size 8 and `union { char c[9]; double d; }` size 16. The formulas reproduce all of them. A script generated 200 random structs of 1 to 6 members drawn from `char`, `short`, `int`, `double` and `long long`, compiled them, and the formula matched the compiler's `sizeof` on all 200; over every permutation of each struct's members, the smallest size equalled both the nonincreasing-alignment size and the bound $L$.

## Call by value: what a callee can change, array decay, sizeof and strlen
<!-- topics: pds-c-programming.parameter-passing, pds-c-programming.strings, pds-c-programming.dynamic-memory -->

**Claim.** In a call `f(e1, …, ek)`, each parameter of `f` is a new object local to that call, initialised with the value of the corresponding argument.

1. An assignment to a parameter never changes any object of the caller. The callee can change a caller's object only by writing through a pointer whose value is that object's address. So `swap(int a, int b)` and a `swap(int *a, int *b)` that exchanges `a` and `b` themselves change nothing, while one that does `t = *a; *a = *b; *b = t;` exchanges the caller's variables.
2. To change a caller's pointer variable (a list head, or a pointer to be reallocated), the callee needs its address, a `T **`, or must return the new value.
3. A parameter declared `T a[]` or `T a[N]` has type `T *`. An array argument decays to a pointer to its first element, so writes to `a[i]` reach the caller's array, but inside the callee `sizeof(a)` is the pointer size and the element count is lost.
4. For a character array initialised from a string literal of $\ell$ characters, `sizeof` counts the array, which is $\ell + 1$ bytes if no size is given, while `strlen` counts the characters before the first `'\0'`. `sizeof` of a `char *` is the pointer size.

**Derivation.** (1) The caller evaluates each argument to a value and the callee's parameter is initialised with a copy of it, in storage belonging to the callee's frame. An assignment `a = …` writes that storage only, and the frame is discarded on return. For a pointer parameter the copied value is an address; `a = b` overwrites the callee's copy of one address with the other, which leaves the caller's variables untouched, whereas `*a = …` writes the object at that address, which is the caller's variable. This is the only route by which a callee reaches a caller's local object, since the callee has no name for it.

(2) Applying (1) one level up: a caller's pointer `head` is changed only by writing `*pp = …` where `pp` holds `&head`, so the parameter must be `T **`. The same applies to `free(p)`, which receives a copy of `p` and so cannot set the caller's `p` to `NULL`; the caller's `p` keeps the old address and dangles.

(3) The standard adjusts a parameter of array type to a pointer to the element type, and an array expression in an argument position converts to a pointer to its first element. Then `a[i]` in the callee is `*(a + i)`, which addresses the caller's element $i$, while `sizeof(a)` is `sizeof(T *)`. On a machine with 8-byte pointers and 4-byte `int`, `sizeof(arr) / sizeof(arr[0])` inside the callee is $8/4 = 2$, whatever the length of the caller's array.

(4) `char s[] = "Hello"` sizes the array from the initialiser, which includes the terminating null: 6 bytes, `strlen` 5. With an explicit size, `char s[10] = "Hi"` has `sizeof` 10 and the unused bytes are zero, `strlen` 2. `"Hello\0World"` has 11 written characters plus the implicit terminator, so the array is 12 bytes, but `strlen` stops at the embedded null and returns 5. `char *s = "hi"` makes `s` a pointer, so `sizeof s` is 8 on a 64-bit machine, while `sizeof "hi"` (the literal itself is an array) is 3.

**GATE use.** 1-mark MCQs on swap variants and on whether an update inside a function is visible in `main`; MCQs on `sizeof` of an array parameter; NATs combining `sizeof` and `strlen`. Linked-list questions that change the head inside a function without `**`. The traps are the pointer-swapping `swap`, taking `sizeof` of a parameter as the array size, and counting the terminator in `strlen` or leaving it out of `sizeof`.

**Check.** A compiled program started from $x = 1, y = 2$: the value swap left `1 2`, the pointer-exchanging swap left `1 2`, and the write-through swap gave `2 1`. For `int a[5]` the caller's `sizeof` was 20 and the callee's `sizeof(arr)/sizeof(arr[0])` was 2. `sizeof`/`strlen` printed 6/5 for `"Hello"`, 12/5 for `"Hello\0World"`, 10/2 for `char s[10] = "Hi"` and 8/2 for `char *s = "hi"`, with `sizeof "hi"` $= 3$.

## Lowest-set-bit identities and counting 1 bits
<!-- topics: pds-c-programming.bitwise -->

**Claim.** Let $n$ be a nonzero value in $N$-bit two's complement or unsigned arithmetic, and let $t$ be the index of its lowest 1 bit.

1. $n \mathbin{\&} (n - 1)$ is $n$ with bit $t$ cleared, that is $n - 2^t$.
2. $n \mathbin{\&} (-n) = 2^t$.
3. The loop `while (n) { n &= n - 1; c++; }` runs exactly once per 1 bit of $n$, so it leaves $c$ equal to the number of 1 bits.
4. $n > 0$ and $n \mathbin{\&} (n - 1) = 0$ hold together exactly when $n$ is a power of two.
5. Bit $k$ is tested by $x \mathbin{\&} (1 \ll k)$, set by $x \mathbin{|}= 1 \ll k$, cleared by $x \mathbin{\&}= \mathord{\sim}(1 \ll k)$ and toggled by $x \mathbin{\wedge}= 1 \ll k$; for unsigned $x$ without overflow, $x \ll k = x \cdot 2^k$ and $x \gg k = \lfloor x / 2^k \rfloor$.

**Proof.** Write $n$ in binary as $w\,1\,0^t$: some high bits $w$, a 1 at position $t$, and $t$ zeros below it. Subtracting 1 borrows through the $t$ zeros, so $n - 1 = w\,0\,1^t$. The two patterns agree on $w$ and disagree on each of the lowest $t + 1$ bits, so the AND keeps $w$ and zeros the rest: $w\,0\,0^t = n - 2^t$, which is (1). In two's complement $-n = \mathord{\sim}n + 1$, because $n + \mathord{\sim}n$ is all ones, which is $-1$. Now $\mathord{\sim}n = \bar w\,0\,1^t$, and adding 1 carries through the $t$ ones: $-n = \bar w\,1\,0^t$. ANDing with $n = w\,1\,0^t$ gives $0$ on the high part (each bit of $w$ meets its complement), 1 at position $t$ and zeros below, so the result is $2^t$, which is (2). For (3), each iteration clears exactly one 1 bit by (1) and creates none, so after $c$ iterations $n$ has $c$ fewer 1 bits, and the loop stops when none remain. For (4), $n \mathbin{\&} (n - 1) = 0$ means $n - 2^t = 0$, so $n$ has a single 1 bit; the condition $n > 0$ excludes 0 and, for signed types, the pattern $1\,0^{N-1}$, which is negative. Part (5) uses that $1 \ll k$ has only bit $k$ set: AND with it keeps bit $k$ alone, OR forces it to 1, AND with its complement forces it to 0, XOR flips it, and every other bit is untouched. Shifting left by $k$ multiplies each weight $2^i$ by $2^k$; shifting right drops the $k$ low bits, which is division by $2^k$ rounded down. A right shift of a negative signed value is implementation-defined, and a left shift that overflows a signed type is undefined.

**GATE use.** Loop-count NATs on `n &= n - 1` or `n = n & (n - 1)`, and MCQs asking what `n & -n` or `n & (n - 1) == 0` computes. The trap is precedence again: `n & (n - 1) == 0` parses as `n & ((n - 1) == 0)`. The XOR swap `a ^= b; b ^= a; a ^= b;` zeros the value when both names refer to the same object, since the first step computes $a \oplus a = 0$.

**Check.** $181 = 10110101_2$ has five 1 bits, and the loop took $n$ through 180, 176, 160, 128 and 0, so $c = 5$. $12 \mathbin{\&} (-12) = 4$, $40 \mathbin{\&} 39 = 32$, $40 \mathbin{\&} (-40) = 8$ and $5 \ll 2 = 20$. A script checked (1) to (4) for every nonzero 16-bit value, including that $-n \bmod 2^{16}$ equals $\mathord{\sim}n + 1 \bmod 2^{16}$.

## Recursion as a call tree: output order, stack depth and shared statics
<!-- topics: pds-c-programming.recursion-tracing, pds-c-programming.storage-classes -->

**Claim.** The calls made while evaluating a recursive function form a rooted tree, the call tree, whose children of a node are the calls it makes, in the order it makes them.

1. Execution visits the tree depth first: a call runs to completion, including all of its descendants, before its caller continues. Code placed before the recursive calls runs in preorder, code after them in postorder, and code between two calls in inorder.
2. The frames on the stack at any moment are exactly the calls on the path from the root to the call now running, so the maximum stack depth is the number of nodes on the longest root-to-leaf path.
3. For `void p(int n) { if (n > 0) { p(n - 1); printf("%d ", n); p(n - 1); } }`, `p(n)` prints $2^n - 1$ numbers, the $k$-th of which is $1 + \nu_2(k)$, where $\nu_2(k)$ is the number of trailing zero bits of $k$; the printed numbers sum to $2^{n+1} - n - 2$.
4. A `static` local or a global is one object shared by all frames, initialised once before the program runs. A read of it returns the most recent write in execution order, not the value at the time the current frame was created. An `auto` local exists once per frame.

**Proof.** (1) A call's body is a sequence of statements; when it reaches a call, control passes to the callee and returns only when the callee returns. By induction on the height of the subtree, every call returns only after all of its descendants have run, so the order in which calls start is the preorder of the tree and the order in which they finish is the postorder. A statement before the first recursive call runs when the node starts, one after the last when it finishes, and one between the calls after the left subtree and before the right subtree, which are the three orders. So `if (n > 0) { printf(n); p(n - 1); }` prints $n, n-1, \dots, 1$ and moving the `printf` after the call prints $1, \dots, n$.

(2) Each call pushes a frame when it starts and pops it when it returns. By (1), the frames alive while a node $v$ runs are those of the calls that have started and not finished, which are $v$'s ancestors and $v$ itself. Hence the depth is the length of the current root path, and its maximum is the height of the tree plus 1.

(3) Let $S(n)$ be the printed sequence. Then $S(0)$ is empty and $S(n) = S(n-1),\, n,\, S(n-1)$, so its length satisfies $L(n) = 2L(n-1) + 1$ with $L(0) = 0$, giving $L(n) = 2^n - 1$ (the Hanoi section solves this recurrence). For the $k$-th term, induct on $n$: the middle term sits at position $k = 2^{n-1}$ and equals $n = 1 + \nu_2(2^{n-1})$. A position $k < 2^{n-1}$ lies in the first copy and gives term $1 + \nu_2(k)$ by induction. A position $k > 2^{n-1}$ is position $k' = k - 2^{n-1}$ of the second copy, and since $k' < 2^{n-1}$, subtracting $2^{n-1}$ does not change the low bits below position $n - 1$, so $\nu_2(k) = \nu_2(k')$. For the sum, $\Sigma(n) = 2\Sigma(n-1) + n$ with $\Sigma(0) = 0$; if $\Sigma(n-1) = 2^n - n - 1$ then $\Sigma(n) = 2^{n+1} - 2n - 2 + n = 2^{n+1} - n - 2$.

(4) Objects of static storage duration exist for the whole run and have a single instance, while each call allocates its own automatic objects in its frame. By (1), the writes to a shared object happen in preorder-and-postorder execution order across the whole tree, so a frame that reads it after its children ran sees what the children last wrote. This is also why returning the address of an `auto` local leaves a dangling pointer (the frame is popped) while returning the address of a `static` local is safe.

**GATE use.** The common 2-mark NAT gives a recursive function that updates a `static` or global variable and asks for the returned or printed value. Draw the call tree, keep one box for the shared variable, and update it at the moment each call runs. MCQs ask for the printed sequence of a function with prints around one or two recursive calls, and for the maximum stack depth. The trap is giving each frame its own copy of the static, or evaluating returns with the value the static had when the frame began. When a static is read in the same expression as a recursive call, as in `return f(n - 1) + r`, the order of the two operands is unspecified; the answer is well defined only if the call cannot change `r`.

**Check.** For `int f(int n) { static int r = 0; if (n <= 0) return 1; if (n > 3) { r = n; return f(n - 2) + 2; } return f(n - 1) + r; }`, the call `f(7)` sets $r = 7$, then `f(5)` sets $r = 5$; the calls with $n \le 3$ never write $r$, so `f(0)` $= 1$, `f(1)` $= 6$, `f(2)` $= 11$, `f(3)` $= 16$, `f(5)` $= 18$ and `f(7)` $= 20$, which the compiled program printed. The two-call `p(3)` printed `1 2 1 3 1 2 1` (seven numbers, sum $11 = 2^4 - 3 - 2$), `p(4)` printed 15 numbers following the ruler pattern, and an instrumented `p(3)` reached at most 4 frames ($p(3)$ down to $p(0)$). The preorder version printed `4 3 2 1` and the postorder version `1 2 3 4`. A script checked the length, the $1 + \nu_2(k)$ rule and the sum for $n = 1$ to 11.

## Tail recursion with an accumulator
<!-- topics: pds-c-programming.recursion-tracing -->

**Claim.** Define `fact(n, acc)` to return `acc` when $n \le 1$ and `fact(n - 1, n * acc)` otherwise. For every integer $n \ge 0$ and every `acc`, `fact(n, acc)` returns $\mathit{acc} \cdot n!$, so `fact(n, 1)` is $n!$. Its recursive call is a tail call, so the call can reuse the current frame and the function runs in $O(1)$ stack when the compiler performs tail-call elimination; the plain `fact(n) = n * fact(n - 1)` needs $n$ frames, because the multiplication happens after the call returns. The C standard does not require the elimination.

**Proof.** Induction on $n$. For $n \le 1$, $n! = 1$ and the function returns $\mathit{acc} = \mathit{acc} \cdot n!$. For $n \ge 2$, the call returns `fact(n - 1, n * acc)`, which by the induction hypothesis is $(n \cdot \mathit{acc}) \cdot (n-1)! = \mathit{acc} \cdot n!$. The invariant behind it: along the chain of calls, the product $\mathit{acc} \cdot n!$ of the current arguments never changes, and at the base it equals the returned value.

A call is a tail call when its result is returned unchanged, so nothing in the caller's frame is needed after it. The caller can then overwrite its own parameters with the new arguments and jump to the start of the function, which is the loop `while (n > 1) { acc = n * acc; n = n - 1; } return acc;`, and the frame count stays 1. In `n * fact(n - 1)` the caller must keep $n$ until the inner call returns, so each of the $n$ nested calls holds a live frame and the stack depth is $n$.

**GATE use.** MCQs ask which version of a function is tail-recursive, or what stack space a recursive function needs: $O(n)$ for linear recursion, $O(1)$ for the tail form after elimination. The trap is calling `return n * f(n - 1)` tail-recursive because the call is written last; the multiplication comes after it.

**Check.** The compiled function returned `fact(5, 1)` $= 120$, `fact(10, 1)` $= 3628800$ and `fact(6, 2)` $= 1440 = 2 \cdot 720$. Called with $n = 10^7$ (in unsigned 64-bit arithmetic, which wraps), the program crashed with a segmentation fault when compiled at `-O0` and ran to completion at `-O2`, where clang turned the tail call into a loop.

## Tower of Hanoi: the move count, its optimality, and moves per disk
<!-- topics: pds-c-programming.recursion-recurrences -->

**Claim.** The recursive solution moves $n - 1$ disks to the spare peg, moves the largest disk, then moves the $n - 1$ disks onto it. Its move count satisfies

$$M(n) = 2M(n-1) + 1,\quad M(0) = 0 \quad\Longrightarrow\quad M(n) = 2^n - 1,$$

and no legal sequence uses fewer moves. Numbering the disks $1, \dots, n$ from the smallest, disk $k$ moves exactly $2^{n-k}$ times. With base case $n = 0$ the function makes $2^{n+1} - 1$ calls; with base case $n = 1$ (move the disk and return) it makes $2^n - 1$ calls.

**Proof.** Upper bound. The three steps use $M(n-1)$, 1 and $M(n-1)$ moves, which is the recurrence. Unrolling, $M(n) + 1 = 2(M(n-1) + 1) = \dots = 2^n (M(0) + 1) = 2^n$, so $M(n) = 2^n - 1$.

Lower bound. Let $M^*(n)$ be the fewest moves that transfer $n$ disks between two pegs. The largest disk must move at least once. When it first moves, from the source peg to some peg $X$, the other $n - 1$ disks cannot be on either of those two pegs, since a larger disk cannot sit on a smaller one and the largest disk must be the top of its peg; so all $n - 1$ are on the third peg, which took at least $M^*(n-1)$ moves to arrange. After the largest disk's last move, onto the target peg, the other disks again all sit on the one remaining peg and must be moved onto the target, another $M^*(n-1)$ moves at least. These two phases and the largest disk's move are disjoint, so $M^*(n) \ge 2M^*(n-1) + 1$, and with $M^*(0) = 0$ induction gives $M^*(n) \ge 2^n - 1$.

Moves per disk. Let $D(n, k)$ be the number of moves of disk $k$ when the recursion transfers $n \ge k$ disks. Disk $n$ moves once in the middle step, so $D(n, n) = 1$. For $k < n$, disk $k$ moves only inside the two recursive transfers of $n - 1$ disks, so $D(n, k) = 2D(n-1, k)$. Hence $D(n, k) = 2^{n-k}$, and the total $\sum_{k=1}^{n} 2^{n-k} = 2^n - 1$ agrees with $M(n)$.

Calls. With base case $n = 0$, the call count satisfies $K(n) = 2K(n-1) + 1$ with $K(0) = 1$, so $K(n) + 1 = 2^n \cdot 2$ and $K(n) = 2^{n+1} - 1$: every one of the $2^n - 1$ internal calls makes a move, and the $2^n$ leaves do nothing. With base case $n = 1$, $K(1) = 1$ and $K(n) = 2K(n-1) + 1$ give $K(n) = 2^n - 1$, one call per move.

**GATE use.** NATs ask for the total number of moves, the number of moves of the smallest or the $k$-th disk, or the number of calls of a given implementation. The traps are $2^n$ instead of $2^n - 1$, counting disks from the largest instead of the smallest when the question numbers them the other way, and confusing calls with moves when the base case is $n = 0$.

**Check.** A simulation of the recursion with 5 disks made 31 moves, of which disks 1 to 5 (smallest first) made 16, 8, 4, 2 and 1; it confirmed $2^n - 1$ moves, $2^{n-k}$ moves of disk $k$ and $2^{n+1} - 1$ calls for every $n \le 10$, and the base-case-1 version made 31 calls for $n = 5$. A breadth-first search over all legal configurations found the shortest solutions for $n = 1$ to 6 to have 1, 3, 7, 15, 31 and 63 moves.

## Naive Fibonacci: calls, additions, time and stack
<!-- topics: pds-c-programming.recursion-recurrences -->

**Claim.** For `int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }`, with $F_0 = 0$, $F_1 = 1$ and $F_{k} = F_{k-1} + F_{k-2}$, the evaluation of `fib(n)` makes

$$C(n) = C(n-1) + C(n-2) + 1,\quad C(0) = C(1) = 1 \quad\Longrightarrow\quad C(n) = 2F_{n+1} - 1$$

calls in total, of which $F_{n+1}$ are base-case calls (leaves), and it performs $F_{n+1} - 1$ additions. Since $\varphi^{n-1} \le F_{n+1} \le \varphi^n$ for $n \ge 1$, where $\varphi = (1 + \sqrt5)/2 \approx 1.618$, the running time is $\Theta(\varphi^n)$, while the stack holds at most $n$ frames for $n \ge 1$. Memoising or iterating computes each $F_k$ once, in $\Theta(n)$ time.

**Proof.** A call with $n \ge 2$ is itself one call and spawns the call trees of $n - 1$ and $n - 2$, which gives the recurrence for $C$; a call with $n < 2$ is a single call. Put $D(n) = C(n) + 1$. Then $D(n) = D(n-1) + D(n-2)$ with $D(0) = D(1) = 2 = 2F_1 = 2F_2$, so $D$ and $2F_{n+1}$ satisfy the same recurrence from the same two starting values, and $D(n) = 2F_{n+1}$ for all $n$. The leaves satisfy $L(n) = L(n-1) + L(n-2)$ with $L(0) = L(1) = 1 = F_1 = F_2$, so $L(n) = F_{n+1}$. Every internal call does one addition, and in a tree where each internal node has two children the internal nodes number one fewer than the leaves, so the additions are $F_{n+1} - 1$, and $C(n) = L(n) + (L(n) - 1) = 2F_{n+1} - 1$ again.

For the bounds, $\varphi^2 = \varphi + 1$, so $\varphi^{k} = \varphi^{k-1} + \varphi^{k-2}$. Induct on $n$: $F_2 = 1 = \varphi^0$ and $F_3 = 2$ lies in $[\varphi, \varphi^2] \approx [1.618, 2.618]$, and if both bounds hold for $n - 1$ and $n - 2$, adding them gives $\varphi^{n-2} + \varphi^{n-3} = \varphi^{n-1} \le F_{n+1} \le \varphi^{n-1} + \varphi^{n-2} = \varphi^n$. Each call does constant work besides its children, so the time is $\Theta(C(n)) = \Theta(\varphi^n)$. The longest root-to-leaf path follows $n, n-1, \dots, 1$, which is $n$ calls, and by the call-tree section that is the maximum number of frames. With memoisation each value $F_k$ for $k \le n$ is computed by one call that does constant work beyond its lookups, so the total is $\Theta(n)$; the iterative loop keeps the last two values and uses $O(1)$ space.

**GATE use.** NATs ask for the number of calls, additions or printed lines for `fib(5)` to `fib(8)`; write the count recurrence with the "+1 for this call", take the base values from the code, and tabulate. MCQs ask for the time and space of the naive version. The traps are answering $F_n$ or $F_{n+1}$ for the call count, counting additions as calls, and quoting $O(2^n)$ space instead of $O(n)$ stack.

**Check.** An instrumented `fib(6)` returned 8 with 25 calls, 12 additions, 13 leaves and a maximum depth of 6 frames; `fib(10)` returned 55 with 177 calls ($2 \cdot 89 - 1$), 88 additions and 89 leaves. The tabulated counts $1, 1, 3, 5, 9, 15, 25$ for $n = 0..6$ follow the recurrence. A script confirmed the call, addition, leaf and depth formulas for $n \le 21$ and the bounds $\varphi^{n-1} \le F_{n+1} \le \varphi^n$ for $n \le 50$.

## Recurrences read off recursive code: linear, halving and doubling, Euclid and binary search
<!-- topics: pds-c-programming.recursion-recurrences -->

**Claim.** Let $c > 0$ be the work a call does outside its recursive calls.

1. $T(n) = T(n-1) + c$ gives $T(n) = T(0) + cn = \Theta(n)$.
2. $T(n) = T(\lfloor n/2 \rfloor) + c$ with $T(1) = d$ gives $T(n) = d + c\lfloor \log_2 n \rfloor = \Theta(\log n)$.
3. $T(n) = 2T(n-1) + c$ gives $T(n) = 2^n\,(T(0) + c) - c = \Theta(2^n)$.
4. Recursive binary search on a sorted range of $n \ge 1$ elements, written as `if (lo > hi) return -1; mid = (lo + hi) / 2; …` with one recursive call on the half without `mid`, makes at most $\lfloor \log_2 n \rfloor + 1$ calls for a key that is present and at most $\lfloor \log_2 n \rfloor + 2$ for one that is absent, counting the final empty-range call.
5. Euclid's `gcd(a, b) = b == 0 ? a : gcd(b, a % b)` with $a > b \ge 1$: if it performs $k \ge 1$ division steps then $a \ge F_{k+2}$ and $b \ge F_{k+1}$, so $k \le 1 + \log_\varphi b = O(\log \min(a, b))$. The consecutive Fibonacci pair $(F_{k+2}, F_{k+1})$ is the smallest input needing $k$ steps.
6. A recursion that branches into two calls per level for $n$ levels, as when generating all subsets, has $2^n$ leaves and $2^{n+1} - 1$ calls; one that branches $n, n-1, \dots, 1$ ways, as when generating all permutations, has $n!$ leaves and $\sum_{j=0}^{n} n!/j!$ calls.

**Derivation.** (1) Unroll: $T(n) = T(n-1) + c = T(n-2) + 2c = \dots = T(0) + nc$.

(2) The sequence $n, \lfloor n/2 \rfloor, \lfloor n/4 \rfloor, \dots$ equals $\lfloor n/2^i \rfloor$, since $\lfloor \lfloor x \rfloor / 2 \rfloor = \lfloor x/2 \rfloor$. It reaches 1 at the first $i$ with $2^{i+1} > n$, which is $i = \lfloor \log_2 n \rfloor$, and each of those $i$ steps adds $c$.

(3) Add $c$ to both sides: $T(n) + c = 2(T(n-1) + c)$, so $T(n) + c = 2^n (T(0) + c)$. With $T(0) = 0$ and $c = 1$ this is $2^n - 1$, the Hanoi count.

(4) Let $W(n)$ be the most calls for a range of size $n$, with $W(0) = 1$ (the empty-range call). A call on $n \ge 1$ elements either finds the key or recurses on one side of `mid`, whose sizes are $\lfloor (n-1)/2 \rfloor$ and $\lceil (n-1)/2 \rceil = \lfloor n/2 \rfloor$, so $W(n) = 1 + W(\lfloor n/2 \rfloor)$. By (2), with $W(1) = 1 + W(0) = 2$, $W(n) = 2 + \lfloor \log_2 n \rfloor$. A present key ends at a call that finds it, never at the empty call, so it uses at most one call fewer, $\lfloor \log_2 n \rfloor + 1$, and the worst case attains this (search for the last element).

(5) The key fact is that $a \bmod b < a/2$ when $a \ge b \ge 1$: if $b \le a/2$ then $a \bmod b < b \le a/2$, and if $b > a/2$ then $a \bmod b = a - b < a/2$. For the sharp bound (Lamé's theorem, as in CLRS), induct on $k$. For $k = 1$, $b \ge 1 = F_2$ and $a > b$ gives $a \ge 2 = F_3$. For $k \ge 2$ the call on $(b, a \bmod b)$ performs $k - 1 \ge 1$ steps with $b > a \bmod b \ge 1$, so by the hypothesis $b \ge F_{k+1}$ and $a \bmod b \ge F_k$. Since $a > b$, the quotient $\lfloor a/b \rfloor$ is at least 1, so $a = \lfloor a/b \rfloor\, b + (a \bmod b) \ge F_{k+1} + F_k = F_{k+2}$. Then $b \ge F_{k+1} \ge \varphi^{k-1}$ (Fibonacci section) gives $k \le 1 + \log_\varphi b$. The pair $(F_{k+2}, F_{k+1})$ takes exactly $k$ steps, because $F_{k+2} \bmod F_{k+1} = F_k$ for $k \ge 2$, which shows the bound is attained. If $a < b$, the first step only swaps the arguments. The recursive version makes $k + 1$ calls, counting the one with $b = 0$.

(6) For subsets, every call at depth $i < n$ makes two calls (include element $i$ or not), so depth $i$ holds $2^i$ calls and the total is $\sum_{i=0}^{n} 2^i = 2^{n+1} - 1$, with $2^n$ leaves at depth $n$. For permutations, a call at depth $i$ chooses among the $n - i$ unused elements, so depth $i$ holds $n(n-1)\cdots(n-i+1) = n!/(n-i)!$ calls; summing over $i = 0..n$ and substituting $j = n - i$ gives $\sum_{j=0}^{n} n!/j!$, and the leaves at depth $n$ number $n!$. That sum is at most $e \cdot n!$, and each leaf outputs $n$ items, so the cost is $\Theta(n \cdot n!)$.

**GATE use.** MCQs give a recursive function and ask for its time complexity: count the calls and their argument sizes, add the outside work, and solve with (1) to (3), or with the Master theorem for $aT(n/b) + f(n)$. NATs ask for the number of calls of gcd on given inputs, or of binary search in the worst case. The traps are reading $T(n) = 2T(n-1) + c$ as $\Theta(n)$ because each call does constant work, mixing up calls and division steps in Euclid, and forgetting the empty-range call of an unsuccessful binary search.

**Check.** The recurrences gave $T(10) = 10$ for (1) and $T(10) = 1023$ for (3) with $T(0) = 0$, $c = 1$, and (2) matched $\lfloor \log_2 n \rfloor$ for every $n \le 1024$. Instrumented binary search made at most $\lfloor \log_2 n \rfloor + 1$ calls for present keys for every $n < 2000$ (3 for $n = 7$, 4 for $n = 8$ and $n = 15$, 5 for $n = 16$, 10 for $n = 1000$) and at most $\lfloor \log_2 n \rfloor + 2$ over all keys for $n < 300$. `gcd(13, 8)` made 6 calls (5 steps), and `gcd(89, 55)` made 10 calls, with $89 = F_{11}$ and $55 = F_{10}$. Over all $1 \le b \le a < 400$ the script found no step with $a \bmod b \ge a/2$, and for $k = 1$ to 11 the smallest $a > b$ needing $k$ steps was $(F_{k+2}, F_{k+1})$. For $n = 3$ the subset tree had 15 calls and 8 leaves and the permutation tree 16 calls and 6 leaves; for $n = 4$ the permutation tree had 65 calls, below $e \cdot 4! \approx 65.24$; both formulas held for every $n \le 7$.
