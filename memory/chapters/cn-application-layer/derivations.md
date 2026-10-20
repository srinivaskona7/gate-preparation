# Application layer: derivations

## Delegation decides how many DNS servers a lookup visits
<!-- topics: cn-application-layer.dns-namespace, cn-application-layer.dns-resolution -->

**Claim.** The DNS namespace is a tree of labels rooted at the unnamed root, and a name is read from its rightmost label (nearest the root) to its leftmost. The tree is cut into zones: a zone is a connected piece of the tree served by one set of authoritative servers, and a parent zone delegates a child zone by holding NS records for it. Assume every referral carries the addresses of the servers it names (glue records) and nothing is cached. Then an iterative resolver looking up a name $x$ contacts exactly one server for each zone on the path from the root to the zone that contains $x$, so the number of servers is

$$n = \text{number of zones whose apex is an ancestor of } x \text{ (or } x \text{ itself)},$$

which is the number of zone cuts on that path plus one. It is not the number of labels: for `www.example.com` with zones root, `com` and `example.com`, $n = 3$, because `www` is a host inside the `example.com` zone, not a zone of its own.

**Proof.** Let $Z_0, Z_1, \dots, Z_{n-1}$ be the zones on the path, $Z_0$ the root zone and $Z_{n-1}$ the zone that contains $x$; each $Z_{i+1}$ is delegated by $Z_i$. The resolver starts at a root server, whose address it has from its configuration (the root hints). Invariant: before the $i$-th query the resolver holds the address of a server of $Z_i$. A server of $Z_i$ with $i \lt n-1$ holds no data for $x$, because $x$ lies below the cut to $Z_{i+1}$, so it answers with the NS records of $Z_{i+1}$ and their glue addresses, a referral; the invariant holds for $i + 1$. A server of $Z_{n-1}$ is authoritative for $x$ and returns its records (or a name error). Each referral moves strictly down the path, and the path is finite, so the walk ends after exactly $n$ queries. A server never refers to a zone off the path, since it delegates only its own children and the only child containing $x$ is $Z_{i+1}$. Without glue, a referral to a server whose own name lies outside the zone forces a separate lookup of that name, which is why the claim assumes glue.

**GATE use.** MCQs ask which server a root returns (a referral to the TLD servers, never the final address), which server holds the records (the authoritative one), and how many servers a lookup visits. The trap is counting one server per label: `a.b.c.example.com` costs 3 servers if `example.com` holds all those names, and more only if a subdomain is delegated.

**Check.** With zones root, `com`, `example.com`, `edu`, `uni.edu` and `cs.uni.edu`, a script walked the path for three names: `www.example.com` visits root, `com` and `example.com` (3 servers); `a.cs.uni.edu` visits root, `edu`, `uni.edu` and `cs.uni.edu` (4); `b.uni.edu` visits root, `edu` and `uni.edu` (3), although it has the same number of labels as `www.example.com`.

## Recursive and iterative lookups exchange the same number of messages
<!-- topics: cn-application-layer.dns-resolution, cn-application-layer.dns-latency -->

**Claim.** Let the host send a query to its local resolver, and let $n$ servers (root, TLD, authoritative, or the ones left after caching) still have to be asked; no message is lost. Then the lookup exchanges

$$N = 2(n + 1)$$

DNS messages, whether the local resolver asks the $n$ servers iteratively or each server forwards the query recursively to the next. With $n = 3$ that is 8. The two modes differ in who sends the messages and who holds state while waiting, not in the count. If the local resolver has the final answer cached, $N = 2$.

**Proof.** Every query is answered by exactly one reply, so $N$ is twice the number of queries. Iterative: the host sends 1 query to the local resolver, and the resolver sends one query to each of the $n$ servers in turn (previous section), so there are $n + 1$ queries. Recursive chain: the query travels host → local → $s_1$ → $s_2$ → … → $s_n$, one query per arrow, which is again $n + 1$ arrows; the replies retrace the arrows. Both give $2(n+1)$. In the iterative mode the local resolver sends $n$ of the queries and keeps all the waiting state; in the recursive chain the root server would have to send a query to the TLD server and hold state for every lookup in the world, which is why root and TLD servers answer iteratively and the usual pattern is recursive host → local, iterative local → servers. A cached NS record for zone $Z_j$ lets the resolver start at $Z_j$, removing the $j$ servers above it and $2j$ messages.

