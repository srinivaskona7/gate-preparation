# Transport layer: derivations

## Demultiplexing: TCP by the 4-tuple, UDP by the local address
<!-- topics: cn-transport-layer.transport-services, cn-transport-layer.socket-semantics -->

**Claim.** A host's transport layer must hand every arriving segment to exactly one socket. A UDP socket is bound to a local pair (IP, port), and a datagram is delivered by its (destination IP, destination port) alone. A TCP connection socket is named by the 4-tuple (source IP, source port, destination IP, destination port), read from the receiver's side, and a segment goes to the connection socket with the matching 4-tuple; a listening socket, keyed by its local pair only, receives the SYNs that match no connection. Consequences:

1. Any number of TCP connections can share one server port, as long as their (client IP, client port) pairs differ. One client IP can hold at most $65535 - 49152 + 1 = 16384$ simultaneous connections to one server (IP, port) when its source ports come from the ephemeral range.
2. Two UDP datagrams to the same (IP, port) reach the same socket whatever their sources, so a UDP server tells its peers apart only by the address that `recvfrom()` returns with each datagram.
3. A TCP server process holds $S = L + C$ sockets: $L$ listening sockets, one per (IP, port) it listens on, and one connection socket for each of its $C$ live connections. A UDP server needs one socket per bound pair, whatever the number of clients.

**Proof.** Delivery is a function from segments to sockets, and it is well defined only if no two live sockets accept the same key. For UDP the key is the local pair, and `bind()` refuses a pair that is already bound, so each key names one socket. For TCP, the server's `accept()` creates a new socket for each completed handshake and records the full 4-tuple; two live connections to the same server pair differ in at least one of the two client fields, because the client's operating system never gives two of its live connections to the same peer the same source port. So the map from 4-tuples to connection sockets is injective, and the listening socket, which matches only on the local pair, is consulted only when no 4-tuple matches. For part 1, fix the client IP, the server IP and the server port: the 4-tuple then varies only in the client port, so the number of distinct live connections is at most the number of client ports available, 16384 in the dynamic range 49152–65535. For part 2, the UDP key contains no source fields, so the source cannot influence the choice of socket. For part 3, the listening socket is never consumed by `accept()`, which instead creates a fresh socket per completed handshake; each such socket lives until it is closed, and a connection's two-way closure ends it. Since the 4-tuple map is injective, live connections and connection sockets correspond one to one, giving $C$ sockets beside the $L$ listening ones. By part 2 a UDP socket already receives from every source, so extra clients need no extra sockets.

**GATE use.** MCQs ask what identifies a TCP connection (the 4-tuple, never the destination port alone, and never the sequence number) and how two clients on port 80 are kept apart. The trap is answering with the UDP rule, destination IP and port, for a TCP question. Port-range questions: 0–1023 well-known, 1024–49151 registered, 49152–65535 dynamic. Counting questions: clients opening 3, 3, 1, 1 and 1 connections, with 2 closed, leave $7 + 1 = 8$ sockets at the server; the trap is forgetting the listening socket.

**Check.** A Python script on the loopback interface opened a listening socket and connected two clients. `accept()` returned two different socket objects whose local address was the listening socket's (127.0.0.1, 55466) and whose peers were (127.0.0.1, 55467) and (127.0.0.1, 55468): one server port, two 4-tuples. A UDP socket received a datagram through `recvfrom()`, which returned the sender's address with the data. A second script (`/tmp/fix-cn-transport-layer/sockets.py`) accepted 9 connections from clients opening 3, 3, 1, 1 and 1, closed 2, and counted $1 + 7 = 8$ open server sockets with 7 distinct 4-tuples on one local port; one UDP socket received from 9 distinct peers; after `shutdown(SHUT_WR)` the server's `recv()` returned empty (FIN seen) and its later `sendall()` still reached the client. The ephemeral range holds $65535 - 49152 + 1 = 16384$ ports.

## Socket call order and stream semantics
<!-- topics: cn-transport-layer.socket-api, cn-transport-layer.socket-semantics -->

**Claim.** A TCP server must call `socket()`, `bind()`, `listen()` and `accept()` in that order before it can exchange data; a TCP client needs only `socket()` and `connect()`. `connect()` is the call that sends the SYN, `listen()` never blocks, and `accept()` blocks until a completed connection is queued. A UDP socket has no `listen()` or `accept()`. On a TCP socket `recv()` returning 0 means the peer's FIN has arrived, and message boundaries are not preserved: two `send()` calls may come out of one `recv()`, and one `send()` may need several.

