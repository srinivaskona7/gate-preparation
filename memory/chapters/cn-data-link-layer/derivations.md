# Data link layer: derivations

## Bit stuffing makes the flag unambiguous
<!-- topics: cn-data-link-layer.framing, cn-data-link-layer.dll-services -->

**Claim.** HDLC delimits a frame with the flag $01111110$. The sender inserts a $0$ after every run of five consecutive $1$s in the payload, counting the stuffed $0$ as the end of the run, and the receiver deletes the $0$ that follows every run of five $1$s inside the frame. Then (i) the stuffed payload never contains six consecutive $1$s, so the flag cannot appear inside it, and (ii) destuffing returns the original payload exactly, for every bit string. A character-count framing has no such property: one corrupted count field desynchronises every later frame.

**Proof.** (i) The sender's counter of consecutive $1$s rises by one for each $1$ it emits and is reset by every $0$. The moment it reaches five, the sender emits a $0$, so the counter never reaches six and no run of six $1$s is emitted. The flag contains six $1$s in a row, so it cannot occur wholly inside the stuffed payload. It also cannot straddle a boundary. Both flags begin and end with $0$, so a false flag overlapping the opening or closing flag would still need its six $1$s to lie wholly inside the payload. (ii) The receiver runs the same counter over the received bits. The sender's counter and the receiver's counter see the same bit sequence, so they reach five at the same positions, and at each such position the next bit is the stuffed $0$. Deleting exactly those bits undoes exactly the insertions. Inside the frame a run of five $1$s followed by a $1$ cannot occur, so seeing $0111111$ means the flag (or an error). Byte stuffing is the same idea one level up (PPP): an escape byte is placed before every flag or escape byte in the data, and the receiver drops each escape and keeps the byte after it.

**GATE use.** Questions give a bit string and ask for the stuffed output, or give a stuffed string and ask for the data. The traps are stuffing after six $1$s instead of five, forgetting that the stuffed $0$ resets the count (so eleven $1$s get two stuffed bits, not one after the tenth), and stuffing inside the flags themselves.

**Check.** $011111111$ becomes $0111110111$: a $0$ goes in after the first five $1$s and the remaining three need nothing. Eleven $1$s become $1111101111101$, with two stuffed bits. A script stuffed every bit string of length at most 14, confirmed that no output contains $111111$, that destuffing returns the input, and that in the framed string $01111110\,\cdot\,\text{payload}\,\cdot\,01111110$ the flag pattern occurs only at the two ends.

## Minimum distance decides detection and correction
<!-- topics: cn-data-link-layer.hamming -->

**Claim.** Let a code be a set of $n$-bit codewords with minimum Hamming distance $d_{\min}$, the fewest positions in which two distinct codewords differ (for a linear code, the fewest $1$s in a nonzero codeword). Then the code detects every pattern of at most $s$ bit errors if and only if $d_{\min} \ge s + 1$, and nearest-codeword decoding corrects every pattern of at most $t$ errors if and only if $d_{\min} \ge 2t + 1$. A code of distance $d$ therefore detects $d - 1$ errors and corrects $\lfloor (d-1)/2 \rfloor$; correcting up to $t$ errors while still detecting up to $s > t$ needs $d_{\min} \ge s + t + 1$.