**GATE use.** The 1-mark NAT "host asks its local server recursively, which asks root, TLD and authoritative iteratively; how many messages?" has answer 8. The traps are counting only the queries (4), forgetting the host-to-local pair (6), and believing that the fully recursive chain needs a different number.

**Check.** For `www.example.com` with an empty cache, $n = 3$ and $N = 8$; with the `com` NS records cached, $n = 2$ and $N = 6$; with the answer itself cached, $N = 2$. For `a.cs.uni.edu`, which crosses four zones, $N = 10$. A script computed both modes for $n = 1, \dots, 5$ and got equal counts each time.

## Resolution delay, TTL, and a lookup followed by a fetch
<!-- topics: cn-application-layer.dns-latency, cn-application-layer.dns-resolution -->

**Claim.** Ignore processing and transmission times. Let $r_0$ be the RTT between the host and its local resolver and let the resolver still have to contact servers $s_1, \dots, s_n$.

1. Iterative: $T_{\text{DNS}} = r_0 + \sum_{i=1}^{n} \mathrm{RTT}(\text{local}, s_i)$.
2. Recursive chain: $T_{\text{DNS}} = r_0 + \mathrm{RTT}(\text{local}, s_1) + \sum_{i=1}^{n-1} \mathrm{RTT}(s_i, s_{i+1})$.
3. A cached record removes its server's term, and a record cached at time $t_c$ with TTL $\tau$ is served from the cache exactly for $t_c \le t \lt t_c + \tau$.
4. When the name must be resolved before one object is fetched over a new TCP connection with RTT $\mathrm{RTT}_0$ to the web server, the time from the click is $T = T_{\text{DNS}} + 2\,\mathrm{RTT}_0$ plus transmission time. Writing $\mathrm{RTT}_1, \dots, \mathrm{RTT}_n$ for every round trip spent on the lookup, this is the chapter's formula

$$T = \sum_{i=1}^{n} \mathrm{RTT}_i + 2\,\mathrm{RTT}_0 .$$

**Derivation.** In the iterative mode the resolver sends query $i + 1$ only after reply $i$ arrives, because the reply is what names $s_{i+1}$. The exchanges are therefore sequential, each costs one round trip between the resolver and that server, and the host waits one more round trip $r_0$ around the whole thing: the host's query reaches the resolver at $r_0/2$ and the answer comes back $r_0/2$ after the last reply. In the recursive chain each server forwards the query to the next one and replies only after its own reply comes back, so the query travels the chain one way and the answer travels it back; each hop contributes its one-way delay twice, which is its RTT. A cache hit means the corresponding exchange never happens, so its term drops out. A cached entry carries the TTL from the record; the resolver serves it until $\tau$ seconds have passed and then discards it, so the next query after expiry pays the full exchange again. Name errors are cached too (negative caching), for the time given in the zone's SOA record. The web fetch cannot start before the address is known, so its time adds to $T_{\text{DNS}}$; the $2\,\mathrm{RTT}_0$ is derived in the section on one object over a new connection.

**GATE use.** Kurose's two-part problem: a link click needs $n$ DNS round trips $\mathrm{RTT}_1, \dots, \mathrm{RTT}_n$, then one object costs $2\,\mathrm{RTT}_0$; a second part adds embedded objects using the page-load formulas below. The traps are charging the DNS cost again for every embedded object on the same server (the address is cached after the first lookup), using resolver-to-server RTTs for a recursive chain, and forgetting the TCP handshake in the fetch.