**Proof.** Each call has a precondition set up by the one before it. `bind()` needs a socket descriptor, which only `socket()` creates. `listen()` turns a socket into a passive one that accepts SYNs; a SYN is addressed to a port, so the socket must own a port first, which is what `bind()` gives it (a server that skipped `bind()` would listen on a port its clients cannot know). `accept()` removes a connection from the queue that `listen()` created; without that queue there is nothing to remove, which is why `accept()` on an unlistened socket fails. `listen()` only sets a flag and a queue length (the backlog), so it has nothing to wait for and returns at once; the kernel completes handshakes into the queue on its own, and `accept()` blocks only while the queue is empty. The client can skip `bind()` because `connect()` picks an ephemeral source port when none is bound. `connect()` cannot return success before the handshake, since success means the connection exists. UDP has no connections, so there is no queue of completed connections for `listen()` and `accept()` to manage. Finally, TCP numbers bytes, not messages (next section), so the receiver's buffer holds a byte sequence with no record of where one `send()` ended; `recv()` returns whatever contiguous bytes are buffered, up to the size asked for. After the peer's FIN no more bytes can arrive, and returning 0 bytes is how the API reports the end of the stream.

**GATE use.** One-mark MCQs on the server order (socket, bind, listen, accept), on which call blocks (accept, and connect in blocking mode, never listen), and on which call starts the handshake (connect). The traps are swapping `listen` and `accept`, and giving a UDP server an `accept()`.

**Check.** The loopback script showed each claim. `accept()` on a bound but unlistened TCP socket failed with `EINVAL`; `listen()` on a UDP socket failed with "Operation not supported on socket"; two `sendall()` calls of `abc` and `def` came out of a single `recv(100)` as `abcdef`; and after the client closed, `recv()` returned an empty byte string.

## Byte numbering: next sequence number and the cumulative ACK
<!-- topics: cn-transport-layer.seq-ack, cn-transport-layer.handshake -->

**Claim.** Number the bytes of one direction of a connection consecutively from the initial sequence number ISN $x$, and treat the SYN as occupying number $x$ and the FIN as occupying the number after the last data byte. Then:

1. A segment with sequence number seq and $\text{len}$ data bytes is followed by a segment numbered $\text{seq} + \text{len}$, plus 1 if it carries SYN or FIN. A segment with no data, SYN or FIN occupies no number.
2. The acknowledgment number is the least number not yet received in order, which equals the highest number received in order plus 1. It is cumulative: bytes past a gap do not move it.
3. In the three-way handshake with client ISN $x$ and server ISN $y$, the segments are SYN (seq $x$), SYN+ACK (seq $y$, ack $x+1$) and ACK (seq $x+1$, ack $y+1$), and the first data byte from each side is numbered ISN + 1.

**Proof.** (1) The sequence number of a segment is the number of the first item it carries. Its items occupy the numbers $\text{seq}, \dots, \text{seq} + \text{len} - 1$ (and one more for a SYN or FIN), so the first unused number is $\text{seq} + \text{len}$ (+1). A segment carrying none of these items occupies an empty range, and the next segment reuses its number.

(2) Let $R$ be the set of numbers received. The receiver reports $a = \min\{n \ge x : n \notin R\}$. By the choice of $a$, every number in $[x, a-1]$ is in $R$, so $a - 1$ is the end of the in-order prefix, and $a$ itself is missing, so $a$ is the next number the receiver needs. A segment that arrives beyond the gap at $a$ adds numbers larger than $a$ to $R$ but leaves $a \notin R$, so $a$ does not change; the receiver repeats it, which is the duplicate ACK of the reliability section. Reading "ack $n$" as "bytes through $n$ received" is off by one.

(3) The SYN occupies $x$, so by (1) the client's next number is $x+1$, and by (2) the server, having received $x$, acknowledges $x + 1$. The same holds for the server's SYN at $y$. The third segment carries no SYN; if it carries no data it occupies no number, so the client's first data byte is still $x + 1$, whether that byte rides in the third segment or later. Two SYN-bearing segments exist because each direction must announce its own ISN and have it acknowledged; the server's ACK of $x$ and its own SYN share one segment, which is why there are three segments, not four. A random ISN makes it unlikely that a delayed segment of an earlier connection on the same port pair falls inside the new connection's window and is accepted.

**GATE use.** Trace questions give an ISN and a list of segment lengths and ask for a later seq or ack; add lengths, add 1 for each SYN and FIN, and never add 1 for a pure ACK. The cumulative-ACK question loses one segment and asks what the receiver acknowledges: the first byte of the lost segment. The traps are reporting the last byte received (1799 for 1800), and starting data at the ISN instead of ISN + 1.

