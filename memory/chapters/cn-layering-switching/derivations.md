# Layering and switching: derivations

## Encapsulation is a stack, and its header overhead
<!-- topics: cn-layering-switching.layering-principles, cn-layering-switching.encapsulation, cn-layering-switching.header-overhead, cn-layering-switching.osi-model, cn-layering-switching.tcp-ip-model -->

**Claim.** Number the layers that add a header $1, \dots, n$ from the top of the stack down, and let layer $i$ add $h_i$ bytes (a trailer counts towards its layer's $h_i$). For an application message of $M$ bytes:

1. The unit on the wire is $H_n H_{n-1} \cdots H_1\, M$ (trailers at the end). On a single link the receiver's layer $i$ sees exactly the PDU that the sender's layer $i$ produced. Across routers this peer property holds per hop for the link layer (each router builds a new frame), end to end for transport and above, and end to end for the network layer apart from per-hop fields such as TTL and the header checksum, which every router rewrites.
2. The bytes sent are $M + \sum_i h_i$, so the header fraction is $f_{\text{hdr}} = \sum_i h_i / (M + \sum_i h_i)$, which is $n h / (M + n h)$ when every $h_i = h$.
3. While the link of rate $R$ is kept busy with such units, the rate of application bytes (goodput) is $R \cdot M / (M + \sum_i h_i)$.

The model assumes no fragmentation and no padding, so each message travels as one unit.

**Proof.** On the way down, layer $i$ receives the PDU of layer $i - 1$ (the one above it) and treats all of it, headers included, as opaque payload: it prepends $H_i$ and passes the result down. By induction on $i$ the unit leaving layer $i$ is $H_i H_{i-1} \cdots H_1 M$, so the outermost header is that of the lowest layer, the order a stack produces. On the way up, layer $i$ at the receiver gets a unit whose outermost header is $H_i$, because layers below it have already removed their own headers in the reverse order. It reads $H_i$, strips it, and hands the rest to the protocol that $H_i$ names (the IP protocol field naming TCP, for example). The PDU it hands up is the one the sender's layer $i$ received, which is the peer-to-peer property: layer $i$'s header is written and read only by layer $i$ entities, and no sender layer ever removes a header. Each layer adds its bytes exactly once, so the total is $M + \sum_i h_i$, and claim 2 is the ratio of header bytes to total bytes. If the link sends $R$ bits per second of these units, a fraction $M/(M + \sum_i h_i)$ of them are application bytes, which gives claim 3. A router that forwards the unit decapsulates only up to the network layer and builds a new link header for the next link, so the link-layer bytes are charged once per link but the fraction on each link is the same when the link headers have equal size.

**GATE use.** The layer facts (OSI's seven layers, TCP/IP's five, the PDU names segment, packet, frame and bits) are 1-mark MCQs; the overhead is a 1-mark NAT. The traps are an MSQ option saying the sender strips the header of the layer above (false: only receivers strip), counting a trailer as zero bytes, and taking the header fraction over $M$ rather than over $M + \sum_i h_i$.

**Check.** Five layers adding 40 bytes each to an 1800-byte message send 2000 bytes, of which 200 are headers: $f_{\text{hdr}} = 10\%$, and on a 10 Mbps link the goodput is 9 Mbps. A 40-byte payload under 40 bytes of TCP and IP headers gives $f_{\text{hdr}} = 50\%$. A 1460-byte TCP payload with 20 bytes of TCP header, 20 of IP and an 18-byte Ethernet header and trailer is $1460/1518 \approx 96.2\%$ useful.

## Counting layer visits along a path
<!-- topics: cn-layering-switching.encapsulation, cn-layering-switching.network-devices, cn-layering-switching.layering-principles -->

**Claim.** A packet travels from host S to host D through $r$ IP routers, so the path has $r + 1$ links. Counting one visit each time a layer at some node processes the packet:

$$N_{\text{net}} = r + 2, \qquad N_{\text{link}} = N_{\text{phy}} = 2r + 2, \qquad N_{\text{transport}} = 2.$$

The model counts a pass down the stack and a pass up as separate visits only at the routers, where both happen; layer-2 switches on a link are not counted because they add no network-layer step.

**Proof.** At S the packet goes down once through transport, network, data link and physical: one visit to each. At D it goes up once through physical, data link, network and transport: one visit to each. A router receives the frame on its input link, which takes it up through physical and data link to the network layer; the network layer looks up the destination address once and hands the packet down to the data link and physical layers of the output link, which build and send a new frame. So each router adds one network-layer visit and two visits to each of the data link and physical layers, and none to transport, which runs only in the end hosts. Summing, $N_{\text{net}} = 1 + r + 1$, $N_{\text{link}} = N_{\text{phy}} = 1 + 2r + 1$ and $N_{\text{transport}} = 2$. Equivalently the data link layer is visited twice per link, once to send and once to receive, and there are $r + 1$ links.

**GATE use.** A 1-mark MCQ gives two routers and asks for the network-layer and data-link-layer counts. The traps are giving each router a single data link pass (4 and 4) and counting only the end hosts (2 and 2).

**Check.** With $r = 2$ the counts are 4 network-layer visits and 6 data-link visits; with $r = 3$ they are 5 and 8. A script that walks the node list S, R1, R2, D, adding one network and one link visit per host and one network and two link visits per router, returns the same numbers.

## Counting collision and broadcast domains
<!-- topics: cn-layering-switching.network-devices, cn-layering-switching.osi-model -->

**Claim.** Model a LAN as a graph whose vertices are hosts, hubs (or repeaters), switches (or bridges) and router interfaces, and whose edges are cables. Then:

1. Two cables lie in the same collision domain exactly when they are joined through hubs alone. So the number of collision domains is the number of connected components after every switch port and router interface is treated as a cut point; with no hubs it equals the number of cables.
2. Two hosts lie in the same broadcast domain exactly when they are joined by a path that passes through no router. So each router interface bounds one broadcast domain, and switches and hubs never split one.

**Proof.** A hub (layer 1) repeats every incoming bit to every other port at once, so a transmission on any cable attached to a hub is present on all of them, and two simultaneous senders on those cables collide. Joining through hubs is transitive, which makes "joined through hubs alone" an equivalence relation on cables, and its classes are the collision domains. A switch or bridge (layer 2) receives a whole frame on one port, stores it and sends it on another port only when that port is free, so a transmission on one switch port never meets a transmission on another: every switch port ends a collision domain. A router interface is a separate port in the same sense. For broadcasts, a frame to the all-ones MAC address is flooded by every switch to all its ports and repeated by every hub, so it reaches every vertex joined to the sender without crossing a router. A router forwards on IP addresses (layer 3) and does not forward link-layer broadcasts, so a router interface is where the flood stops. The broadcast domains are therefore the components of the graph with each router split into its separate interfaces.

**GATE use.** MCQs ask which device separates collision domains (switch, bridge, router) and which separates broadcast domains (router only), or ask for the number of each in a drawn topology. The traps are counting a hub as a layer-2 device because it has many ports, and forgetting that the cable from a switch to a router is a collision domain of its own.

**Check.** A router has two interfaces. Interface 1 connects to a switch whose other ports go to three hosts and one hub carrying four hosts. Interface 2 connects to a hub carrying five hosts. Collision domains: three host cables, the hub with its four hosts, and the switch-to-router cable on side 1, plus one domain for the whole of side 2: 6. Broadcast domains: 2, one per router interface. A union-find over the cable graph returns the same 6 and 2.

## Transmission, propagation and the time until the last bit arrives
<!-- topics: cn-layering-switching.delay-components -->

**Claim.** A packet of $L$ bits is sent on one link of rate $R$ bit/s, length $d$ metres and signal speed $v$ m/s, starting at time 0. With processing and queuing delay zero, the first bit arrives at $d/v$ and the last bit at

$$T = \frac{L}{R} + \frac{d}{v}.$$

At any instant the link holds at most $R\,d/v$ bits, and exactly $\min(L, R\,d/v)$ bits of this packet at the moment its first bit arrives. With processing delay $d_{\text{proc}}$ and queuing delay $d_{\text{queue}}$ at the sending node, the delay of the hop is $d_{\text{proc}} + d_{\text{queue}} + L/R + d/v$.

**Derivation.** The sender puts one bit on the link every $1/R$ seconds, so bit $j$ (counting from $j = 1$) starts at time $(j-1)/R$ and is fully on the link at $j/R$. Each bit then travels $d$ metres at speed $v$, taking $d/v$, independent of $R$ and $L$. Bit 1 arrives (its leading edge) at $d/v$; bit $L$ is fully emitted at $L/R$ and arrives at $L/R + d/v$. The two terms add because they happen one after the other for the last bit: first it must wait for the $L - 1$ bits ahead of it to be emitted, then it must travel. A bit emitted at time $s$ is on the wire during $[s, s + d/v]$, so the bits on the wire at time $t$ were emitted during the last $d/v$ seconds, which is at most $R\,d/v$ of them; at $t = d/v$ the emitted bits number $\min(L, R\,d/v)$ and none has arrived yet. Processing (header check and table lookup) and queuing (waiting behind other packets) happen at the node before transmission starts, so they add in front. Rate prefixes are powers of ten, so 10 Mbps is $10^7$ bit/s, while bytes convert to bits with a factor 8.

**GATE use.** 1-mark NATs give a packet size, rate and distance and ask for the time until the last bit arrives; MCQs change the length or rate and ask which delay changes. The traps are using 1024 for a rate prefix, forgetting the factor 8, and stating that the two delays should not be added: they are independent quantities, yet the last bit pays both.

**Check.** 1000 bytes on a 10 Mbps, 200 km link with $v = 2 \times 10^8$ m/s: $L/R = 8000/10^7 = 0.8$ ms and $d/v = 2 \times 10^5 / (2 \times 10^8) = 1$ ms, so the last bit arrives at 1.8 ms. The link holds $R\,d/v = 10^4$ bits, more than the 8000-bit packet, so the whole packet is in flight at once before its first bit lands. Doubling the length and the rate halves $L/R$ to 0.4 ms and doubles $d/v$ to 2 ms.

## P packets over k store-and-forward links of equal rate
<!-- topics: cn-layering-switching.store-and-forward, cn-layering-switching.datagram-switching -->

**Claim.** A source sends $P$ packets of $L$ bits each (headers included) back to back over a path of $k$ links, all of rate $R$, with $k - 1$ store-and-forward routers between them. Link $i$ has propagation delay $\delta_i$. With no other traffic, zero processing delay and buffers large enough, the last bit of the last packet reaches the destination at

$$T = (P + k - 1)\,\frac{L}{R} + \sum_{i=1}^{k} \delta_i.$$

Without pipelining, sending each packet only after the previous one has arrived, the time would be $P\,(k L/R + \sum_i \delta_i)$.

**Proof.** Write $t = L/R$ and let $C_{i,j}$ be the time at which packet $j$ finishes transmission on link $i$. Router $i$ can start sending packet $j$ only when the packet has fully arrived from link $i - 1$ (store-and-forward), at $C_{i-1,j} + \delta_{i-1}$, and only after it has finished sending packet $j - 1$ on link $i$ (one transmitter per link). So

$$C_{i,j} = \max\bigl(C_{i-1,j} + \delta_{i-1},\; C_{i,j-1}\bigr) + t,$$

with $C_{0,j} + \delta_0$ read as $(j-1)t$ for the source, which emits back to back, and $C_{i,0} = 0$ for every link, so for the first packet the max reduces to its first argument (all times are non-negative). The invariant is $C_{i,j} = (i + j - 1)\,t + \sum_{m<i} \delta_m$. It holds for $i = 1$, where $C_{1,j} = j t$, and for $j = 1$, where $C_{i,1} = C_{i-1,1} + \delta_{i-1} + t$ unfolds to $i t + \sum_{m<i}\delta_m$. Assume it for smaller $i + j$ with $i, j \ge 2$. The first argument of the max is $(i + j - 2)t + \sum_{m<i}\delta_m$ and the second is $(i + j - 2)t + \sum_{m<i}\delta_m$ as well, so the max equals that value and adding $t$ gives the invariant. The destination holds the last bit of packet $P$ at $C_{k,P} + \delta_k = (P + k - 1)t + \sum_{i=1}^k \delta_i$. In words: the first packet needs $k$ transmissions and all the propagation, and each later packet arrives one transmission time after its predecessor. Propagation is paid once per link because packets in flight on the same link overlap in time. With $P = 1$ the formula is $k L/R + \sum_i \delta_i$, and with $k = 1$ it is $P L/R + \delta_1$. This matches the pipeline argument in Kurose and Ross for $N$ links.

**GATE use.** The 2-mark NAT gives packets, hops, rate and distance, sometimes with a header to add to every packet. The traps are $P k L/R$ (no pipelining), adding propagation once per packet, and counting routers instead of links: $k$ links have $k - 1$ routers.

**Check.** 500 packets of 2000 bits over 4 links of 2 Mbps and 400 km at $2 \times 10^8$ m/s: $t = 1$ ms, $\delta = 2$ ms, so $T = (500 + 3) \times 1 + 4 \times 2 = 511$ ms. A simulation of the recurrence above gives 511 ms, and 2000 random instances of $P$, $k$, $L$ and the delays agree with the formula.

## Links of unequal rate: the bottleneck spaces the packets
<!-- topics: cn-layering-switching.store-and-forward, cn-layering-switching.throughput-bdp -->

**Claim.** Under the assumptions of the previous section but with link $i$ at rate $R_i$, the last bit of packet $P$ arrives at

$$T = \sum_{i=1}^{k} \frac{L}{R_i} + (P - 1)\,\frac{L}{\min_i R_i} + \sum_{i=1}^{k} \delta_i.$$

With equal rates this reduces to $(P + k - 1)L/R + \sum_i \delta_i$.

**Proof.** Let $t_i = L/R_i$. The recurrence is now $C_{i,j} = \max(C_{i-1,j} + \delta_{i-1}, C_{i,j-1}) + t_i$. Unfolding the max shows that $C_{k,P}$ is the length of the longest path in a $k \times P$ grid from cell $(1,1)$ to cell $(k,P)$ that moves either to the next packet on the same link ($j \to j + 1$) or to the next link for the same packet ($i \to i + 1$, collecting $\delta_i$). Each cell $(i,j)$ on the path contributes $t_i$. Every such path makes exactly $k - 1$ link moves and $P - 1$ packet moves, so it visits $k + P - 1$ cells and collects every $\delta_i$ with $i < k$ exactly once. It visits each row $i$ at least once, contributing at least $\sum_i t_i$, and the remaining $P - 1$ cells are extra visits to rows the path stays in. Their contribution is largest when all $P - 1$ extra cells lie in the row with the largest $t_i$, which is the slowest link, and that path exists (go down to the slowest row, run along it, go down to row $k$). So $C_{k,P} = \sum_i t_i + (P - 1)\max_i t_i + \sum_{i<k}\delta_i$, and adding $\delta_k$ for the last link gives $T$. This is the flow-shop makespan for identical jobs. A queue builds in front of the slowest link and packets leave it $L/R_{\min}$ apart; faster links after it cannot close those gaps.

**GATE use.** NATs with links of different rates. The trap is applying $(P + k - 1)L/R$ with some average rate, or with the first link's rate; only the slowest link sets the spacing, and every link still contributes one transmission time for the first packet.

**Check.** 3 packets of 1000 bits over links of 1, 0.5 and 2 Mbps with no propagation: $t = 1, 2, 0.5$ ms, so $T = 3.5 + 2 \times 2 = 7.5$ ms. The simulation of the recurrence gives 7.5 ms, and the random tests in the previous section's script cover unequal rates as well.

## Message switching, packetisation and the best payload size
<!-- topics: cn-layering-switching.store-and-forward -->

**Claim.** A message of $M$ data bits crosses $k \ge 2$ equal links of rate $R$; ignore propagation and processing.

1. Message switching, with the whole message and its single header of $h$ bits stored at every hop, takes $T_{\text{msg}} = k (M + h) / R$.
2. Split into packets of $p$ data bits and $h$ header bits, with $p$ dividing $M$, it takes $T(p) = (M/p + k - 1)(p + h)/R$.
3. Treating $p$ as continuous, $T(p)$ is smallest at $p^* = \sqrt{M h / (k - 1)}$. When $p^*$ is not a divisor of $M$, compare the divisors on either side.

**Proof.** Claim 1 is the previous section's formula with $P = 1$ and $L = M + h$. Claim 2 is the formula with $P = M/p$ packets of $L = p + h$ bits. For claim 3 expand:

$$R\,T(p) = M + \frac{M h}{p} + (k - 1)p + (k - 1)h.$$

The derivative in $p$ is $-M h / p^2 + (k - 1)$, which is zero at $p^2 = M h / (k - 1)$. The second derivative $2 M h / p^3$ is positive for $p > 0$, so this stationary point is the global minimum on $p > 0$. The two terms in $p$ explain the trade-off: small packets cut the pipeline fill time $(k - 1)(p + h)$, but more packets carry more headers, $M h / p$ in total. With $k = 1$ there is nothing to pipeline and the best choice is one packet. Splitting always helps when headers are free ($h = 0$): $T$ falls towards $M/R$ as $p$ shrinks.

**GATE use.** 2-mark MCQs and NATs comparing one message with $P$ packets, and the occasional question asking for the payload size that minimises delay. The traps are leaving out the per-packet header, writing $P k L/R$ for the packet case, and reporting the continuous $p^*$ when it does not divide $M$.

**Check.** A 6000-bit message with a 100-bit header over 3 links of 1 Mbps takes $3 \times 6.1 = 18.3$ ms as one message. As 6 packets of 1100 bits it takes $(6 + 2) \times 1.1 = 8.8$ ms. For $M = 9000$, $h = 40$ and $k = 5$, $p^* = \sqrt{360000/4} = 300$, and $R\,T$ is $34 \times 340 = 11560$ at $p = 300$ against $11600$ at $p = 250$ and at $p = 360$. A search over all divisors of 9000 also picks 300.

## Circuit, virtual-circuit and datagram transfer times
<!-- topics: cn-layering-switching.circuit-vs-packet-timing, cn-layering-switching.circuit-switching, cn-layering-switching.virtual-circuit -->

**Claim.** A file of $F$ bits crosses $k$ links with total propagation $D$.

1. Circuit switching with setup time $s$ and circuit rate $R_c$ takes $T_{\text{circuit}} = s + F/R_c + D$, independent of $k$. With one of $n$ TDM slots on a link of rate $R$, $R_c = R/n$.
2. Datagram switching at link rate $R$, with the file in $P = F/p$ packets of $p + h$ bits, takes $T_{\text{dg}} = (P + k - 1)(p + h)/R + D$.
3. Virtual-circuit switching pays both: $T_{\text{vc}} = s + T_{\text{dg}}$ (with the short VC label in place of $h$ if the question says so).
4. At equal rate $R_c = R$, the circuit finishes first exactly when $s < (k - 1)(p + h)/R + P h/R$.

**Derivation.** Once a circuit is set up, every switch on it connects the input slot or band to the output one bit by bit, so no switch stores a whole packet: the file is transmitted once at rate $R_c$, taking $F/R_c$, and each bit then takes $D$ to arrive. The setup phase comes first, giving claim 1; the number of switches does not appear. A TDM frame gives the call one slot out of $n$, so the call gets $1/n$ of the link's bits, $R/n$. Claim 2 is the store-and-forward formula with $L = p + h$. A virtual circuit sends its setup message before any data, and its data packets are then stored and forwarded like datagrams, which gives claim 3. For claim 4 subtract with $R_c = R$ and $F = P p$: $T_{\text{dg}} - (T_{\text{circuit}} - s) = \bigl((P + k - 1)(p + h) - P p\bigr)/R = \bigl((k - 1)(p + h) + P h\bigr)/R$, and the circuit wins when $s$ is smaller than this.

**GATE use.** NATs on total transfer time and comparisons of the three methods. The traps are using the full link rate for a circuit that owns one TDM slot, multiplying the circuit time by the number of hops, and forgetting the setup phase of a virtual circuit.

**Check.** A 320000-bit file on one of 32 slots of a 2.048 Mbps link (64 kbps) with 250 ms setup takes $0.25 + 5 = 5.25$ s; the full-rate mistake gives $0.25 + 0.156 = 0.406$ s. A $10^6$-bit file over 4 links of 1 Mbps in 100 packets of $10^4 + 400$ bits takes $103 \times 10.4 = 1071.2$ ms by datagrams (simulated), against $s + 1000$ ms by circuit, so the circuit wins when $s < 71.2$ ms.

## Why circuits keep packets in order and datagrams may not
<!-- topics: cn-layering-switching.virtual-circuit, cn-layering-switching.datagram-switching, cn-layering-switching.circuit-switching -->

**Claim.** If every packet of a flow follows the same path and every link serves its queue first in, first out, the packets arrive in the order they were sent. Circuit and virtual-circuit switching satisfy both conditions, so they preserve order. Datagram switching forwards each packet independently, so two packets of one flow can take different paths and arrive reversed.

**Proof.** Let packets $a$ and $b$ be sent in that order and follow the path of links $1, \dots, k$. The invariant is that $a$ finishes transmission on each link before $b$ does. On link 1 it holds because the source sends $a$ first. Assume it for link $i - 1$. Link $i - 1$ has one propagation delay for all bits, so $a$ arrives completely at router $i - 1$ before $b$ does, joins the FIFO queue of link $i$ earlier, and is transmitted first. By induction $a$ leaves link $k$ first and, after the same final propagation, reaches the destination first. A circuit sends bits along a fixed slot sequence, a stronger form of the same argument. A virtual circuit fixes the path at setup and each packet carries only a label (VCI) that the switch looks up, so the path is the same for all packets. A datagram network may change its forwarding tables between two packets or spread traffic across equal-cost paths, so the first condition fails and the induction does not start.

**GATE use.** MSQs on the properties of the three switching methods: setup (circuit and VC), order preserved (circuit and VC), per-packet routing (datagram only), reserved resources (circuit always, VC only if requested). The trap is the option claiming that virtual-circuit packets carry the full destination address and are routed independently.

**Check.** With $L/R = 1$ ms on every link, packet 1 leaves at time 0 over a 2-link path with 10 ms of total propagation and arrives at 12 ms. Packet 2 leaves at 1 ms over a 1-link path with 2 ms of propagation and arrives at 4 ms, before packet 1.

## Bottleneck throughput, the bandwidth-delay product and window limits
<!-- topics: cn-layering-switching.throughput-bdp -->

**Claim.** For one flow on an otherwise idle path of links with rates $R_1, \dots, R_k$:

1. The long-run throughput is $\min_i R_i$, so a file of $F$ bits takes $F / \min_i R_i$ plus a start-up term that does not grow with $F$.
2. A sender with window $W$ bits on a link of rate $R$, sending $L$-bit packets and waiting for an acknowledgement that returns RTT after a packet is fully sent, keeps the link busy exactly when $W \ge L + R \cdot \mathrm{RTT}$. Otherwise its throughput is $W / (L/R + \mathrm{RTT})$, which is about $W/\mathrm{RTT}$ when $L/R \ll \mathrm{RTT}$. Hence throughput $\approx \min(R, W/\mathrm{RTT})$.
3. The bandwidth-delay product $R \times \mathrm{RTT}$ is the data that must be outstanding to keep the link full; the bits physically on one link of propagation delay $\delta$ number $R\,\delta$.

**Derivation.** For claim 1, the slowest link can carry at most $R_{\min} = \min_i R_i$ bits per second, and every bit must cross it, so throughput is at most $R_{\min}$. The unequal-rate formula shows the last of $P$ packets arrives at $(P - 1)L/R_{\min}$ plus a constant, so the bound is attained as $P$ grows. For claim 2, the sender emits packet 1 in $[0, L/R]$ and its acknowledgement returns at $L/R + \mathrm{RTT}$. In that interval it can keep sending only if the window has room, and it sends $R(L/R + \mathrm{RTT}) = L + R\,\mathrm{RTT}$ bits in that time if the link stays busy. If $W$ is at least this, acknowledgements keep returning before the window fills and the link never idles, so throughput is $R$. If $W$ is smaller, the sender sends $W$ bits and then idles until the first acknowledgement, and the pattern repeats every $L/R + \mathrm{RTT}$, giving $W/(L/R + \mathrm{RTT})$. Claim 3 restates the busy condition: with $L$ small compared with $R\,\mathrm{RTT}$, the window must reach $R \times \mathrm{RTT}$. The on-the-wire count $R\,\delta$ is the bound from the single-link section, and it uses the one-way delay.

**GATE use.** 1-mark NATs on the BDP in bytes or in packets, window sizes needed to fill a link, and transfer times over a path of different rates. The traps are mixing one-way delay and RTT, reporting bits when bytes are asked, and adding the three link times as if each link had to carry the whole file before the next could start.

**Check.** A 4 MB file ($32 \times 10^6$ bits) over links of 10, 2 and 5 Mbps takes about $32 \times 10^6 / (2 \times 10^6) = 16$ s; sent as 1000 packets of 32000 bits the exact time is $25.6 + 999 \times 16 = 16009.6$ ms (simulated). At 100 Mbps and 100 ms RTT, $R \times \mathrm{RTT} = 10^7$ bits $= 1.25$ MB. A 64 KB window ($65536 \times 8$ bits) over a 100 ms RTT caps throughput at about 5.24 Mbps. A window simulation with 8 packets of 8000 bits, $R = 10$ Mbps and RTT 100 ms gives about 635 kbit/s, matching $64000/0.1008$.

## Link efficiency, stop-and-wait and traffic intensity
<!-- topics: cn-layering-switching.utilisation-traffic-intensity -->

**Claim.** Let a link of rate $R$ carry $L$-bit packets.

1. The fraction of time the link sends useful bits is $U = \text{throughput}/R = t_{\text{useful}}/t_{\text{cycle}}$ over any repeating cycle.
2. A sender that sends one packet and waits for its acknowledgement, with one-way propagation $\delta$, RTT $= 2\delta$ and negligible acknowledgement and processing time, has $U = (L/R)/(L/R + 2\delta) = 1/(1 + 2a)$ with $a = \delta/(L/R)$.
3. If packets arrive at an average rate of $\lambda$ per second, the traffic intensity is $\rho = L\lambda/R$ (the chapter writes $a$ for $\lambda$). When $\rho > 1$ the backlog grows without bound, at least at rate $L\lambda - R$ bits per second. With random arrivals the backlog is also unbounded at $\rho = 1$, so a stable queue needs $\rho < 1$.

**Derivation.** Claim 1 is the definition: over a cycle the link carries $R\, t_{\text{useful}}$ useful bits, so throughput is $R\, t_{\text{useful}}/t_{\text{cycle}}$. For claim 2 the cycle starts when the packet starts: transmission takes $L/R$, the last bit arrives $\delta$ later, and the acknowledgement takes another $\delta$ to return, after which the next packet starts. Useful time is $L/R$ in a cycle of $L/R + 2\delta$; dividing numerator and denominator by $L/R$ gives $1/(1 + 2a)$. For claim 3, by time $t$ about $L\lambda t$ bits have arrived on average, and the link has sent at most $R t$ of them, so the backlog is at least $(L\lambda - R)t$, which grows without bound when $L\lambda > R$, that is $\rho > 1$. At $\rho = 1$ this lower bound is 0 and says nothing, so take random arrivals: the backlog then changes each interval by arrivals minus departures, a step of mean zero and positive variance whenever the queue is non-empty, and it is held at 0 from below. That is a reflected zero-drift random walk, which is null recurrent: it returns to 0 but its peaks grow like $\sqrt{t}$ without bound, and its mean waiting time is infinite. Only exactly periodic arrivals stay bounded at $\rho = 1$, which no real link sees. Below 1 the queue still becomes long as $\rho$ approaches 1, because bursts arrive faster than the link drains them and idle periods cannot be recovered; Kurose and Ross describe the delay as rising sharply in that range.

**GATE use.** MCQs on what happens to a queue for a given load, efficiency of stop-and-wait (with sliding windows in the data link chapter), and statements that adding capacity to a link that is not the bottleneck raises throughput (false). The traps are taking $\rho = 1$ as safe and forgetting the factor 2 in the round trip.

**Check.** 1000-byte packets at 1 Mbps take 8 ms; with $\delta = 20$ ms, $U = 8/48 = 1/6$, and $a = 2.5$ gives $1/(1 + 5) = 1/6$. 1500-byte packets at 1000 per second on a 10 Mbps link give $\rho = 1.2 \times 10^7 / 10^7 = 1.2$, and the backlog grows by $2 \times 10^6$ bits each second; a slot-by-slot fluid simulation reaches $2 \times 10^7$ bits after 10 s. At $\rho = 1$ with random arrivals (a batch of 2 with probability $1/2$ per slot, one departure per slot) a simulation gives a peak backlog of 141 after $10^4$ slots, 380 after $10^5$ and 1449 after $10^6$, growing like $\sqrt{t}$.