**Check.** The chapter's NAT: DNS round trips of 10, 20 and 30 ms and $\mathrm{RTT}_0 = 40$ ms give $60 + 80 = 140$ ms. A script resolved `www.example.com` with $r_0 = 4$ ms and resolver RTTs 30, 20 and 10 ms to root, `com` and `example.com`: 64 ms with an empty cache, 34 ms with `com` cached, 4 ms with the answer cached. As a recursive chain with hop RTTs 30 (local to root), 25 (root to `com`) and 15 (`com` to `example.com`) it took 74 ms. A record cached at $t = 100$ s with TTL 300 s is still served at 399 s and refetched at 400 s.

## What each record type maps, and the lookups an indirection costs
<!-- topics: cn-application-layer.dns-records -->

**Claim.** A resource record is a tuple $(\text{name}, \text{value}, \text{type}, \text{TTL})$, and a query asks for the records of one (name, type) pair.

1. Only types A (IPv4) and AAAA (IPv6) have an address as their value. NS, CNAME, MX and PTR have a domain name as their value, so turning one of them into an address costs one more (name, A) or (name, AAAA) lookup unless the reply's additional section already carries it. Reaching a host through a chain of $c$ CNAME records followed by an A record needs $c + 1$ records.
2. The reverse name of the IPv4 address $a.b.c.d$ is $d.c.b.a$`.in-addr.arpa`, and its PTR record names the host. For IPv6 the 32 hexadecimal nibbles are reversed under `ip6.arpa`.

**Derivation.** Part 1 follows from the value types: an MX record answers "which host takes mail for this domain", and the reply is a host name, so the mail sender still needs that host's address; NS records likewise name servers, which is why referrals carry glue. A CNAME says the queried name is an alias; the resolver restarts the query with the canonical name, and each alias in a chain is one more restart, so $c$ aliases give $c$ CNAME records plus the final A record. Since a CNAME replaces the whole name, an alias owns no other records (RFC 1034), so a name that carries MX or NS records cannot also be a CNAME.

For part 2, DNS names put the most general label on the right, while IPv4 addresses put the most general octet on the left: a block such as $192.0.2.0/24$ is a common prefix of its addresses. Reversing the octets turns each address prefix of 8, 16 or 24 bits into a DNS suffix, so the owner of a block can be delegated the matching zone, here `2.0.192.in-addr.arpa`, and reverse lookups use the same hierarchy as forward ones. IPv6 delegates on nibble boundaries, so it reverses nibbles rather than bytes. SOA records carry the zone's primary server, serial number and refresh, retry, expiry and negative-caching timers; TXT records carry free text such as SPF and DKIM policies.

**GATE use.** 1-mark MCQs and MSQs match record types to what they map: alias to canonical name is CNAME, domain to mail server is MX, zone to name server is NS, address to name is PTR. The trap set every time is "MX maps a domain directly to the mail server's IP address": false, the value is a name.

**Check.** A script built the reverse names: $192.0.2.17$ becomes `17.2.0.192.in-addr.arpa`, and `2001:db8::1` becomes a name of 32 single-nibble labels, starting `1.0.0.0` and ending `8.b.d.0.1.0.0.2.ip6.arpa`. Delivering mail to `shop.example` through MX `mx1.shop.example` takes an MX lookup and then an A lookup: 2 records, as the chapter's CNAME and MX question needs.

## Why DNS rides on UDP, and when it switches to TCP
<!-- topics: cn-application-layer.dns-transport, cn-application-layer.ports-remote-login -->

**Claim.** Count only round trips, with no loss. An ordinary DNS exchange over UDP port 53 costs 1 RTT; the same exchange over TCP port 53 costs 2 RTT (a handshake, then the query and reply), so UDP halves the latency of a lookup. A UDP reply that does not fit the classic 512-byte limit comes back with the TC (truncated) bit set, and the resolver repeats the query over TCP, for $1 + 2 = 3$ RTT in all. Zone transfers between primary and secondary servers always use TCP. A 16-bit identifier matches replies to queries, so it takes one of $2^{16} = 65536$ values.