**Check.** Segments seq 1000 (500 bytes) and seq 1500 (300 bytes) with the first lost: the receiver holds 1500–1799 and acknowledges 1000; once 1000–1499 arrive the ACK jumps to 1800. Client ISN 4000, server ISN 9000: the third segment has seq 4001 and ack 9001. If the client then sends 300 bytes from 4001, its FIN has seq 4301 and is acknowledged with 4302. A script drew 2,000 random segment trains with random losses and confirmed that the least missing number always equals the end of the in-order prefix plus 1.

## Header lengths: TCP data offset, options and the UDP length field
<!-- topics: cn-transport-layer.tcp-header, cn-transport-layer.udp -->

**Claim.** The TCP header length field HLEN is 4 bits and counts 32-bit words, so the header is $H = 4 \cdot \text{HLEN}$ bytes with $5 \le \text{HLEN} \le 15$: 20 to 60 bytes, of which $4 \cdot \text{HLEN} - 20$, at most 40, are options. The UDP header is a fixed 8 bytes and its length field counts header plus data: $\text{Length} = 8 + \text{data bytes}$. The 16-bit TCP window field can state at most $2^{16} - 1 = 65535$ bytes unless window scaling is negotiated.

**Derivation.** The fixed part of the TCP header is source and destination port ($16 + 16$ bits), sequence number (32), acknowledgment number (32), one 32-bit word holding HLEN (4), reserved bits and the flags with the window field (16), and finally checksum (16) with urgent pointer (16): $32 \cdot 5 = 160$ bits, or 20 bytes, so HLEN is at least 5. A 4-bit field holds at most $2^4 - 1 = 15$, so $H \le 60$, and options take $H - 20 \le 40$ bytes. Counting in words rather than bytes is what lets 4 bits reach 60; it also forces options to be padded to a multiple of 4 bytes. UDP has four 16-bit fields, $4 \cdot 2 = 8$ bytes, and a datagram carrying $d$ data bytes therefore has length $8 + d$. A 16-bit unsigned field ranges over $0, \dots, 2^{16} - 1$.

**GATE use.** "The header length field is 1000 in binary; how many option bytes?" Read it as 8 words, 32 bytes, 12 bytes of options. "A UDP datagram carries 100 data bytes; what is its length field?" 108. The traps are reading HLEN as bytes, reporting the whole header as the options, and giving UDP a 20-byte header.

**Check.** HLEN $= 1000_2 = 8$ gives 32 header bytes and 12 option bytes; HLEN $= 15$ gives 60 and 40. A 100-byte UDP payload gives length 108. A script recomputed these, and the largest UDP payload in one IPv4 datagram, $65535 - 20 - 8 = 65507$ bytes.

## Termination: the four segments and why TIME_WAIT lasts 2 MSL
<!-- topics: cn-transport-layer.termination, cn-transport-layer.handshake -->

**Claim.** Closing a connection takes FIN, ACK, FIN, ACK, one FIN and one ACK per direction (three segments when the passive side puts its FIN on its ACK). The side that sends the first FIN, the active closer, passes FIN_WAIT_1, FIN_WAIT_2 and TIME_WAIT; the passive closer passes CLOSE_WAIT and LAST_ACK. Assume every segment either reaches its destination within the maximum segment lifetime MSL or is discarded, and that the passive closer retransmits an unacknowledged FIN within time $r \le$ MSL. Then a TIME_WAIT of 2 MSL, restarted whenever the active closer re-acknowledges a repeated FIN, guarantees that (a) a lost final ACK is repaired, and (b) when the port pair is released no segment of the old connection is still in the network.

**Proof.** Each direction of a TCP connection is a separate byte stream, and a FIN ends one stream. A FIN occupies a sequence number, so it must be acknowledged like data; two FINs and two ACKs follow. The passive side may keep sending data once it has received the first FIN (half-close); acknowledging that FIN is not a precondition, but the ACK is due at once while its own data may run on, which is why its FIN usually travels separately. The state names record which of these four events a side has seen: the active closer has sent FIN (FIN_WAIT_1), had it acknowledged (FIN_WAIT_2), then received and acknowledged the peer's FIN (TIME_WAIT); the passive closer has received the FIN (CLOSE_WAIT), sent its own (LAST_ACK) and closes when that is acknowledged.

Let the active closer receive the last FIN and send the final ACK at time $t$. The passive closer sent that FIN at some $s \le t$.

(a) If the ACK is lost, the passive closer resends the FIN by $s + r \le t + \text{MSL}$, and it arrives by $t + \text{MSL} + \text{MSL} = t + 2\,\text{MSL}$. So the active closer is still in TIME_WAIT to answer it; it resends the ACK and restarts the 2 MSL timer, and the same argument applies to the new ACK. Without TIME_WAIT the repeated FIN would meet a closed port and draw an RST, and the passive closer would report an error for a connection that closed normally.