**Proof.** The number of positions in which two words differ is a metric $d(x, y)$ and obeys the triangle inequality. Detection: an error pattern of weight $w$ turns codeword $c$ into a word $y$ with $d(c, y) = w$. The error goes undetected exactly when $y$ is another codeword. If $d_{\min} \ge s + 1$ and $1 \le w \le s$, then $y$ is at distance at most $s$ from $c$ and cannot be a codeword. Conversely, if two codewords $c, c'$ are at distance $d_{\min} \le s$, flipping the $d_{\min}$ positions where they differ turns $c$ into $c'$, an undetected error of weight at most $s$. Correction: suppose $d_{\min} \ge 2t + 1$ and $y$ is received with $d(c, y) \le t$. For any other codeword $c'$, $d(c', y) \ge d(c, c') - d(c, y) \ge 2t + 1 - t = t + 1$, so $c$ is the unique nearest codeword. Conversely, if $d(c, c') = d_{\min} \le 2t$, flip $\lceil d_{\min}/2 \rceil \le t$ of the positions where $c$ and $c'$ differ in $c$; the result is at distance $\lceil d_{\min}/2 \rceil$ from $c$ and $\lfloor d_{\min}/2 \rfloor$ from $c'$, so the decoder either picks $c'$ or has a tie. For the combined claim, the decoder corrects $y$ only when some codeword lies within distance $t$. An error of weight $w$ with $t \lt w \le s$ must not land within $t$ of a different codeword $c'$; that needs $d(c, c') \gt s + t$ by the triangle inequality, which is $d_{\min} \ge s + t + 1$.

**GATE use.** The 1-mark NAT lists four or five codewords and asks for the number of errors detected or corrected. Find $d_{\min}$ by XORing every pair and counting $1$s, then apply $d - 1$ and $\lfloor (d - 1)/2 \rfloor$. The trap is answering with $d$ itself, or taking the largest pairwise distance instead of the smallest.

**Check.** The codewords $00000$, $01011$, $10101$ and $11110$ have pairwise distances $3, 3, 4, 4, 3, 3$, so $d_{\min} = 3$: they detect 2 errors and correct 1. The Hamming(7,4) code of the next section has $d_{\min} = 3$ by enumeration of its 16 codewords, and appending an overall parity bit raises it to 4 (SECDED), which corrects 1 and detects 2 at once since $4 \ge 2 + 1 + 1$.

## Parity: what single and two-dimensional parity catch
<!-- topics: cn-data-link-layer.parity, cn-data-link-layer.hamming -->

**Claim.** (i) A single even parity bit over $m$ data bits detects exactly the error patterns of odd weight and misses every pattern of even weight; its code has $d_{\min} = 2$, so it corrects nothing. (ii) Two-dimensional parity on an $R \times C$ data grid, with a parity bit per row, per column and one corner bit, detects every error of weight 1, 2 or 3, corrects every single-bit error, and misses some errors of weight 4: exactly those that flip the four corners of a rectangle, and there are $\binom{R+1}{2}\binom{C+1}{2}$ of them.

**Proof.** (i) The receiver recomputes the parity of all $m + 1$ bits. Each flipped bit changes that parity, so $w$ flips change it exactly when $w$ is odd. Two data words differing in one bit get different parity bits, so codewords differ in at least 2 positions, and flipping one data bit together with the parity bit gives a codeword at distance 2. (ii) The code is linear, so an error pattern $E$ goes undetected exactly when $E$ itself has even weight in every row and every column of the $(R+1) \times (C+1)$ array. A pattern of weight 1 leaves its row odd. A pattern of weight 2 either sits in one row, leaving two columns odd, or in two rows, leaving each of those rows odd. A pattern of weight 3 cannot make every nonempty row even: each nonempty row would need an even number, at least 2, of flipped bits, and 3 is odd. So weights 1 to 3 are detected. For weight 4, every nonempty row and column needs exactly 2 or 4 flips; with 2 flips in each of two rows and all columns even, the two rows must use the same two columns, which is a rectangle. Four flips in one row would leave four columns odd. The rectangles are counted by choosing 2 of the $R + 1$ rows and 2 of the $C + 1$ columns. A single flip makes exactly one row check and one column check fail, and their crossing locates it, so it can be corrected.

**GATE use.** MCQs ask which error patterns parity detects (odd counts only) and what the smallest undetectable error for 2D parity is (4 bits, a rectangle). Some statements claim 2D parity corrects two errors; it does not, since two flips in one row fail two columns and no row, which does not locate them.

**Check.** A brute-force run on a $3 \times 4$ data grid (a $4 \times 5$ array of 20 bits) found 0 undetected patterns of weight 1, 2 and 3 and 60 of weight 4, matching $\binom{4}{2}\binom{5}{2} = 6 \cdot 10 = 60$.

## Hamming code: the check-bit bound and syndrome decoding
<!-- topics: cn-data-link-layer.hamming -->

**Claim.** A code that adds $r$ check bits to $m$ data bits and corrects every single-bit error must satisfy

$$2^{r} \ge m + r + 1,$$

and the Hamming code meets the bound with the smallest such $r$. In it the $n = m + r$ positions are numbered $1, \dots, n$, check bits sit at positions $1, 2, 4, \dots, 2^{r-1}$, and check bit $2^i$ makes even the parity of every position whose index has bit $i$ set. The syndrome, the XOR of the indices of all positions holding a $1$, is $0$ for a codeword and equals the position of the flipped bit after one error.

**Proof.** Bound: the code has $2^m$ codewords of $n = m + r$ bits. For each codeword $c$, the decoder must map $c$ itself and its $n$ single-bit neighbours, $n + 1$ received words in all, back to $c$. A received word decodes to one codeword only, so these sets of $n + 1$ words are disjoint for different codewords, and together they fit among the $2^n$ words of length $n$: $2^m (n + 1) \le 2^n$. Dividing by $2^m$ gives $2^r \ge n + 1 = m + r + 1$. The argument uses any decoder, linear or not. The check bits count because they travel in the frame and can themselves be hit; testing $2^r \ge m + 1$ forgets those $r$ cases. Construction: write $S(y) = \bigoplus_{p:\,y_p = 1} p$. Bit $i$ of $S(y)$ is the parity of the positions with bit $i$ set and holding a $1$, which is exactly check $i$, and the encoder sets position $2^i$ to make it $0$; position $2^i$ has only bit $i$ set in its index, so it enters check $i$ and no other, and the encoder can satisfy the $r$ checks one at a time. Hence $S(c) = 0$ for every codeword $c$. Flipping position $p$ toggles $p$ into the XOR, so $S(c \oplus e_p) = S(c) \oplus p = p$. Distinct positions give distinct nonzero syndromes, so the decoder corrects any single error, and since $n \le 2^r - 1$ every position has a nonzero $r$-bit index. This is the construction in Tanenbaum and Hamacher.

**GATE use.** The NAT asks for the number of check bits for $m$ data bits: try $r = 1, 2, 3, \dots$ until $2^r \ge m + r + 1$. Other forms give a received 7-bit Hamming word and ask which bit is wrong (compute the syndrome) or ask for the encoded word. The trap is $2^r \ge m$: 12 data bits need 5 check bits, since $2^4 = 16 \lt 12 + 4 + 1 = 17$.

**Check.** The smallest $r$ is 3 for $m = 4$, 4 for $m = 7$ and $m = 11$ ($16 \ge 16$), 5 for $m = 12$ and $m = 26$, and 6 for $m = 32$. Data $1011$ in positions 3, 5, 6, 7 encodes to $0110011$. A script checked all 16 codewords of Hamming(7,4) against all 7 single-bit flips: the syndrome equalled the flipped position every time; flipping position 5 of $0110011$ gives syndrome 5.

## Internet checksum: one's complement arithmetic
<!-- topics: cn-data-link-layer.checksum -->

**Claim.** Split the data into $k$-bit words $w_1, \dots, w_n$. Their one's complement sum $S$, computed by ordinary addition with every carry out of bit $k - 1$ added back into bit 0, satisfies $S \equiv \sum_j w_j \pmod{2^k - 1}$. The sender transmits the checksum $\overline{S}$, the bitwise complement of $S$. At the receiver the one's complement sum of all words plus the checksum is $2^k - 1$ (all $1$s) when no error occurred. The check misses any error that leaves $\sum_j w_j$ unchanged modulo $2^k - 1$, which includes every reordering of the words.

**Derivation.** A carry out of bit $k - 1$ has value $2^k$, and the end-around carry replaces it with $1$. Since $2^k \equiv 1 \pmod{2^k - 1}$, the replacement does not change the value modulo $2^k - 1$, so the running sum stays congruent to the ordinary sum. The complement of a $k$-bit word $x$ is $\overline{x} = (2^k - 1) - x$, so $S + \overline{S} = 2^k - 1$ with no carry, and that is the all-$1$s word. The receiver's sum of all data words is $S$ again, and adding $\overline{S}$ gives all $1$s, whose complement is $0$. Addition is commutative, so swapping words changes nothing; likewise flipping the same bit position from $0$ to $1$ in one word and from $1$ to $0$ in another adds and subtracts the same power of two. CRC catches both kinds, which is why the link layer uses CRC and software layers (IP, TCP, UDP, with $k = 16$) use the cheaper checksum.

**GATE use.** A 1-mark question gives two to four words and asks for the checksum. The traps are dropping the carry instead of wrapping it and forgetting the final complement; the receiver form asks whether a received set of words passes, which is the all-$1$s test.

**Check.** With 8-bit words, $10110011 + 11001010 = 1\,01111101$, which wraps to $01111110$; adding $01101100$ gives $11101010$, so the checksum is $00010101$. The receiver's sum of the three words and $00010101$ is $11111111$. A script compared the wrapped sum against $\sum w_j \bmod 255$ on 10,000 random word lists and found no mismatch.

## CRC: construction, and which errors it misses
<!-- topics: cn-data-link-layer.crc -->

**Claim.** Treat bit strings as polynomials over GF(2), where addition and subtraction are both XOR. For data $M(x)$ and a generator $G(x)$ of degree $r$ (an $(r+1)$-bit pattern), the sender transmits

$$T(x) = x^{r} M(x) + \big(x^{r} M(x) \bmod G(x)\big),$$

which is $M$ followed by the $r$-bit remainder, and $G(x) \mid T(x)$. If the channel adds an error pattern $E(x)$, the receiver sees a nonzero remainder unless $G(x) \mid E(x)$. Consequences: every single-bit error is caught if $G$ has at least two terms; every odd-weight error is caught if $(x + 1) \mid G$; every burst of length at most $r$ is caught if $G$ has a nonzero constant term; and every double-bit error $x^i + x^j$ in a frame of $n$ bits is caught if $G(0) = 1$ and $G$ divides no $x^k + 1$ with $1 \le k \le n - 1$. A CRC detects; it never corrects.

**Proof.** Division gives $x^r M(x) = Q(x) G(x) + R(x)$ with $\deg R \lt r$. Adding $R$ to both sides, and using $R + R = 0$, gives $T = x^r M + R = Q G$, so $G \mid T$. Multiplying $M$ by $x^r$ shifts it left $r$ places, leaving the low $r$ coefficients zero, so adding $R$ just fills them in: the frame is the data followed by the remainder. The receiver divides $T + E$ by $G$; since $G \mid T$, the remainder is $E \bmod G$, which is zero exactly when $G \mid E$. Single bit: $E = x^i$; if $G$ has two or more terms then $G$ is not a power of $x$, and the only divisors of $x^i$ are powers of $x$, so $G \nmid E$. Odd weight: if $G = (x + 1) H$ and $G \mid E$, then $E(1) = 0 \cdot H(1) = 0$, but $E(1)$ is the number of terms of $E$ modulo 2, which is 1 for odd weight. Burst: a burst of length $b \le r$ starting at bit $i$ is $E = x^i B(x)$ with $\deg B = b - 1 \lt r$ and $B(0) = 1$. If $G(0) = 1$ then $G$ shares no factor with $x^i$, so $G \mid E$ would force $G \mid B$, impossible since $B \ne 0$ has smaller degree. Double bit: $x^i + x^j = x^j (x^{i-j} + 1)$ with $1 \le i - j \le n - 1$, and with $G(0) = 1$ the same argument shows $G \mid E$ exactly when $G \mid x^{i-j} + 1$. Without $G(0) = 1$ the test fails: $G = x^2 + x$ divides no $x^k + 1$, since each has constant term 1, yet it equals the double-bit error $x^2 + x$. A factor $x + 1$ gives no double-bit guarantee, because $x + 1$ divides every $x^k + 1$. This follows Tanenbaum and Peterson.

**GATE use.** The 2-mark MCQ gives data and a generator and asks for the transmitted frame. Append $r$ zeros, where $r$ is one less than the generator's length, and divide with XOR. A second form asks which statement about a generator is true. The traps are appending $r + 1$ zeros, using ordinary subtraction, and reading "$x + 1$ is a factor" as "all double-bit errors are caught".

**Check.** Data $1101$ with $G = 1011$: dividing $1101000$ leaves $001$, so the frame is $1101001$, and dividing that frame leaves $000$; the frame $1101110$ would leave $111$ and be rejected. Data $1101011011$ with $G = 10011$ gives remainder $1110$. A script confirmed that $11101 = (x + 1)(x^3 + x + 1)$ divides no odd-weight pattern of 12 bits, that $x + 1$ divides $x^5 + x^2$, that $x^3 + x + 1$ divides $x^k + 1$ for no $k \le 6$ but does divide $x^7 + 1$, and that $1011$, $10011$ and $11101$ miss no burst of length at most their degree and exactly one burst pattern of length degree plus one.

## Stop-and-wait efficiency
<!-- topics: cn-data-link-layer.stop-and-wait -->

**Claim.** Let a frame of $L$ bits go over a link of rate $R$ and length $d$ with signal speed $v$, so the transmission time is $T_t = L/R$ and the one-way propagation delay is $T_p = d/v$. With no errors, and ignoring the ACK's transmission time and all processing, stop-and-wait has link efficiency and throughput

$$\eta = \frac{T_t}{T_t + 2T_p} = \frac{1}{1 + 2a}, \quad a = \frac{T_p}{T_t}, \qquad \text{throughput} = \eta R.$$

If the ACK takes $T_{\text{ack}}$ to transmit and processing takes $T_{\text{proc}}$, the cycle becomes $T_t + 2T_p + T_{\text{ack}} + T_{\text{proc}}$ and $\eta$ is $T_t$ over that.

**Derivation.** The sender starts a frame at time 0 and finishes putting it on the wire at $T_t$. Its last bit reaches the receiver at $T_t + T_p$. The receiver sends the ACK at once, and with $T_{\text{ack}} = 0$ it arrives at $T_t + 2T_p$, when the sender may start the next frame. The schedule therefore repeats with period $T_t + 2T_p$, and the link carries data for $T_t$ of each period, which is $\eta$. Dividing top and bottom by $T_t$ gives $1/(1 + 2a)$. Over a long run of $n$ frames the sender delivers $nL$ bits in $n(T_t + 2T_p)$ seconds, so the throughput is $L/(T_t + 2T_p) = \eta R$. The 2 is the round trip: the data goes out and the ACK comes back. Any extra term the question gives (ACK transmission, processing, queueing) adds to the period because the sender is idle through it.

**GATE use.** NATs give $L$, $R$, $d$ and $v$ and ask for efficiency, throughput, or the frame size for a target efficiency (solve $1/(1 + 2a) \ge \eta$ for $L$). The traps are using $T_p$ instead of $2T_p$, dropping $T_t$ from the cycle, and mixing bits with bytes or km with m.

**Check.** $T_t = 1$ ms and $T_p = 5$ ms give $a = 5$ and $\eta = 1/11 \approx 9.09\%$. A timeline simulation of 10,000 frames with window 1 and $a = 5$ gave a busy fraction of $0.0909$.

## Sliding-window efficiency and the window that fills the link
<!-- topics: cn-data-link-layer.window-bounds, cn-data-link-layer.gbn-sr -->

**Claim.** On an error-free link with the assumptions of stop-and-wait, a sender that may have $W$ unacknowledged frames outstanding has efficiency

$$\eta = \min\left(1, \frac{W}{1 + 2a}\right),$$

for Go-Back-N and Selective Repeat alike, and the link is fully used exactly when $W \ge 1 + 2a$, rounded up to a whole frame. The bandwidth-delay product $R \cdot 2T_p$ alone gives $2a$ frames, one short.

**Derivation.** Measure time in units of $T_t$. Frame $i$ finishes transmission at time $f_i$, and its ACK returns at $f_i + 2a$, which frees one window slot. The sender transmits back to back, so frames $1, \dots, W$ occupy $[0, W]$. The ACK for frame 1 returns at $1 + 2a$. If $W \ge 1 + 2a$, the sender is still busy when it arrives, the slot it frees is ready before the next frame is due, and by induction the sender never pauses: $\eta = 1$. If $W \lt 1 + 2a$, the sender stops at time $W$ and resumes at $1 + 2a$, when frame 1's slot frees; the next $W$ frames then follow the same pattern shifted by $1 + 2a$, so each period of $1 + 2a$ carries $W$ frames and $\eta = W/(1 + 2a)$. The extra 1 is the first frame's own transmission time, which must pass before its ACK can even begin its trip; counting only the round trip $2T_p R$ in bits misses it.

**GATE use.** NATs ask for the window size needed to keep the link busy, or for the efficiency or throughput with a given window, and then chain into the sequence-number bits of the next section. The traps are using the BDP alone (40 instead of 41 below) and forgetting to cap $\eta$ at 1 when $W$ is large.

**Check.** $T_t = 1$ ms and $T_p = 20$ ms give $a = 20$ and $W = 41$ frames; a window of 10 gives $\eta = 10/41$. The timeline simulation gave busy fractions $0.3637$ for $W = 4$, $a = 5$ (formula $4/11 = 0.3636$), and $1.0$ for $W = 11$ and $W = 15$ with $a = 5$.

## Sequence-number bounds for Go-Back-N and Selective Repeat
<!-- topics: cn-data-link-layer.window-bounds, cn-data-link-layer.gbn-sr -->

**Claim.** With $k$-bit sequence numbers (frames numbered modulo $2^k$) over a FIFO link that may lose frames and ACKs, the protocol delivers every frame exactly once and in order if and only if

$$W_{\text{GBN}} \le 2^{k} - 1, \qquad W_{\text{SR}} \le 2^{k-1} \text{ (equal windows)}, \qquad W_s + W_r \le 2^k \text{ in general}.$$

Equivalently, windows $W_s$ and $W_r$ need $k \ge \lceil \log_2 (W_s + W_r) \rceil$ bits: $\lceil \log_2 (W + 1) \rceil$ for GBN ($W_r = 1$) and $\lceil \log_2 2W \rceil$ for SR.

**Proof.** Give frames unbounded true numbers and let $n$ be the receiver's next expected frame, so frames below $n$ have all been accepted. Two facts bound the true number $s$ of any frame that reaches the receiver. Upper: when $s$ was sent, the sender's window base $b$ satisfied $s \le b + W_s - 1$, and $b \le n$ because the sender advances its base only on ACKs for frames the receiver has accepted; so $s \le n + W_s - 1$. Lower: under FIFO, frame $n - 1$ was accepted before $s$ arrived, so the accepted copy of $n - 1$ was sent before $s$. When it was sent, $n - 1 \le b' + W_s - 1$ for the base $b'$ at that time, and bases only grow, so $b' \le b \le s$ and $s \ge n - W_s$. Hence $s \in [n - W_s,\, n + W_s - 1]$. GBN: the receiver accepts only $s = n$. Old duplicates have $n - s \in [1, W]$ and later frames have $s - n \in [1, W - 1]$; all are nonzero modulo $2^k$ exactly when $W \le 2^k - 1$, so the receiver never accepts a wrong frame. SR: the receiver accepts any $s$ in its window $[n, n + W_r - 1]$ and must recognise $s \in [n - W_s, n - 1]$ as an old duplicate. Those two ranges hold $W_r + W_s$ consecutive true numbers, which stay distinct modulo $2^k$ when $W_s + W_r \le 2^k$. When $W_s \gt W_r$, a frame with $s \in [n + W_r,\, n + W_s - 1]$ can also arrive, and it must not look like a number in the window. Here $s - n \in [W_r,\, W_s - 1]$, and $W_s - 1 \le 2^k - W_r - 1$, so $s - n \bmod 2^k$ lies in $[W_r,\, 2^k - 1]$, outside $[0, W_r - 1]$; the receiver discards it and the sender resends it later. With equal windows the bound is $W \le 2^{k-1}$. Necessity: suppose $W_s + W_r \gt 2^k$ and let $m = \max(1,\, 2^k - W_r + 1)$, so $1 \le m \le W_s$. Send frames $0, \dots, m - 1$, deliver all and lose every ACK. The receiver window is now $[m,\, m + W_r - 1]$, which contains $2^k \equiv 0$ because $m + W_r - 1 \ge 2^k$. The sender times out and resends old frame 0, and the receiver accepts it as the new frame $2^k$. For GBN ($W_r = 1$, $m = 2^k$) this is $W = 2^k$; for SR with equal windows it is $W = 2^{k-1} + 1$. This is the argument in Tanenbaum and Kurose.

**GATE use.** Combined with the previous section: find $W = \lceil 1 + 2a \rceil$, then the bits. The traps are using $2^k$ as the GBN window, applying the GBN bound to SR, and the misremembered SR bound $(2^k - 1)/2$; for $k = 3$ SR allows 4, GBN 7.

**Check.** For $W = 41$, GBN needs $\lceil \log_2 42 \rceil = 6$ bits and SR needs $\lceil \log_2 82 \rceil = 7$. A randomised simulation (FIFO channels, 30% loss of frames and ACKs, timeouts at arbitrary moments, 300 runs each) delivered every frame correctly for GBN with $W = 3$ ($k = 2$) and $W = 7$ ($k = 3$) and for SR with $W = 2$ and $W = 4$, and found a wrong delivery for GBN with $W = 4$ and $8$ and SR with $W = 3$ and $5$.

## Counting transmissions after a loss
<!-- topics: cn-data-link-layer.gbn-sr -->

**Claim.** Send $N$ frames with window $W$, let only frame $j$ (numbered from 1) be lost, once, let ACKs be reliable, and let the timeout exceed the round trip. Then Selective Repeat makes $N + 1$ transmissions and Go-Back-N makes

$$\min(j + W - 1,\, N) + (N - j + 1)$$

transmissions, which is $N + W$ when $j \le N - W + 1$.

**Derivation.** SR: the receiver buffers every correct frame and ACKs it individually, so the sender retransmits only frame $j$, once, for $N + 1$ in total. GBN: frames before $j$ are acknowledged as usual and keep the window sliding. Once frame $j$ is outstanding the base cannot pass it, so the sender transmits frames $j, j+1, \dots$ up to the end of the window, $j + W - 1$, or up to $N$ if the data ends first, and then stalls. That first pass sends $\min(j + W - 1, N)$ frames. The receiver discards every frame after $j$ because it expects $j$. When $j$'s timer expires the sender goes back and sends $j, \dots, N$ again, all now delivered, which is $N - j + 1$ more. When $j$ is early, the first pass is $j + W - 1$ frames and the total is $N + W$: the lost frame plus the $W - 1$ frames behind it are sent twice.

**GATE use.** NATs ask for the total number of transmissions for $N$ packets when every $k$-th transmission is lost, with GBN or SR. Trace the timeline explicitly in that version, since retransmissions also count toward "every $k$-th". The trap is assuming the window is not full when the timer fires; new frames keep going out while ACKs for earlier frames arrive.

**Check.** $N = 8$, $W = 4$: GBN makes 12 transmissions whenever the lost frame is among frames 1 to 5, then 11, 10 and 9 for frames 6, 7 and 8; SR makes 9 in every case. A script evaluated the formula for each $j$ and matched these counts.

## ALOHA throughput and slot success probability
<!-- topics: cn-data-link-layer.aloha -->

**Claim.** Let frames of fixed length (one frame time) be offered by a large population as a Poisson process of $G$ frames per frame time, new frames and retransmissions together. Then the throughput in successful frames per frame time is

$$S_{\text{pure}} = G e^{-2G}, \qquad S_{\text{slotted}} = G e^{-G},$$

with maxima $1/(2e) \approx 0.184$ at $G = 0.5$ and $1/e \approx 0.368$ at $G = 1$. A single frame succeeds with probability $e^{-2G}$ or $e^{-G}$. With $N$ stations each sending in a slot independently with probability $p$, a slot succeeds with probability $N p (1 - p)^{N-1}$, largest at $p = 1/N$, where it equals $(1 - 1/N)^{N-1}$, which decreases to $1/e$.

**Derivation.** In a Poisson process of rate $G$, the number of arrivals in an interval of length $\tau$ is Poisson with mean $G\tau$, and the probability of none is $e^{-G\tau}$. Pure ALOHA: a frame sent at time $t_0$ occupies $[t_0, t_0 + 1]$. It collides with any frame starting in $(t_0 - 1, t_0)$, whose tail overlaps its head, and any frame starting in $(t_0, t_0 + 1)$, which overlaps its tail. The vulnerable period has length 2, so the frame succeeds with probability $e^{-2G}$ and $S = G e^{-2G}$. Slotted ALOHA: frames start only at slot boundaries, so a frame collides only with frames in its own slot, the vulnerable period is 1 and $S = G e^{-G}$. Maximise: $\frac{d}{dG} G e^{-cG} = e^{-cG}(1 - cG) = 0$ at $G = 1/c$, giving $S = 1/(ce)$, which is $1/(2e)$ for $c = 2$ and $1/e$ for $c = 1$. Finite $N$: a slot succeeds exactly when one station transmits, which can be any of $N$ stations, each case having probability $p(1-p)^{N-1}$. The derivative of $N p (1-p)^{N-1}$ is $N(1-p)^{N-2}(1 - Np)$, zero at $p = 1/N$. With unequal probabilities $p_i$ the success probability is $\sum_i p_i \prod_{j \ne i} (1 - p_j)$. This follows Kurose and Ross.

**GATE use.** NATs give a channel rate, frame size and offered frame rate: convert to $G$ per frame time, then the successful rate is the offered rate times $e^{-2G}$ (pure) or $e^{-G}$ (slotted). Others ask for the probability that a slot succeeds given each station's transmit probability. The trap is multiplying the offered rate by $S$ rather than by the success probability.

**Check.** 200-bit frames on a 200 kbps channel give a frame time of 1 ms; 1000 frames per second offered is $G = 1$, so pure ALOHA delivers $1000 e^{-2} \approx 135$ frames per second. A Monte Carlo run gave $S = 0.1846$ for pure ALOHA at $G = 0.5$ (formula $0.1839$) and $0.3677$ for slotted at $G = 1$ (formula $0.3679$). A grid search over $p$ found the maximum at $p = 1/N$ with values $0.5$, $0.4444$, $0.3874$ and $0.3697$ for $N = 2, 3, 10, 100$. Stations with $p = 0.1, 0.2, 0.3$ give success probability $0.398$.

## CSMA/CD minimum frame size and Ethernet frame limits
<!-- topics: cn-data-link-layer.csma-cd, cn-data-link-layer.csma, cn-data-link-layer.ethernet -->

**Claim.** On a shared medium where the two farthest stations are $d$ apart, with signal speed $v$ and rate $R$, so $T_p = d/v$, a sender is sure to detect every collision on its own frame while still transmitting if and only if $T_t \ge 2T_p$, that is

$$L_{\min} = 2 T_p R = \frac{2 d R}{v} \text{ bits}.$$

In carrier sensing a station is vulnerable for $T_p$ after another starts, since it cannot hear that transmission yet. Classic 10 Mbps Ethernet fixes $L_{\min} = 512$ bits $= 64$ bytes; with 18 bytes of addresses, type and FCS, the payload lies between 46 and 1500 bytes and the frame between 64 and 1518 bytes, preamble and start delimiter excluded.

**Derivation.** Let station A start at time 0. Its first bit reaches the farthest station B at $T_p$. A carrier-sensing station hears A only after A's signal arrives, so B may still start just before $T_p$; this is the vulnerable period. In that worst case B's signal travels back and reaches A just before $2T_p$. A detects the collision only if it is still transmitting then, because a station that has finished cannot tell its frame was lost. So $T_t = L/R \ge 2T_p$ is required, and with $L = 2T_pR$ the worst-case collision is detected at the last instant, which gives $L_{\min}$. Read the other way, for a given frame size the cable length is at most $d_{\max} = Lv/(2R)$, and repeater delays add to $T_p$. For Ethernet: two 6-byte addresses, a 2-byte type or length field and a 4-byte CRC make 18 bytes, so a 64-byte frame leaves $64 - 18 = 46$ bytes of payload (shorter data is padded) and the 1500-byte maximum payload gives $1518$ bytes.

**GATE use.** The 1-mark NAT asks for the minimum frame size given distance, speed and rate, or the maximum distance given the frame size. The trap is using $T_p$ instead of $2T_p$, and a second trap is the unit change at the end (bits to bytes).

**Check.** $d = 1$ km, $v = 2 \times 10^8$ m/s and $R = 1$ Gbps give $L_{\min} = 2 \cdot 5\,\mu\text{s} \cdot 10^9 = 10{,}000$ bits $= 1250$ bytes. At 10 Mbps, 512 bits last $51.2\,\mu$s, allowing a one-way delay of $25.6\,\mu$s. At 100 Mbps with 512-bit frames and $v = 2 \times 10^8$ m/s, $d_{\max} = 512$ m. A 20-byte payload is padded with 26 bytes.

## Binary exponential backoff probabilities
<!-- topics: cn-data-link-layer.csma-cd, cn-data-link-layer.ethernet -->

**Claim.** After its $n$-th collision on a frame, a station draws $K$ uniformly from $\{0, 1, \dots, 2^{\min(n,10)} - 1\}$ and waits $K$ slot times (512 bit times in classic Ethernet), giving up after 16 attempts. Two stations that have both suffered $n$ collisions pick the same $K$, and collide again, with probability $2^{-\min(n,10)}$. When stations are at different stages, the probabilities follow by counting pairs of choices.

**Derivation.** The choices are independent and uniform over $2^{m}$ values, $m = \min(n, 10)$, so there are $2^{2m}$ equally likely pairs, of which $2^m$ are equal: probability $2^{-m}$. Doubling the range after each collision halves the chance of repeating it, so the expected backoff $(2^m - 1)/2$ slots grows with the evidence of load, which is the adaptive part. For stations at different stages, A drawing from $\{0, \dots, 2^{a} - 1\}$ and B from $\{0, \dots, 2^{b} - 1\}$, A transmits first exactly when $K_A \lt K_B$; count those pairs and divide by $2^{a+b}$. Equal values collide again.

**GATE use.** The standard question has A and B collide; A wins the first backoff race and transmits; at the end both try again and collide. For A this is the first collision of a new frame, for B the second collision of its frame, and the question asks for the probability that A wins this second race. The trap is giving both stations the same range.

**Check.** A draws from $\{0, 1\}$ and B from $\{0, 1, 2, 3\}$. A wins on $K_A = 0, K_B \in \{1, 2, 3\}$ and on $K_A = 1, K_B \in \{2, 3\}$: 5 of 8 pairs, probability $0.625$, confirmed by enumeration. Two stations after their first collision avoid a repeat with probability $1/2$; after the third, the expected backoff is $3.5$ slots.

## Token ring efficiency with early and delayed release
<!-- topics: cn-data-link-layer.token-passing -->

**Claim.** Let $N$ stations on a ring each have a frame ready whenever the token arrives (heavy load), let each send one frame of transmission time $T_t$ per token visit, and let $a$ be the ring latency (time for a bit to go once round the ring) divided by $T_t$, with stations equally spaced so passing the token to the next station takes $aT_t/N$. Then

$$\eta_{\text{early}} = \frac{1}{1 + a/N}, \qquad \eta_{\text{delayed}} = \frac{1}{1 + a(N+1)/N},$$

where early release passes the token as soon as the station finishes transmitting and delayed release passes it only after the station's whole frame has come back round the ring.

**Derivation.** Look at one station's turn, which repeats identically under heavy load. Early release: the station transmits for $T_t$, then sends the token, which reaches the next station after $aT_t/N$. A turn lasts $T_t(1 + a/N)$ and carries $T_t$ of data, giving $\eta_{\text{early}}$. Delayed release: after the station's last bit leaves at $T_t$, that bit needs the full ring latency $aT_t$ to come back, and only then is the token passed, taking $aT_t/N$ more. The turn lasts $T_t(1 + a + a/N) = T_t(1 + a(N + 1)/N)$, giving $\eta_{\text{delayed}}$. Early release thus matters most when $a$ is large, since the delayed scheme idles the ring for a whole rotation per frame. There are no collisions, and a station waits at most one rotation of the token, $N$ turns, before its own turn, which is the bounded access delay of token passing.

**GATE use.** NATs give ring length, signal speed, rate, frame size and $N$; compute the ring latency in seconds, divide by $T_t$ to get $a$, then apply the formula for the stated release rule. The traps are mixing the two rules and computing $a$ from the distance between neighbours rather than the whole ring.

**Check.** $N = 10$ and $a = 2$ give $\eta_{\text{early}} = 1/1.2 = 5/6 \approx 0.833$ and $\eta_{\text{delayed}} = 1/3.2 = 0.3125$; $N = 5$, $a = 4$ give $5/9$ and $5/29$. A script summed 50 rotations of turn lengths for each case and matched these exact fractions.

## Learning bridges forward without loops only on a tree
<!-- topics: cn-data-link-layer.learning-bridges -->

**Claim.** A learning bridge records, for every frame, the source address against the port it arrived on; it forwards a frame to a known destination only on that port (dropping it if that is the arrival port), and floods frames to unknown or broadcast destinations on every port but the arrival one. If the active bridge topology is a tree, every frame reaches its destination and each LAN segment carries a flooded frame at most once. If the topology contains a cycle, a broadcast frame circulates for ever. The Spanning Tree Protocol removes the cycles by blocking ports.

**Proof.** Model LAN segments and bridges as the nodes of a bipartite graph, with an edge for each bridge port. On a tree there is exactly one path between any two segments. A flooded frame leaves each bridge on every port except the one it came in on, so it moves away from the source along every branch and never returns to a node it has visited: returning would need a second path, that is, a cycle. So each segment sees it once. A table entry for address $X$ on port $q$ is correct because $X$'s frames arrived through $q$, and on a tree the unique path back to $X$ goes through $q$; forwarding on $q$ alone therefore stays on the path to $X$. On a cycle, a broadcast flooded by one bridge reaches the next bridge on the cycle, which floods it onwards, and so on round the cycle back to the first bridge, which floods it again: nothing in the frame changes and bridges keep no record of frames already forwarded, so it never stops. Every graph that is connected has a spanning tree, so blocking the ports of the edges outside one tree keeps all segments reachable and removes all cycles; STP picks the tree of shortest paths to an elected root bridge.

**GATE use.** Questions trace frames through a small switched network: say which ports a frame goes out on and what the tables hold afterwards. The traps are forwarding a known destination on every port, flooding back out of the arrival port, and forgetting that the table learns from source addresses only.

**Check.** Two bridges B1 and B2 both connecting segments S1 and S2 form a cycle: a broadcast from S1 is forwarded to S2 by both, each copy is forwarded back to S1 by the other bridge, and the copies circulate; blocking one port of B2 leaves the tree S1 – B1 – S2, where the broadcast crosses S2 once and stops.