**Derivation.** UDP sends the query at once and the reply comes back one RTT later. TCP must first exchange SYN and SYN-ACK, one RTT, and can then send the query with the final ACK, a second RTT; the connection teardown happens after the answer and is off the critical path. A lookup is one small request and one small reply, so TCP's reliability and ordering buy nothing that a timeout and retransmission by the resolver cannot provide. A zone transfer copies a whole zone, many records in order, and must arrive complete, which is the bulk reliable transfer TCP exists for. The 512-byte limit comes from RFC 1035; extensions (EDNS) allow larger UDP replies, but the TC-then-TCP fallback remains. Because the transport is a datagram, the resolver needs the identifier to pair each reply with its outstanding query; a forger who cannot see the query must guess it, with chance $1/65536$ per forged reply, which is why resolvers also randomise the source port. DHCP also uses UDP (ports 67 and 68), for a different reason: a client that has no IP address yet cannot complete a TCP handshake, so it broadcasts a datagram.

**GATE use.** The GATE 2013 MCQ asks what carries a DNS query: UDP to port 53. MSQs then test the exceptions, zone transfers and oversized replies over TCP 53. The trap is the statement "DNS uses only UDP", which is false.

**Check.** By the counts above a UDP lookup takes 1 RTT, a TCP lookup 2, and a truncated reply retried over TCP 3. A script confirmed the identifier space $2^{16} = 65536$ and checked ports 53 (domain), 67 and 68 (bootps and bootpc) against the system's `/etc/services`.

## One object over a new TCP connection: $2\,\mathrm{RTT} + L/R$
<!-- topics: cn-application-layer.http-timing, cn-application-layer.http-basics -->

**Claim.** A client fetches one object of $L$ bits from a server over a new TCP connection. Assume the one-way delay is $\mathrm{RTT}/2$ in each direction, the SYN, ACK and request segments have negligible transmission time, the server's processing is negligible, the object leaves at rate $R$ without waiting on TCP's congestion window, and the address is already resolved. Then the last bit of the response arrives at

$$T = 2\,\mathrm{RTT} + \frac{L}{R}.$$

**Derivation.** Kurose's timeline: at $t = 0$ the client sends SYN, which reaches the server at $\mathrm{RTT}/2$; the SYN-ACK returns to the client at $\mathrm{RTT}$. The client sends the final ACK with the HTTP request piggybacked in the same segment, so the request reaches the server at $\tfrac{3}{2}\mathrm{RTT}$. The server starts transmitting at once; the last bit leaves at $\tfrac32\mathrm{RTT} + L/R$ and arrives $\mathrm{RTT}/2$ later, at $2\,\mathrm{RTT} + L/R$. The FIN exchange comes after the object and does not delay it. The request is a request line (method, URL, version), header lines such as the mandatory `Host` and an optional body; the response is a status line, headers and the object. HTTP itself adds no round trips beyond this one request-response pair. If $L$ is large compared with the initial window, slow start adds extra RTTs, so the formula assumes either a small object or a window that is never the limit, the standard reading in GATE questions that say "ignore transmission time" or give only $L$ and $R$.

**GATE use.** This is the unit every page-load question is built from: 1 RTT for the connection, 1 RTT for the request and response. The trap is charging 3 RTT by treating the ACK and the request as separate one-way trips, or charging only 1 RTT and forgetting the handshake.

**Check.** RTT 20 ms, a 100 kbit object at 10 Mbps: $L/R = 10$ ms, so $T = 40 + 10 = 50$ ms. The timeline above, coded event by event, reproduced the arrival time.

## Non-persistent HTTP, serial and with $k$ parallel connections
<!-- topics: cn-application-layer.http-timing, cn-application-layer.http-persistence -->

**Claim.** A page is a base file referencing $m$ objects on the same server; transmission times are negligible and the name is resolved. Under non-persistent HTTP every object needs its own TCP connection, $m + 1$ connections in all, and

$$T_{\text{serial}} = (m + 1)\cdot 2\,\mathrm{RTT}, \qquad T_{k} = 2\,\mathrm{RTT} + \left\lceil \frac{m}{k} \right\rceil \cdot 2\,\mathrm{RTT}$$