(b) Suppose the last ACK arrives at $t + d$ with $d \le$ MSL. The passive closer sends nothing after that, so its last segment left before $t + \text{MSL}$ and is gone by $t + 2\,\text{MSL}$. The active closer sent nothing after $t$, so its segments are gone by $t + \text{MSL}$. Every segment of the old connection has therefore expired when TIME_WAIT ends, and a new connection on the same 4-tuple cannot receive one of them. Only the active closer needs the wait, because only it sends a segment, the final ACK, that is not itself acknowledged.

**GATE use.** MCQs on which side enters TIME_WAIT (the active closer, whichever side that is, not the server by default), on its length (2 MSL, not 1 MSL) and on the state sequence of each side. The trap is giving CLOSE_WAIT and LAST_ACK to the side that sent the first FIN.

**Check.** A script with MSL $= 1$ drew 200,000 random cases of FIN delay, retransmission time $r \le 1$ and second delay: every retransmitted FIN arrived within $1.96 < 2$ after the final ACK. In 200,000 cases with the final ACK delivered, the passive closer's last retransmission always died by $t + 1.999 \le t + 2$.

## Fast retransmit: counting duplicate ACKs
<!-- topics: cn-transport-layer.reliability, cn-transport-layer.seq-ack -->

**Claim.** A sender transmits segments $1, \dots, n$ of a window, the receiver acknowledges every arriving segment and buffers out-of-order ones, and only segment $k$ is lost. Then the receiver sends $n - k$ duplicate ACKs, each carrying the first byte of segment $k$, so fast retransmit (resend on the third duplicate ACK) fires if and only if $n - k \ge 3$; otherwise the sender waits for the RTO. After segment $k$ is resent and arrives, a single ACK covers all $n$ segments.

**Proof.** Segments $1, \dots, k-1$ arrive in order, and by the cumulative rule of the byte-numbering section the ACK after segment $k - 1$ names the first byte of segment $k$; that is the first ACK with this number, not a duplicate (for $k = 1$ the same number was already acknowledged before the window, so the count is the same). Each of segments $k+1, \dots, n$ arrives with the gap at segment $k$ still open, so by the same rule each draws an ACK with the same number: $n - k$ duplicates. The sender counts duplicates and resends at the third, which exists exactly when $n - k \ge 3$. The retransmitted segment $k$ fills the gap; segments $k+1, \dots, n$ are in the buffer, so the in-order prefix now ends at segment $n$, and the next ACK names the byte after it. This is the hybrid the chapter names: ACKs are cumulative as in go-back-N, yet only the lost segment is resent, as in selective repeat. SACK blocks would report segments $k+1, \dots, n$ explicitly, which matters when more than one segment of a window is lost, because a cumulative ACK can reveal only the first gap per round trip.

**GATE use.** Questions give a window, mark one segment lost and ask how many duplicate ACKs arrive, whether fast retransmit happens, or what ACK follows the retransmission. The traps are counting the first ACK of the missing number as a duplicate, which makes $n - k + 1$, and assuming the receiver discards out-of-order data, which turns the last answer into go-back-N.

**Check.** A simulator with $n = 8$ and segment 3 lost produced ACKs 2, 3, 3, 3, 3, 3, 3 (in segment units): 5 duplicates, so fast retransmit fires. With $n = 5$ it produced 2 duplicates (wait for the RTO); with $n = 6$, exactly 3; with segment 1 of 4 lost, 3.

## RTT estimation: the weights of past samples and the RTO
<!-- topics: cn-transport-layer.rtt-estimation -->

**Claim.** With $E_0$ the initial estimate and samples $S_1, S_2, \dots$, the update $E_n = (1-\alpha)E_{n-1} + \alpha S_n$ gives

$$E_n = \sum_{j=1}^{n} \alpha (1-\alpha)^{\,n-j} S_j + (1-\alpha)^n E_0 ,$$

so a sample $m$ steps old carries weight $\alpha(1-\alpha)^m$ and the weights sum to 1; with $\alpha = 1/8$ a sample's weight halves about every 5.2 samples. The deviation $D_n = (1-\beta)D_{n-1} + \beta\,\lvert S_n - E\rvert$ is the same average applied to the absolute errors, and $\text{RTO} = E + 4D$. Kurose and Ross take $E = E_n$, the new estimate, in the deviation update; RFC 6298 takes $E = E_{n-1}$ and updates the deviation first. After $k$ consecutive timeouts with exponential backoff the timer stands at $2^k \cdot \text{RTO}$, and the total time spent waiting is $(2^k - 1)\,\text{RTO}$.

**Derivation.** Induction on $n$. For $n = 1$ the formula is the update itself. If it holds for $E_{n-1}$, multiplying it by $1 - \alpha$ raises every power of $1 - \alpha$ by one, and adding $\alpha S_n$ supplies the $j = n$ term, which is the formula for $n$. The weights on the samples form the geometric series $\alpha \sum_{m=0}^{n-1}(1-\alpha)^m = 1 - (1-\alpha)^n$, and the weight of $E_0$ makes the total 1. The weight of a sample falls by the factor $1 - \alpha = 7/8$ per step, and $(7/8)^m = 1/2$ at $m = \ln 2 / \ln(8/7) \approx 5.19$. The same algebra with $\beta$ applies to $D$ because its update has the same shape, with $\lvert S_n - E\rvert$ in place of $S_n$; the two conventions differ only in which estimate the error is measured against. $E$ follows the mean, and adding four times the mean deviation sets the timer far enough above the mean that a delayed but not lost segment rarely triggers a resend. Each timeout doubles the timer, so the timeouts last $\text{RTO}, 2\,\text{RTO}, \dots, 2^{k-1}\text{RTO}$, which sum to $(2^k - 1)\,\text{RTO}$. Karn's rule takes no sample from a retransmitted segment: its ACK may answer either transmission, and pairing it with the wrong one gives a sample that is too long or too short. The backed-off timer stays in force until a segment sent only once is acknowledged.

**GATE use.** Two-mark NATs give $E$, $D$, $\alpha$, $\beta$ and one or more samples and ask for the new RTO. Apply the order the question states. The traps are giving the sample the weight $1 - \alpha$ and taking the deviation against the wrong estimate.

**Check.** $E = 100$, $D = 10$, $S = 120$, $\alpha = 0.125$, $\beta = 0.25$: $E' = 87.5 + 15 = 102.5$. Against the new estimate, $D' = 7.5 + 0.25 \cdot 17.5 = 11.875$ and $\text{RTO} = 102.5 + 47.5 = 150$ ms. Against the old one (RFC order), $D' = 7.5 + 0.25 \cdot 20 = 12.5$ and $\text{RTO} = 152.5$ ms. A script compared the recurrence with the closed form in exact fractions over 20 random samples and found them equal; a sample 8 steps old has weight $0.125 \cdot 0.875^8 \approx 0.043$. Four timeouts with $\text{RTO} = 1$ s wait $1 + 2 + 4 + 8 = 15 = 2^4 - 1$ seconds.

## Flow control and the window-scale shift
<!-- topics: cn-transport-layer.flow-control, cn-transport-layer.tcp-header -->

**Claim.** Let the receiver have a buffer of $B_r$ bytes, with LastByteRcvd and LastByteRead its counters, and let it advertise $\text{rwnd} = B_r - (\text{LastByteRcvd} - \text{LastByteRead})$. If the sender keeps $\text{LastByteSent} - \text{LastByteAcked} \le \min(\text{cwnd}, \text{rwnd})$, using the latest advertised rwnd, the receiver's buffer never overflows. Without scaling the largest window is 65535 bytes; with shift $s$, $W_{\max} = 65535 \cdot 2^s$ with $0 \le s \le 14$, and the least shift whose window covers a bandwidth-delay product BDP is $s = \lceil \log_2(\text{BDP}/65535) \rceil$ (or 0 when $\text{BDP} \le 65535$).

**Proof.** Take bytes arriving in order. Bytes that the receiver holds but the application has not read occupy $\text{LastByteRcvd} - \text{LastByteRead}$ of the buffer, so rwnd is the free space at the moment of the advertisement. The segment carrying that rwnd also acknowledges LastByteRcvd, so when the sender reads it, LastByteAcked equals the receiver's LastByteRcvd at that moment. Every byte the sender may then send or have in flight lies in $(\text{LastByteAcked}, \text{LastByteSent}]$, an interval of at most rwnd bytes, so at most rwnd bytes can arrive on top of what was buffered, and they fit in the free space. Between advertisements the application only reads, which frees space, so the bound holds until the next advertisement replaces it. The sender also obeys cwnd, the congestion limit, and obeying two upper bounds at once means obeying their minimum.

If rwnd reaches 0 the sender stops. The window update that reopens it is a segment carrying no data, and such a segment is not acknowledged, so if it is lost the receiver waits for data and the sender waits for a window, forever. The persist timer breaks the deadlock: while the window is zero the sender periodically sends a one-byte probe, which must be acknowledged, and the ACK carries the current rwnd.

The scaled window is the 16-bit value shifted left by $s$, so its largest value is $65535 \cdot 2^s$. It covers BDP when $2^s \ge \text{BDP}/65535$, that is $s \ge \log_2(\text{BDP}/65535)$, and the least integer is the ceiling. RFC 7323 caps $s$ at 14, which keeps the window, about $65535 \cdot 2^{14} \approx 1.07 \times 10^9$ bytes, below $2^{30}$ and hence less than half of the $2^{32}$ sequence space, so the receiver can still tell old segments from new ones.