when at most $k$ connections may be open at once. $T_k$ is the least time any schedule with $k$ connections can achieve.

**Proof.** Under non-persistent HTTP the server closes the connection after one response, so each of the $m + 1$ objects pays the $2\,\mathrm{RTT}$ of the previous section. The base file comes first in every schedule, because the references to the other objects are inside it, so nothing else can be requested before $2\,\mathrm{RTT}$. Serially, the remaining $m$ fetches follow one after another, which gives $(m + 1)\cdot 2\,\mathrm{RTT}$. With $k$ parallel connections, think of $k$ slots, each running one fetch of length $2\,\mathrm{RTT}$ at a time. Lower bound: the $m$ fetches are spread over $k$ slots, so by pigeonhole some slot carries at least $\lceil m/k \rceil$ of them back to back, and that slot is busy for at least $\lceil m/k \rceil \cdot 2\,\mathrm{RTT}$ after the base arrives. Upper bound: opening a new connection in a slot the moment it frees runs the fetches in rounds of $k$, and the last round ends at exactly $\lceil m/k \rceil \cdot 2\,\mathrm{RTT}$. When transmission times are given, parallel connections share the bottleneck link: $k$ concurrent objects each get about $R/k$, so the transmission part of a round is the total bits of that round over $R$, not one object's $L/R$.

**GATE use.** The 2-mark NAT gives $m$, RTT and a mode. The traps are fetching the base file in parallel with the images, writing $\lceil (m+1)/k \rceil$ rounds, and dividing transmission time by $k$ as though each connection had the whole link.