**GATE use.** MSQs on which limit lives where (rwnd in the header, cwnd in no header), on $\min(\text{cwnd}, \text{rwnd})$ and on window probes. NATs ask for the shift that fills a link. The traps are using a one-way delay for RTT and comparing bits with bytes.

**Check.** 100 Mbps and RTT 80 ms: $\text{BDP} = 10^8 \cdot 0.08 / 8 = 10^6$ bytes. $s = 3$ gives 524 280 bytes, too small, and $s = 4$ gives 1 048 560, so $s = \lceil \log_2(10^6/65535) \rceil = \lceil 3.93 \rceil = 4$. The largest scaled window is $65535 \cdot 2^{14} = 1\,073\,725\,440$ bytes. A script recomputed all three.

## Slow start and congestion avoidance
<!-- topics: cn-transport-layer.slow-start-ca -->

**Claim.** Measure cwnd in MSS and assume one ACK per segment and no loss. In slow start cwnd grows by 1 per ACK, which doubles it each RTT; in congestion avoidance it grows by $1/\text{cwnd}$ per ACK, about 1 per RTT. Under the GATE convention that slow start never overshoots ssthresh (the step that would cross it sets $\text{cwnd} = \text{ssthresh}$), starting from 1 MSS:

$$\text{cwnd}_n = 2^n \ (\text{while } 2^n \le \text{ssthresh}), \qquad T(w) = \begin{cases} \lceil \log_2 w \rceil, & w \le \text{ssthresh}, \\ \lceil \log_2 \text{ssthresh} \rceil + (w - \text{ssthresh}), & w > \text{ssthresh}, \end{cases}$$

where $T(w)$ is the number of RTTs until cwnd first reaches $w$ (ssthresh an integer).

**Derivation.** In one RTT the sender transmits a full window of $c$ segments and, without loss, receives $c$ ACKs within the next RTT. In slow start each ACK adds 1, so the next window is $c + c = 2c$, and induction from $\text{cwnd}_0 = 1$ gives $2^n$. In congestion avoidance each of the $c$ ACKs adds $1/\text{cwnd}$; as cwnd grows only slightly during the round, the $c$ increments add up to a little less than 1, which is the additive increase. In GATE rounds the window goes to $\min(2c, \text{ssthresh})$ below ssthresh and to $c + 1$ at or above it. For $w \le \text{ssthresh}$, cwnd after $n$ rounds is $\min(2^n, \text{ssthresh}) \ge w$ exactly when $2^n \ge w$, so the first such $n$ is $\lceil \log_2 w \rceil$. For $w > \text{ssthresh}$ the window first reaches ssthresh after $\lceil \log_2 \text{ssthresh} \rceil$ rounds and then gains exactly 1 per round, so $w - \text{ssthresh}$ more rounds are needed.

**GATE use.** Tabulate cwnd round by round; every window question rests on it. The traps are doubling past ssthresh (8 to 16 with ssthresh 12), counting the initial window as round 1 in one place and as round 0 in another, and growing by KB when the unit is MSS.

**Check.** ssthresh $= 12$: 1, 2, 4, 8, 12, 13, 14, 15. A script confirmed $T(w) = \lceil \log_2 w \rceil$ for every $w \le S$ and every $S < 300$. Per-ACK increments starting from 1 gave 32 after 5 rounds; per-ACK $1/\text{cwnd}$ increments from 10 gave 10.96, 11.84, 12.74 over three rounds, a little under 1 per round.

## Reaction to loss: Tahoe, Reno and the time to regain a window
<!-- topics: cn-transport-layer.loss-reaction, cn-transport-layer.slow-start-ca -->

**Claim.** At a loss with window $c$, every variant sets $\text{ssthresh} = c/2$. On a timeout, and in Tahoe also on a triple duplicate ACK, cwnd becomes 1 and slow start resumes; in Reno, on a triple duplicate ACK, cwnd becomes ssthresh and congestion avoidance continues. Consequently, after a timeout at an even window $W$ with no further loss, cwnd first reaches $W$ again after

$$\left\lceil \log_2 \tfrac{W}{2} \right\rceil + \tfrac{W}{2} \ \text{RTTs},$$

while after a Reno triple duplicate ACK it takes $W/2$ RTTs.

**Derivation.** A timeout means no ACKs are flowing, a strong sign of congestion, so the sender starts over from one segment; three duplicate ACKs mean later segments are still getting through, so Reno only halves its rate. Both set ssthresh to half the window at which loss occurred, the multiplicative decrease. After a timeout, apply $T(w)$ of the previous section with $\text{ssthresh} = W/2$ and $w = W > W/2$: $\lceil \log_2 (W/2) \rceil + (W - W/2)$. In Reno the window restarts at $W/2$ in congestion avoidance and gains 1 per RTT, so it needs $W - W/2 = W/2$ RTTs. NewReno differs from Reno only when several segments of one window are lost: it stays in fast recovery until all segments outstanding at the loss are acknowledged, so the window is halved once rather than once per loss.

**GATE use.** The 2-mark NAT gives an initial ssthresh, a loss round and a variant, and asks for cwnd in a later round or for the time to regain a window. Read the variant: Reno on a triple duplicate ACK resumes at ssthresh, every variant on a timeout resumes at 1. Multiply RTTs by the RTT only when time is asked.

**Check.** Reno with ssthresh 16 and three duplicate ACKs in round 9: rounds 1–9 are 1, 2, 4, 8, 16, 17, 18, 19, 20; ssthresh becomes 10 and rounds 10–14 are 10, 11, 12, 13, 14, so round 14 has 14 MSS. Tahoe gives 1, 2, 4, 8, 10 in the same rounds. A timeout at 24 KB with MSS 1 KB and RTT 50 ms: 1, 2, 4, 8, 12 takes 4 RTTs and 12 to 24 takes 12, so $\lceil \log_2 12 \rceil + 12 = 16$ RTTs, 800 ms. A script compared the closed form with the round-by-round simulation for every even $W$ from 2 to 198.

## Window-limited throughput and the bandwidth-delay product
<!-- topics: cn-transport-layer.throughput, cn-transport-layer.flow-control -->

**Claim.** With window $W = \min(\text{cwnd}, \text{rwnd})$ bytes, round-trip time RTT, link rate $B$, and the segment transmission time neglected, the throughput is

$$\text{Throughput} = \min\left(\frac{W}{\text{RTT}},\, B\right), \qquad \text{BDP} = B \cdot \text{RTT}, \qquad \text{fraction of the link used} = \min\left(1, \frac{W}{B \cdot \text{RTT}}\right).$$

If the time $L/B$ to put a segment of $L$ bits on the link is counted, RTT is replaced by $\text{RTT} + L/B$ in the cycle length.

**Derivation.** The sender may have at most $W$ unacknowledged bytes. Time the cycle from the first bit of a window leaving the sender: the ACK for that first byte returns one RTT later, and no byte beyond the window can be sent before ACKs return. So at most $W$ bytes leave per RTT, which is the rate $W/\text{RTT}$, and when the window is the only limit the steady state reaches it, because each returning ACK releases new bytes at the rate the ACKs arrive. The link cannot carry more than $B$, which gives the minimum. The window needed to keep the link busy for a whole RTT is the number of bytes the link carries in that time, $B \cdot \text{RTT}$; a smaller window keeps the link busy for the fraction $W/(B \cdot \text{RTT})$ of each cycle. When the cycle starts at the first bit and the ACK can return only after the last bit of the segment has been sent, the cycle grows by $L/B$, which is the variant some questions use. This is why the 16-bit window fails on fast links: 65535 bytes per RTT is a fixed rate however fast the link is.

**GATE use.** NATs ask for the throughput of a given window, the window that fills a link, or the fraction of the link used. The traps are bytes against bits (multiply by 8 before quoting bps), KB as 1000 or 1024 (follow the stem), and a one-way delay where RTT is meant.

**Check.** $W = 10$ KB $= 10^4$ bytes and RTT $= 100$ ms: $10^5$ bytes/s, which is 800 kbps. A 65535-byte window over 20 ms: $65535 \cdot 8 / 0.02 = 26.21$ Mbps, which on a 1 Gbps link uses $2.62\%$ of it. A script recomputed all three.

## The Mathis formula for AIMD throughput
<!-- topics: cn-transport-layer.throughput, cn-transport-layer.loss-reaction -->

**Claim.** Model a long Reno flow in congestion avoidance: the window, in segments, grows by 1 per RTT from $W/2$ to $W$, exactly one segment is lost when it reaches $W$, every loss is a triple duplicate ACK, and RTT is constant. If one segment in $1/L$ is lost, then $W = \sqrt{8/(3L)}$ and the average throughput is

$$\text{Throughput} = \frac{3}{4} \cdot \frac{W \cdot \text{MSS}}{\text{RTT}} = \sqrt{\frac{3}{2}} \cdot \frac{\text{MSS}}{\text{RTT}\sqrt{L}} \approx \frac{1.22\,\text{MSS}}{\text{RTT}\sqrt{L}}.$$