**Check.** RTT 20 ms and $m = 10$: serial $11 \cdot 40 = 440$ ms; $k = 5$ gives $40 + 2 \cdot 40 = 120$ ms (the chapter's question); $k = 3$ gives $40 + 4 \cdot 40 = 200$ ms; $k = 4$ gives 160 ms; $k = 10$ gives 80 ms. A script simulated the greedy slot schedule for every $m \le 29$ and $k \le 7$ and its finishing time always equalled $\lceil m/k \rceil \cdot 2\,\mathrm{RTT}$.

## Persistent HTTP, with and without pipelining
<!-- topics: cn-application-layer.http-timing, cn-application-layer.http-persistence -->

**Claim.** Same page and assumptions, now over one persistent connection that the server keeps open. Without pipelining, and with pipelining (all $m$ requests sent back to back as soon as the base file arrives),

$$T_{\text{persistent}} = 2\,\mathrm{RTT} + m\cdot\mathrm{RTT} = (m + 2)\,\mathrm{RTT}, \qquad T_{\text{pipelined}} = 2\,\mathrm{RTT} + \mathrm{RTT} = 3\,\mathrm{RTT}.$$

With a base file of $L_0$ bits and objects of $L_1, \dots, L_m$ bits on one bottleneck of rate $R$, these become $(m+2)\,\mathrm{RTT} + \sum_{i=0}^{m} L_i/R$ and $3\,\mathrm{RTT} + \sum_{i=0}^{m} L_i/R$. If the objects themselves reference more objects, to a reference depth $d$ below the base file, pipelining costs $(2 + d)\,\mathrm{RTT}$ plus transmission.

**Derivation.** The handshake and the base file cost $2\,\mathrm{RTT} + L_0/R$ as before, and the connection stays open. Without pipelining the client sends the next request only after the previous response has arrived; each request then costs one RTT for the round trip plus that object's transmission time, and there is no new handshake, which gives $(m+2)\,\mathrm{RTT} + \sum L_i/R$. With pipelining the client sends all $m$ requests at time $t_0 = 2\,\mathrm{RTT} + L_0/R$. The first arrives at the server at $t_0 + \mathrm{RTT}/2$ and the rest arrive right behind it, so the server transmits the $m$ responses back to back without idling; HTTP/1.1 requires them in request order. The last bit leaves at $t_0 + \mathrm{RTT}/2 + \sum_{i \ge 1} L_i/R$ and arrives $\mathrm{RTT}/2$ later, which gives $3\,\mathrm{RTT} + \sum_{i \ge 0} L_i/R$. A reference found inside an object can only be requested after that object arrives, so each further level of the reference tree adds one more pipelined round of one RTT. One persistent connection also avoids $m$ extra slow-start ramps, which the RTT counts do not show. The in-order rule is the head-of-line blocking that pipelining suffers: a slow first response holds back every response queued behind it.

**GATE use.** NATs and MSQs compare the modes: for $m = 10$ and RTT 20 ms the times are 440, 240 and 60 ms. MCQs ask how many TCP connections HTTP/1.1 uses by default for a page from one server: 1. The traps are writing $(m+1)\,\mathrm{RTT}$ for persistent (dropping the handshake) and $2\,\mathrm{RTT}$ for pipelined (forgetting that the base file must arrive first).

**Check.** RTT 20 ms and $m = 10$: $12 \cdot 20 = 240$ ms persistent, $3 \cdot 20 = 60$ ms pipelined. With a 50 kbit base file, four 20 kbit images and $R = 10$ kbit/ms, a script that replayed both timelines event by event got $6 \cdot 20 + 13 = 133$ ms persistent and $60 + 13 = 73$ ms pipelined, as the formulas give. A stylesheet that names a font file gives $d = 2$ and $(2 + 2) \cdot 20 = 80$ ms pipelined.

## HTTP/2 multiplexing, and the handshakes HTTPS adds
<!-- topics: cn-application-layer.http2-https, cn-application-layer.http-persistence -->

**Claim.** On one connection, let the server owe $m$ responses whose transmission times are $s_1, \dots, s_m$, all requested at once, and ignore propagation.

1. In-order delivery (HTTP/1.1 pipelining) finishes response $i$ at $C_i = s_1 + \dots + s_i$. Splitting the responses into frames and interleaving them equally (HTTP/2 streams, idealised as processor sharing) finishes the responses in size order, the $i$-th smallest at $C_{(i)} = \sum_{j \lt i} s_{(j)} + (m - i + 1)\, s_{(i)}$. Both finish the last response at $\sum_i s_i$, so multiplexing changes who waits, not the total; it ends HTTP-level head-of-line blocking, but a lost TCP segment still stalls every stream.
2. HTTPS is HTTP over TLS over TCP, port 443. The first response byte arrives after $1 + 2 + 1 = 4$ RTT with a full TLS 1.2 handshake and $1 + 1 + 1 = 3$ RTT with TLS 1.3, against 2 RTT for plain HTTP.

**Proof.** Part 1, in-order: the server sends response 1 in full, then response 2, and so on, so $C_i$ is a prefix sum, and a large $s_1$ delays every other response. Equal interleaving: while $k$ responses are unfinished each progresses at rate $1/k$, so the smallest one, $s_{(1)}$, finishes first, at $m\, s_{(1)}$. At that moment every other response has also received $s_{(1)}$, and the same argument repeats on the remaining $m - 1$ responses with sizes reduced by $s_{(1)}$; by induction the $i$-th completion adds $(m - i + 1)(s_{(i)} - s_{(i-1)})$, which sums to the formula. Both disciplines keep the link busy until all work is sent, so the last completion is $\sum s_i$ in both. HTTP/2 frames carry a stream identifier, so the receiver can reassemble streams in any interleaving; TCP below still delivers bytes in order, so a gap from one lost segment holds back the frames of all streams behind it. HTTP/2 also compresses headers (HPACK) and allows server push.

Part 2: TCP costs 1 RTT. A full TLS 1.2 handshake takes two more: ClientHello out and ServerHello, certificate and ServerHelloDone back, then the client's key exchange and Finished out and the server's Finished back. TLS 1.3 sends the client's key share in the ClientHello, so the server's reply completes the keys and one RTT suffices. The encrypted request and its response add the last RTT. TLS sits between HTTP and TCP and encrypts the HTTP bytes before TCP sees them; it is not a separate application protocol and not a feature of TCP.

**GATE use.** MSQs list HTTP/2 features (binary framing, multiplexed streams on one connection, header compression, server push) against distractors such as "a new TCP connection per request". MCQs ask for the HTTPS stack and port: HTTP over TLS over TCP, 443. The trap is stacking TLS below TCP, or over UDP on port 80.

**Check.** One 10 ms response followed by nine 1 ms responses: in order they finish at 10, 11, …, 19 ms (mean 14.5); equally interleaved the nine small ones finish together at 10 ms and the large one at 19 ms (mean 10.9); the last completion is 19 ms in both. A script checked the closed form and the equal last completion on 500 random size sets.

## Safe and idempotent methods, as functions on server state
<!-- topics: cn-application-layer.http-methods-status, cn-application-layer.http-basics -->

**Claim.** Model the server's resources as a state $S$ and a request as a function $f$ from states to states (the response is ignored). Call $f$ safe when $f(S) = S$ for every $S$, and idempotent when $f(f(S)) = f(S)$ for every $S$. Then every safe method is idempotent; GET, HEAD and OPTIONS are safe; PUT and DELETE are idempotent but not safe; POST and PATCH are in general neither. The status class is read from the first digit: 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error.

**Proof.** If $f$ is the identity then $f(f(S)) = S = f(S)$, so safe implies idempotent. GET, HEAD and OPTIONS only read, so they are the identity on state. PUT$(u, x)$ sets the resource at $u$ to $x$: applying it again sets the same value, so $f(f(S)) = f(S)$, while $f(S) \ne S$ whenever $u$ held something else. DELETE$(u)$ removes $u$; a second DELETE finds nothing to remove and leaves the state the same, even though its response (404 rather than 200) differs, which is why idempotence is defined on state and not on responses. POST$(u, x)$ asks the resource at $u$ to process $x$, typically creating a new subordinate resource, so two POSTs create two resources and $f(f(S)) \ne f(S)$. A PATCH such as "increment the counter" likewise changes the state on each application; some patches happen to be idempotent, but the method promises nothing. The practical reason for the distinction: a client whose response was lost may safely resend an idempotent request, because one copy or two leaves the same state; resending a POST may place an order twice.

**GATE use.** MSQs ask which methods are idempotent: GET, HEAD, OPTIONS, PUT and DELETE, never POST. The trap is equating idempotent with safe, so that PUT and DELETE get excluded because they change state. Status-code MCQs test 200, 301, 302, 304, 400, 403, 404, 500 and 505, and the class of each.

**Check.** A script applied each method once and twice to three sample states and compared the results: GET, HEAD and OPTIONS came out safe and idempotent, PUT and DELETE idempotent and not safe, POST (create the next child of `/a`) and PATCH (increment a counter) neither. That set is the chapter's erratum fix, which adds HEAD and OPTIONS to GET, PUT and DELETE.

## Web caches, conditional GET and cookies on a stateless protocol
<!-- topics: cn-application-layer.http-state-caching, cn-application-layer.http-basics -->

**Claim.** Requests go first to a cache that holds the object with probability $h$. Let a hit take $d_{\text{cache}}$ and a miss take $d_{\text{origin}}$ (the cache's own lookup counted inside it).

1. The mean delay is $D = h\, d_{\text{cache}} + (1 - h)\, d_{\text{origin}}$.
2. If clients request $\lambda$ objects per second of $L$ bits each over an access link of rate $R_a$, the link's traffic intensity falls from $\lambda L/R_a$ to $(1 - h)\lambda L/R_a$, because only misses cross it.
3. A conditional GET with If-Modified-Since costs a round trip to the origin but no body when the reply is 304 Not Modified.
4. Cookies add state above HTTP without making HTTP stateful.

**Derivation.** Part 1 is the law of total expectation over the two cases: $E[D] = P(\text{hit})\,E[D \mid \text{hit}] + P(\text{miss})\,E[D \mid \text{miss}]$. Part 2: hits are answered on the institution's LAN, so the traffic crossing the access link is the miss traffic, $(1-h)\lambda L$ bits per second. Intensity near 1 means the access link's queueing delay grows without bound, so cutting the intensity also cuts $d_{\text{origin}}$, which is the larger effect in Kurose's example. Part 3: the cache stores the object with its Last-Modified date and sends it back in If-Modified-Since; the server compares the dates and either returns 304 with headers only, so the cache serves its copy, or 200 with the new object. Part 4: each HTTP request is complete in itself and the protocol defines no memory of earlier ones. A cookie is an identifier that the server issues with Set-Cookie and the browser returns in a Cookie header; the server looks it up in its own database. The state lives in that database at the application, and the protocol's message exchange is unchanged, so HTTP remains stateless; persistent connections are likewise a transport choice, not protocol state.

**GATE use.** NATs give $h$ and the two delays; MSQs test that 304 carries no body, and that cookies and persistent connections leave HTTP stateless. The trap is weighting the miss delay by $h$ or adding the hit delay to every miss when the question already includes it.

**Check.** Kurose's institution: 15 requests per second of 1 Mbit objects on a 15 Mbps access link gives intensity 1.0; a cache with $h = 0.4$ brings it to 0.6. With a 0.01 s LAN delay and 2.01 s for a miss, $D = 0.4 \cdot 0.01 + 0.6 \cdot 2.01 = 1.21$ s, and a Monte Carlo run of 200,000 requests averaged 1.213 s.

## FTP and email connection counts, and the well-known ports
<!-- topics: cn-application-layer.ftp, cn-application-layer.email, cn-application-layer.ports-remote-login -->

**Claim.**

1. An FTP session in stream mode that transfers $n$ files and $\ell$ directory listings opens $1 + n + \ell$ TCP connections: one persistent control connection to port 21 and one data connection per transfer. In active mode the server opens each data connection from port 20; in passive mode the client opens it to a port the server names.
2. A message from Alice's agent to Bob's agent crosses three TCP connections: two SMTP pushes (agent to Alice's server, Alice's server to Bob's server on port 25) and one pull by Bob's agent (IMAP on 143 or POP3 on 110).
3. The well-known ports are FTP 20 and 21, SSH 22, Telnet 23, SMTP 25 (587 for submission), DNS 53, DHCP 67 (server) and 68 (client), HTTP 80, POP3 110, IMAP 143, BGP 179 and HTTPS 443; DNS lookups and DHCP use UDP (DNS also uses TCP 53 for zone transfers and truncated replies), and the rest use TCP.

**Derivation.** Part 1: in stream mode (RFC 959) a file has no length field, and the sender marks its end by closing the data connection, so a data connection carries exactly one transfer and the next transfer needs a new one. Commands and replies go over the control connection, which stays open for the session and carries its state (logged-in user, current directory); this is FTP's out-of-band control and the reason FTP is stateful while HTTP is not. In active mode the client announces an address and port with PORT and the server connects to it, an inbound connection that NAT and firewalls usually block; with PASV the server announces a port and the client connects outward, which passes them. Part 2: SMTP delivers by connecting to the receiver, so the receiver must be always on and listening, which a mail server is and a user's phone is not. The last hop is therefore a pull, started by Bob's agent when it is online. POP3 normally downloads and deletes, while IMAP keeps mail and folders on the server, so only IMAP keeps several devices in sync. Part 3: these protocols need reliable ordered byte streams and so run over TCP, except DNS (previous section) and DHCP, whose client has no address with which to finish a TCP handshake. Telnet sends everything, passwords included, in plain text; SSH encrypts the session.

**GATE use.** 1-mark MCQs ask for push versus pull (SMTP pushes; POP3 and IMAP pull), the transport triple for DNS, HTTP and SMTP (UDP, TCP, TCP), and port numbers. Email and FTP are outside the 2027 syllabus but appear in older papers. The traps are naming SMTP for reading mail, giving port 20 as FTP's control port, and assuming FTP reuses its data connection for the next file.

**Check.** Three files and one directory listing in one session open $1 + 3 + 1 = 5$ connections. A script checked every port in part 3 against the system's `/etc/services` table and found each one listed under the expected service name.