**Derivation.** One cycle of the sawtooth runs from window $W/2$ to $W$ in steps of 1 per RTT, so it lasts about $W/2$ RTTs, and the window averages $(W/2 + W)/2 = 3W/4$ over it. The segments sent in one cycle are approximately the area under the sawtooth, $\frac{W}{2} \cdot \frac{3W}{4} = \frac{3W^2}{8}$. One loss per cycle means $L = 8/(3W^2)$, so $W = \sqrt{8/(3L)}$. The throughput is the average window per RTT, $\frac{3W}{4}\cdot\frac{\text{MSS}}{\text{RTT}}$, and substituting $W$ gives $\frac{3}{4}\sqrt{\frac{8}{3}} = \sqrt{\frac{9 \cdot 8}{16 \cdot 3}} = \sqrt{\frac{3}{2}} \approx 1.2247$. This is the model of Mathis, Semke, Mahdavi and Ott (1997), and the derivation in Kurose and Ross. It describes AIMD, the Reno sawtooth; CUBIC grows its window as a cubic function of the time since the last loss and follows a different law. Throughput falls as $1/\sqrt{L}$, so cutting the loss rate by 100 only multiplies throughput by 10.

**GATE use.** Plug-in NATs: given MSS, RTT and $L$, find the throughput, or the loss rate a target throughput needs (invert to $L = (1.22\,\text{MSS} / (\text{RTT} \cdot \text{Throughput}))^2$). The trap is forgetting the square root, and converting bytes to bits only at the end.

**Check.** MSS 1460 bytes, RTT 100 ms, $L = 10^{-4}$: $1.22 \cdot 1460 \cdot 8 / (0.1 \cdot 0.01) \approx 14.25$ Mbps. A script built the exact integer sawtooth $W/2, \dots, W$ and computed packets per cycle and throughput: the constant came out 1.095, 1.168, 1.195 and 1.213 for $W = 8, 20, 40, 100$, rising towards $\sqrt{3/2} = 1.2247$ as the discreteness vanishes; the packets per cycle (165 for $W = 20$) approach $3W^2/8$ (150) in the same way.

## Sequence-number wraparound and the bits a lifetime needs
<!-- topics: cn-transport-layer.seq-wraparound -->

**Claim.** A sender writing $R$ bytes per second through a $k$-bit byte-numbered sequence space reuses a sequence number after $T_{\text{wrap}} = 2^k / R$ seconds; for TCP, $k = 32$ and $T_{\text{wrap}} = 2^{32}/R = 2^{35}/R_{\text{bits}}$ with $R_{\text{bits}}$ in bits per second. Reuse is safe only if $T_{\text{wrap}}$ exceeds the maximum segment lifetime $T_{\text{life}}$, and the least number of sequence bits that makes it safe is $k = \lfloor \log_2 (R \cdot T_{\text{life}}) \rfloor + 1$, the least $k$ with $2^k > R \cdot T_{\text{life}}$.

**Derivation.** Bytes are numbered modulo $2^k$, so byte $i$ and byte $i + 2^k$ carry the same number, and the second is sent $2^k/R$ seconds after the first. If a copy of the first can still be in the network when the second is sent, a receiver expecting the second could accept the old copy as new data, which is undetectable corruption. Copies live at most $T_{\text{life}}$, so the danger is absent exactly when $2^k/R > T_{\text{life}}$, that is $2^k > R \cdot T_{\text{life}}$, the number of bytes sent in one lifetime; the least integer $k$ with $2^k > N$ for $N = R \cdot T_{\text{life}}$ is $\lfloor \log_2 N \rfloor + 1$, because $2^{\lfloor \log_2 N \rfloor} \le N < 2^{\lfloor \log_2 N \rfloor + 1}$. The ceiling $\lceil \log_2 N \rceil$ agrees except when $N$ is an exact power of 2, where it gives $2^k = N$, and equality is not safe. The 32-bit field fixes $k$, so on a fast link TCP instead compares the timestamp option carried by each segment and rejects one whose timestamp is older than the last accepted one (PAWS).

**GATE use.** One-mark NATs ask for the wrap time at a given rate, or whether it beats a given lifetime; two-mark variants ask for the sequence bits a rate and lifetime need. The trap is dividing $2^{32}$ by a bit rate without the factor 8.

**Check.** At $10^9$ bits/s, $2^{35}/10^9 = 34.36$ s, below the 120 s MSL; at 100 Mbps it is 343.6 s, and the rate at which the wrap time equals 120 s is $2^{35}/120 \approx 286.3$ Mbps. At 1 Gbps with a 120 s lifetime, $1.25 \times 10^8 \cdot 120 = 1.5 \times 10^{10}$ bytes, and $\log_2(1.5 \times 10^{10}) \approx 33.8$, so 34 bits would be needed. A script recomputed every value.
