# Graph algorithms: derivations

## Degree sums, edge bounds and the cost of a traversal
<!-- topics: algo-graph-algorithms.representations, algo-graph-algorithms.bfs, algo-graph-algorithms.dfs -->

**Claim.** Let $G = (V, E)$ be a graph with $V$ vertices and $E$ edges, no self-loops and no parallel edges. If $G$ is undirected,

$$\sum_{v \in V} \deg(v) = 2E, \qquad E \le \frac{V(V-1)}{2},$$

so its adjacency lists hold $2E$ entries in all; a directed graph's lists hold $E$ entries (one per out-edge) and $E \le V(V-1)$. BFS and DFS over the whole graph cost $O(V + E)$ on adjacency lists and $\Theta(V^2)$ on an adjacency matrix. The matrix answers "is $(u, v)$ an edge?" in $O(1)$, against $O(\deg u)$ for a list.

**Proof.** Each undirected edge $\{u, v\}$ adds 1 to $\deg(u)$ and 1 to $\deg(v)$, and nothing else adds to any degree, so the degree sum counts every edge exactly twice. The list of $u$ holds one entry per incident edge, so the lists hold $\sum_v \deg(v) = 2E$ entries; in a directed graph the list of $u$ holds its $\deg^+(u)$ out-edges and $\sum_u \deg^+(u) = E$. With no loops or parallel edges every edge is a distinct unordered pair of distinct vertices, and there are $\binom{V}{2} = V(V-1)/2$ such pairs (ordered pairs, $V(V-1)$, when directed).

For the traversal cost, both BFS and DFS mark a vertex when it is first reached and never process a marked vertex again, so each vertex is processed once. Processing $u$ means listing its neighbours. On lists this costs $O(1 + \deg u)$, and summing over all vertices gives $O(V + \sum_u \deg u) = O(V + E)$ by the handshake lemma; the $V$ term covers the outer loop that restarts the search from unvisited vertices. On a matrix, listing the neighbours of $u$ means reading the whole row of $u$, $V$ entries whatever $\deg u$ is, so processing all $V$ vertices reads $V^2$ entries: $\Theta(V^2)$ even for a sparse graph. The algorithm is the same; the representation decides the bound.

**GATE use.** Complexity MCQs ask for BFS or DFS "on an adjacency matrix" (answer $\Theta(V^2)$) or "on adjacency lists" ($O(V + E)$), and the trap is quoting $O(V + E)$ for the matrix. Degree-sum questions ask whether a degree sequence is possible (the sum must be even) or for the number of edges from the degrees. The simple-graph bound gives $E = O(V^2)$, hence $\log E = O(\log V)$, which later sections use.

**Check.** The graph with edges 1–2, 2–3, 3–1, 3–4, 4–5, 5–6, 6–4 and 6–7 has degrees 2, 2, 3, 3, 2, 3, 1, summing to $16 = 2 \cdot 8$; its lists hold 16 entries, a full traversal on the matrix reads $7^2 = 49$ entries, and $8 \le 7 \cdot 6/2 = 21$. A script confirmed the degree sum and the edge bound on 2,000 random graphs of up to 9 vertices.

## BFS layers are fewest-edge distances; the bipartite test
<!-- topics: algo-graph-algorithms.bfs, algo-graph-algorithms.dag-unweighted-sp -->

**Claim.** Run BFS from $s$ with a FIFO queue, setting $d[s] = 0$ and $d[v] = d[u] + 1$ when $v$ is first discovered while scanning $u$. Let $\delta(v)$ be the fewest number of edges on any path from $s$ to $v$ ($\infty$ if none). Then:

1. $d[v] = \delta(v)$ for every vertex $v$ reachable from $s$, so BFS solves single-source shortest paths when every edge has the same weight, in $O(V + E)$.
2. In an undirected graph every edge $\{u, v\}$ between reached vertices has $\lvert d[u] - d[v] \rvert \le 1$: a non-tree edge joins the same layer or adjacent layers.
3. An undirected graph is bipartite if and only if BFS (restarted in every component) finds no edge with both ends in the same layer.
4. The number of restarts needed to reach every vertex is the number of connected components.

**Proof.** (1) Each $d[v]$ is the length of the tree path $s \to \dots \to v$ that BFS builds, so $d[v] \ge \delta(v)$. For the reverse, first an invariant of the queue: if it holds $v_1, \dots, v_r$ front to back, then $d[v_1] \le d[v_2] \le \dots \le d[v_r] \le d[v_1] + 1$. It holds for the queue $(s)$. Dequeuing $v_1$ keeps it, since $d[v_2] \ge d[v_1]$. Enqueuing a newly discovered $w$ while scanning $v_1$ appends $d[w] = d[v_1] + 1$, which is at least the old $d[v_r]$ and at most the new front plus 1. So vertices leave the queue in nondecreasing $d$. Now induct on $k = \delta(v)$. For $k = 0$, $v = s$. If $\delta(v) = k + 1$, take the vertex $u$ before $v$ on a shortest path, so $\delta(u) = k$ and by induction $d[u] = k$. When $u$ is dequeued and scans $v$, either $v$ is undiscovered and gets $d[v] = k + 1$, or it was discovered earlier, from a vertex dequeued no later than $u$, so $d[v] \le d[u] + 1 = k + 1$. With $d[v] \ge \delta(v) = k + 1$ this gives equality. The cost is that of any traversal, $O(V + E)$ (previous section).

(2) For an undirected edge $\{u, v\}$, a shortest path to $u$ followed by the edge reaches $v$, so $\delta(v) \le \delta(u) + 1$, and symmetrically. By (1) the same holds for $d$.

(3) If no edge joins two vertices of one layer, colour each vertex by the parity of $d$; by (2) every edge joins adjacent layers, so its ends get different colours, and the graph is bipartite. If some edge $\{u, v\}$ has $d[u] = d[v] = k$, follow the BFS tree paths from $u$ and $v$ back towards $s$ until they meet at their lowest common ancestor $w$, at layer $j < k$. The two tree paths have $k - j$ edges each and share only $w$, so with the edge $\{u, v\}$ they form a cycle of $2(k - j) + 1$ edges, an odd cycle. Around an odd cycle the two colours would have to alternate an odd number of times and return to the start colour, which is impossible, so the graph is not bipartite.

(4) One BFS from $s$ reaches exactly the vertices connected to $s$, its component. Each restart from an unvisited vertex therefore marks one whole new component, and the restarts stop when every component is marked. The total work is still one scan of every list, $O(V + E)$.

**GATE use.** Layer-size questions on structured graphs (hypercubes, grids) ask how many vertices sit at distance $k$; the distance is the BFS layer. "Shortest path in an unweighted graph" picks BFS, not Dijkstra, which would add a $\log V$ factor. Bipartiteness MCQs reduce to "no odd cycle". The trap in (2) is applying it to a directed graph, where an edge can jump back several layers.

**Check.** In the 4-dimensional hypercube each edge flips one bit, so the distance from 0000 is the number of 1 bits, and the layers have sizes $1, 4, 6, 4, 1$ ($\binom{4}{k}$); BFS reproduced them. On the 5-cycle 0–1–2–3–4–0, BFS from 0 gives layers $\{0\}, \{1, 4\}, \{2, 3\}$, and the edge 2–3 lies inside layer 2: the odd cycle has $2(2 - 0) + 1 = 5$ edges. On the 6-cycle the layers are $\{0\}, \{1, 5\}, \{2, 4\}, \{3\}$ with no same-layer edge, and the graph is bipartite. A script compared BFS distances with exhaustive relaxation, and the same-layer test with a brute-force search over all 2-colourings, on 3,000 random graphs of up to 8 vertices.

## DFS timestamps, edge classes and cycle detection
<!-- topics: algo-graph-algorithms.dfs, algo-graph-algorithms.dfs-edge-types -->

**Claim.** Run DFS over the whole graph with one clock that ticks at every discovery and every finish, giving discovery time $d[u]$ and finishing time $f[u]$, and colours white (undiscovered), grey ($d[u]$ set, $f[u]$ not) and black (finished). Then:

1. Parenthesis property: for any two vertices $u \ne v$, the intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are either disjoint or nested, and $[d[v], f[v]] \subset [d[u], f[u]]$ exactly when $v$ is a descendant of $u$ in the DFS forest.
2. White-path property: $v$ becomes a descendant of $u$ if and only if, at time $d[u]$, there is a path from $u$ to $v$ through white vertices only.
3. In a directed graph, the edge $(u, v)$ examined from $u$ is a tree edge if $v$ is white, a back edge if $v$ is grey, a forward edge if $v$ is black with $d[u] < d[v]$, and a cross edge if $v$ is black with $d[v] < d[u]$. For a back edge $f[u] < f[v]$; for the other three $f[u] > f[v]$.
4. A directed graph has a cycle if and only if DFS finds a back edge.
5. In an undirected graph every edge is a tree edge or a back edge, so a cycle exists if and only if DFS meets an already visited vertex other than the parent.

**Proof.** (1) Say $d[u] < d[v]$. If $d[v] < f[u]$, then $v$ was discovered while $u$ was grey, that is while the call for $u$ was on the recursion stack, so the call for $v$ is nested inside it: $v$ is a descendant of $u$ and returns first, $f[v] < f[u]$, and the intervals nest. Otherwise $f[u] < d[v]$ and the intervals are disjoint. They cannot overlap partially, because a call started inside another call ends before it.

(2) If $v$ is a descendant of $u$, each vertex on the tree path from $u$ to $v$ is discovered after $d[u]$ and so is white at $d[u]$. Conversely, suppose a white path $u = w_0, \dots, w_k = v$ exists at $d[u]$, but some $w_i$ does not become a descendant; take the first such, so $w_{i-1}$ is a descendant (or is $u$). Then $d[w_i] > d[u]$ because $w_i$ was white, and $w_i$ is discovered before $w_{i-1}$ finishes, since $w_{i-1}$ examines the edge to it. So $d[u] < d[w_i] < f[w_{i-1}] \le f[u]$, and by (1) $w_i$ is a descendant of $u$, a contradiction.

(3) The four cases are exhaustive by the colour of $v$ when the edge is examined. Grey $v$ is on the current recursion path, so it is an ancestor of $u$ and $u$'s interval nests inside $v$'s: $f[u] < f[v]$. A tree edge or a forward edge leads to a descendant, so $f[v] < f[u]$. For a cross edge, $v$ is already black, so $f[v]$ is before the current time, which is before $f[u]$; and since $d[v] < d[u]$, $v$ is not a descendant of $u$; nor is it an ancestor, because $v$ is black while $u$ is grey. By (1) the intervals are disjoint with $v$'s first: $d[v] < f[v] < d[u]$.

(4) A back edge $(u, v)$ with the tree path from the ancestor $v$ down to $u$ is a directed cycle. Conversely, take a cycle and its first discovered vertex $v$, and let $u$ be the vertex before $v$ on the cycle. At $d[v]$ every other cycle vertex is white, so the rest of the cycle is a white path from $v$ to $u$, and by (2) $u$ becomes a descendant of $v$. When $u$ examines $(u, v)$, the call for $v$ is still open, so $v$ is grey and the edge is a back edge.

(5) Take an undirected edge $\{u, v\}$ with $d[u] < d[v]$. $v$ is in $u$'s list, so $u$ cannot finish before $v$ is discovered, and $v$ becomes a descendant of $u$. If $u$ examines the edge first, $v$ is then white (tree edge). Otherwise $v$ examines it first, while $u$ is still grey, which is a back edge. A cross or forward edge would need the edge to be examined first from a vertex whose other end is already black, which this case split rules out. A back edge to a vertex other than the parent closes a cycle with the tree path; the parent edge is the tree edge itself seen from the other side.

**GATE use.** MCQs give a DFS run and ask which edge type $(u, v)$ is, or which timestamp inequality holds; read the colours, or compare intervals by (1). "Back edge if and only if cycle" is the standard cycle test. The trap is treating a cross or forward edge in a directed graph as a cycle, and the reverse trap in an undirected graph is counting the parent edge as a back edge.

**Check.** Take $a \to b$, $b \to c$, $a \to c$, $c \to a$ and $d \to b$, with $a$'s list ordered $b, c$, and start at $a$. The times are $a$ [1, 6], $b$ [2, 5], $c$ [3, 4] and $d$ [7, 8]. $c \to a$ meets grey $a$: back edge, and $f[c] = 4 < f[a] = 6$. $a \to c$ then meets black $c$ with $d[a] = 1 < d[c] = 3$: forward edge. $d \to b$ meets black $b$ with $d[b] = 2 < d[d] = 7$: cross edge, and $f[b] = 5 < d[d]$. A script checked the parenthesis property, the descendant equivalence, the finishing-time inequalities and "cycle if and only if back edge" against brute-force reachability on 3,000 random digraphs with shuffled lists, and checked that undirected DFS produced only tree and back edges.

## Topological order: existence, the two algorithms, counting and uniqueness
<!-- topics: algo-graph-algorithms.topological-sort, algo-graph-algorithms.dfs-edge-types -->

**Claim.** A directed graph has a topological order (every edge $u \to v$ has $u$ before $v$) if and only if it is acyclic. For a DAG:

1. Listing the vertices by decreasing DFS finishing time is a topological order.
2. Kahn's method, which repeatedly outputs a vertex of in-degree 0 and deletes its out-edges, outputs all $V$ vertices. On a graph with a cycle its queue still empties, after outputting fewer than $V$ vertices, and the vertices left over are exactly those that lie on a cycle or are reachable from one.
3. The topological order is unique if and only if the DAG has a Hamiltonian path, that is the consecutive vertices of the order are all joined by edges.
4. A DAG on $n$ vertices with no edges has $n!$ orders. Two disjoint chains of $a$ and $b$ vertices, with no edges between them, have $\binom{a+b}{a}$ orders.

**Proof.** A cycle $v_1 \to \dots \to v_k \to v_1$ would need $v_1$ before $v_2$, ..., $v_k$ before $v_1$, which is impossible; existence for acyclic graphs follows from (1) or (2).

(1) A DAG has no back edge (previous section, part 4), and for every tree, forward or cross edge $f[u] > f[v]$. So every edge goes from a larger finishing time to a smaller one, and decreasing finishing time puts every tail before its head. Pushing each vertex on a stack as it finishes and then popping gives this order in $O(V + E)$.

(2) Every DAG has a vertex of in-degree 0: walk backwards along in-edges from any vertex; in a finite graph without cycles the walk cannot revisit a vertex, so it stops at a vertex with no in-edge. Deleting that vertex leaves a DAG, so induction outputs all $V$ vertices. Each vertex enters the queue once and each edge is decremented once: $O(V + E)$. Now let the graph have a cycle. A vertex is output only after all its predecessors are output, so the first vertex of a cycle to be output would need its predecessor on the cycle output earlier, which is a contradiction: no cycle vertex is ever output, and by the same rule no vertex reachable from a cycle is either. A vertex $x$ that is neither on a cycle nor reachable from one has an acyclic set of ancestors (an ancestor on a cycle would make $x$ reachable from it), and induction on the longest path into $x$ shows that $x$ reaches in-degree 0 and is output. The queue empties in every case; what signals the cycle is that fewer than $V$ vertices came out.

(3) If $v_1 \to v_2 \to \dots \to v_n$ is a Hamiltonian path, each of its edges forces $v_i$ before $v_{i+1}$, which fixes the whole order. Conversely, take a topological order in which some consecutive pair $v_i, v_{i+1}$ is not joined by an edge. Swapping the two gives another order that is still topological: the only constraint that could break is an edge between $v_i$ and $v_{i+1}$, and there is none. So a unique order has every consecutive pair joined, which is a Hamiltonian path. In-degrees do not decide this: $a \to b$, $a \to c$ has all in-degrees at most 1 and two orders.

(4) With no edges every permutation is valid: $n!$. For two chains, an order is fixed by choosing which $a$ of the $a + b$ positions hold the first chain, since within each chain the order is forced: $\binom{a+b}{a}$.

**GATE use.** The standard NAT counts the topological orders of a small DAG: fix the forced first and last vertices, then branch on the set of current sources or multiply interleavings of independent chains. Validity MCQs: check every edge points forward. The traps are counting permutations of a level without checking edges inside it, believing a cyclic graph makes Kahn's queue "fail to empty", and the in-degree rule for uniqueness.

**Check.** The DAG $a \to b$, $a \to c$, $b \to d$, $c \to d$, $c \to e$, $d \to f$, $e \to f$ has 5 orders ($a$ first, $f$ last, and $bcde$, $bced$, $cbde$, $cbed$, $cebd$ in the middle), found by enumerating all 720 permutations. $a \to b$, $a \to c$ has 2 orders; chains $x \to y$ and $u \to v \to w$ have $10 = \binom{5}{2}$; 4 isolated vertices have 24. Kahn on $s \to x$, $x \to y$, $y \to x$, $y \to z$ outputs only $s$, leaving the cycle $\{x, y\}$ and the vertex $z$ it reaches. A script checked on 1,500 random DAGs that "unique" coincides with "Kahn's order is a Hamiltonian path" and that decreasing finishing time is always valid, and on 1,500 random digraphs that Kahn's leftovers are exactly the vertices on or reachable from a cycle.

## Strongly connected components: condensation, Kosaraju and Tarjan
<!-- topics: algo-graph-algorithms.scc -->

**Claim.** Call $u$ and $v$ strongly connected when each reaches the other. This is an equivalence relation, its classes (the SCCs) partition $V$, $G$ and its transpose $G^{\mathsf T}$ have the same SCCs, and contracting each SCC to one node gives an acyclic condensation graph. Kosaraju's algorithm (DFS on $G$ to get finishing times, then DFS on $G^{\mathsf T}$ taking start vertices in decreasing finishing time) outputs one SCC per tree of the second pass, in $O(V + E)$. Tarjan's single DFS, which pops an SCC off its stack at every vertex with $\mathrm{low}[v] = \mathrm{disc}[v]$, also outputs the SCCs in $O(V + E)$.

**Proof.** The relation is reflexive (empty path), symmetric by definition and transitive by joining paths, so its classes partition $V$; a vertex on no cycle reaches no other vertex that reaches it back, so it is a class by itself. Reversing every edge reverses every path, so $u$ reaches $v$ in $G^{\mathsf T}$ exactly when $v$ reaches $u$ in $G$, and mutual reachability is unchanged. If the condensation had a cycle $C_1 \to C_2 \to \dots \to C_1$, every vertex of $C_1$ would reach every vertex of $C_2$ and back, so the two would be one class: contradiction.

Kosaraju. For a set $C$ let $f(C) = \max_{v \in C} f[v]$. Key lemma: if $G$ has an edge from SCC $C$ to a different SCC $C'$, then $f(C) > f(C')$. Let $x$ be the first vertex of $C \cup C'$ discovered. If $x \in C$, at $d[x]$ every vertex of $C \cup C'$ is white and reachable from $x$ by a white path, so by the white-path property all of them become descendants of $x$ and finish before it: $f(C) = f[x] > f(C')$. If $x \in C'$, all of $C'$ becomes descendants of $x$, and no vertex of $C$ is reachable from $x$ (that would put $C$ and $C'$ in one SCC through the edge $C \to C'$), so all of $C$ is still white at $f[x]$ and finishes later: again $f(C) > f(C')$. In the second pass, the first start vertex has the largest finishing time; its SCC $C$ has the largest $f$. An edge leaving $C$ in $G^{\mathsf T}$ is an edge entering $C$ in $G$, from some $C''$ with $f(C'') > f(C)$ by the lemma, which is impossible for the maximum. So the tree from the start vertex is exactly $C$. Inductively, when a later tree starts in SCC $C$, every edge leaving $C$ in $G^{\mathsf T}$ goes to an SCC of larger $f$, which is already visited, so again the tree is exactly $C$. The cost is two DFS runs plus building $G^{\mathsf T}$, $O(V + E)$.

Tarjan. The first vertex of an SCC to be discovered, its root $r$, has every vertex of its SCC as a descendant (white-path property), and $\mathrm{low}[v]$ records the smallest discovery time reachable from $v$'s subtree by tree edges plus one edge to a vertex still on the stack. A vertex $v$ of the SCC other than $r$ reaches $r$, and the path from $v$ to $r$ must leave $v$'s subtree through an edge to a vertex discovered earlier that is still on the stack, so $\mathrm{low}[v] < \mathrm{disc}[v]$. At the root no such edge reaches anything discovered earlier and still on the stack, since that vertex would be in the same SCC and discovered before $r$; so $\mathrm{low}[r] = \mathrm{disc}[r]$. When $r$ finishes, the vertices above it on the stack are exactly the members of its SCC not yet popped, and popping them gives the SCC. One DFS, $O(V + E)$ (Tarjan 1972; CLRS gives the Kosaraju proof above).

**GATE use.** MCQs ask for the number of SCCs: merge vertices on common directed cycles and stop when no two components reach each other. A variant adds one edge from component $X$ to $Y$; every component on a path from $Y$ back to $X$ merges with both. The traps are counting weakly connected components, and believing that reversing every edge changes the SCCs.

**Check.** The graph $1 \to 2 \to 3 \to 1$, $3 \to 4$, $4 \to 5 \to 6 \to 4$, $6 \to 7$, $7 \to 8 \to 7$ has 3 SCCs, $\{1, 2, 3\}$, $\{4, 5, 6\}$ and $\{7, 8\}$. DFS from 1 finishes 8, 7, 6, 5, 4, 3, 2, 1 at times 9 to 16. The second pass on $G^{\mathsf T}$ starts at 1 and reaches only 3 and 2, then starts at 4 (finishing time 13) and reaches 6 and 5, then 7 and 8. Adding $8 \to 1$ merges everything into one SCC. A script compared Kosaraju and Tarjan with brute-force mutual reachability on 3,000 random digraphs of up to 9 vertices, confirmed that $G^{\mathsf T}$ had the same SCCs, and checked that every condensation was acyclic.

## Spanning trees, the cut and cycle properties, and MST uniqueness
<!-- topics: algo-graph-algorithms.mst-properties -->

**Claim.** Let $G$ be an undirected weighted graph on $n$ vertices.

1. Every spanning tree of a connected $G$ has $n - 1$ edges; a spanning forest of a $G$ with $c$ components has $n - c$ edges.
2. Cut property: let $A$ be a set of edges contained in some MST, and let $(S, V \setminus S)$ be a cut that no edge of $A$ crosses. A minimum-weight edge crossing the cut can be added to $A$ with the result still inside some MST. With $A$ empty: a lightest crossing edge belongs to some MST, and if it is the unique lightest crossing edge it belongs to every MST.
3. Cycle property: an edge strictly heavier than every other edge on some cycle belongs to no MST.
4. If all weights are distinct, the MST is unique. Equal weights permit but do not force several MSTs.
5. All MSTs have the same multiset of edge weights.

**Proof.** (1) A tree on $m \ge 2$ vertices has a leaf: an endpoint of a longest path has no neighbour off the path (the path would extend) and none on it except its successor (that would close a cycle). Deleting the leaf and its edge leaves a tree on $m - 1$ vertices, so induction from the one-vertex tree with 0 edges gives $m - 1$ edges. A spanning forest consists of one spanning tree per component, with $n_1 + \dots + n_c = n$ vertices, so it has $\sum (n_i - 1) = n - c$ edges.

(2) Let $T$ be an MST containing $A$, and $e = (u, v)$ a lightest crossing edge. If $e \in T$ we are done. Otherwise the path in $T$ from $u$ to $v$ starts in $S$ and ends outside it, so it contains an edge $e'$ crossing the cut; $e' \notin A$ because no edge of $A$ crosses. $T' = T - e' + e$ is again a spanning tree (deleting $e'$ splits $T$ into two parts and $e$ rejoins them), and $w(T') = w(T) - w(e') + w(e) \le w(T)$ because $w(e) \le w(e')$. So $T'$ is an MST containing $A \cup \{e\}$. If $e$ is the unique lightest crossing edge and some MST $T$ omits it, the same exchange gives $w(T') < w(T)$, contradicting minimality, so every MST contains $e$.

(3) Let $e = (u, v)$ be strictly heavier than every other edge of a cycle, and suppose an MST $T$ contains it. Deleting $e$ splits $T$ into two parts, one holding $u$ and one holding $v$. The rest of the cycle is a path from $u$ to $v$, so one of its edges, $e''$, joins the two parts; $T - e + e''$ is a spanning tree lighter than $T$ because $w(e'') < w(e)$. Contradiction. With ties the claim fails: in a triangle with three equal weights each edge is a maximum on the cycle, yet each MST uses two of them.

(4) Suppose two MSTs $T \ne T'$ exist with distinct weights. Let $e$ be the lightest edge in exactly one of them, say $e \in T \setminus T'$. Adding $e$ to $T'$ closes a cycle, which contains an edge $f \in T' \setminus T$ (otherwise the cycle would lie inside $T$). $f$ is in exactly one tree and is not $e$, so $w(f) > w(e)$ by the choice of $e$ and distinctness. Then $T' + e - f$ is a spanning tree lighter than $T'$: contradiction. Ties need not create a second MST: a graph that is itself a tree has exactly one spanning tree whatever its weights.

(5) Fix a weight $x$ and let $G_{\le x}$ be the subgraph of edges of weight at most $x$, with $c_x$ components. For any MST $T$, the edges of $T$ of weight at most $x$ form a forest in $G_{\le x}$. If this forest did not span $G_{\le x}$, some edge $e$ of $G_{\le x}$ would join two of its trees; the cycle that $e$ closes in $T$ must then use an edge $f$ of $T$ of weight greater than $x \ge w(e)$, and $T - f + e$ would be lighter. So $T$ has exactly $n - c_x$ edges of weight at most $x$, by (1), a number that does not depend on $T$. Since this holds for every $x$, every MST has the same number of edges of each weight.

**GATE use.** MSQs list statements about MST uniqueness and the two properties; the true ones are those with "distinct", "unique lightest" or "strictly heaviest" in them. A question on the $k$-th smallest MST edge weight uses (5). The traps are "equal weights imply several MSTs", the unqualified "the maximum edge of a cycle is in no MST", and forgetting that a disconnected graph has only a spanning forest.

**Check.** All weights equal: the triangle has 3 MSTs, the 4-cycle has 4 (drop any one edge), and the path on 4 vertices has 1. A script enumerated every spanning tree of 1,153 random connected graphs of up to 6 vertices with many tied weights and confirmed, for every instance, uniqueness under distinct weights, one weight multiset across all MSTs, the cut property (some MST, or every MST when the lightest crossing edge was unique) on every cut, and the strict cycle property; on 500 more graphs a maximal forest had $n - c$ edges.

## Kruskal and union-find: correctness and $O(E \log V)$
<!-- topics: algo-graph-algorithms.kruskal -->

**Claim.** Kruskal sorts the edges by weight and accepts each edge whose endpoints lie in different components of the edges accepted so far. On a connected graph the accepted edges form an MST once $n - 1$ are accepted; on a disconnected graph they form a minimum spanning forest. With union by rank and path compression, the at most $2E$ finds and $n - 1$ unions cost $O(E\,\alpha(V))$, and the total running time is dominated by sorting:

$$O(E \log E) = O(E \log V).$$

With the edges already sorted the cost is $O(E\,\alpha(V))$. With union by rank alone, a find costs $O(\log V)$.

**Proof.** Correctness. The accepted set $A$ is always a forest, since an edge is accepted only if it joins two different trees, and an edge inside a tree is rejected because it would close a cycle. Invariant: $A$ is contained in some MST. It holds for $A = \emptyset$. When Kruskal accepts $e = (u, v)$, let $S$ be the tree of $A$ that contains $u$. No edge of $A$ crosses the cut $(S, V \setminus S)$. Every edge lighter than $e$ (or tied with it and earlier in the sorted order) has been examined: either accepted, so it lies in $A$ and does not cross, or rejected because both its ends were in one tree, so again it does not cross. Hence $e$ is a lightest edge crossing the cut, and the cut property (previous section, part 2) keeps $A \cup \{e\}$ inside some MST. A connected graph's MST has $n - 1$ edges, and $A$ keeps growing until it spans every component, so stopping at $n - 1$ acceptances returns the MST; the count of accepted edges is what matters, not the count of edges scanned.

Union by rank. Each root has a rank, a new singleton has rank 0, union makes the root of smaller rank a child of the other, and on equal ranks the new root's rank goes up by 1. A root of rank $r$ has at least $2^r$ nodes in its tree: true for $r = 0$, and rank $r + 1$ arises only by joining two trees of rank $r$, each with at least $2^r$ nodes. So ranks, and the heights they bound, are at most $\log_2 V$, and a find costs $O(\log V)$. Adding path compression brings $m$ operations down to $O(m\,\alpha(n))$, where $\alpha$ is the inverse Ackermann function, at most 4 for any practical $n$; that bound is Tarjan's, proved in CLRS chapter 21, and not reproved here.

Time. Sorting costs $O(E \log E)$. Kruskal does 2 finds per examined edge and $n - 1$ unions, $O(E\,\alpha(V))$, which is smaller. Since $E \le V^2$, $\log E \le 2 \log V$, and for a connected graph $E \ge V - 1$ gives $\log V = O(\log E)$; so $O(E \log E)$ and $O(E \log V)$ are the same class.

**GATE use.** The standard 2-mark NAT asks for the MST weight on a given graph: sort, accept or cross out, stop after $n - 1$ acceptances. With ties the edge set may vary but the weight does not. Complexity MCQs ask for Kruskal's time with or without pre-sorted edges ($O(E \log E)$ against $O(E\,\alpha(V))$). The trap is assuming the partial result is a tree: it is a forest until the end.

**Check.** On $AB = 4$, $AC = 1$, $BC = 3$, $BD = 2$, $CD = 5$, $CE = 7$, $DE = 6$, $DF = 9$, $EF = 8$: accept $AC$ 1, $BD$ 2, $BC$ 3, reject $AB$ 4 and $CD$ 5, accept $DE$ 6, reject $CE$ 7, accept $EF$ 8 and stop with 5 edges: weight $1 + 2 + 3 + 6 + 8 = 20$; enumeration of all spanning trees found this to be the only MST. A script matched Kruskal's weight with brute force on random connected graphs with tied weights, and checked on 300 random union sequences of up to 200 elements that a root of rank $r$ had at least $2^r$ nodes and $r \le \log_2 n$.

## Prim: one growing tree, and why the array beats the heap on dense graphs
<!-- topics: algo-graph-algorithms.prim -->

**Claim.** Prim starts from a vertex $r$ with tree $S = \{r\}$ and repeatedly adds the lightest edge with exactly one end in $S$, together with its outside end. On a connected graph the result is an MST; on a disconnected graph it spans only $r$'s component. Keeping for each outside vertex $v$ a key $\mathrm{key}[v]$, the weight of its cheapest edge into $S$, the running time is

$$O(E \log V)\ \text{(binary heap)}, \qquad O(E + V \log V)\ \text{(Fibonacci heap)}, \qquad O(V^2)\ \text{(adjacency matrix and an array of keys)}.$$

For dense graphs, $E = \Theta(V^2)$, the array version is the fastest of the three asymptotically together with the Fibonacci heap, and beats the binary heap's $\Theta(V^2 \log V)$.

**Proof.** Correctness. Invariant: the chosen edges, a tree on $S$, lie in some MST. Each step picks a lightest edge crossing the cut $(S, V \setminus S)$, and no chosen edge crosses that cut because all of them lie inside $S$, so the cut property keeps the invariant. After $n - 1$ steps $S = V$ and the tree is an MST. The partial result is always one connected tree, unlike Kruskal's forest, so every Prim edge touches the current tree; this is what tells a Prim order from a Kruskal order. If $G$ is disconnected, no edge crosses the cut once $S$ is $r$'s component, and Prim stops there.

Time. The keys realise "lightest edge leaving $S$": the lightest such edge is $\min_v \mathrm{key}[v]$. When $u$ joins $S$, only the keys of $u$'s neighbours can drop, so the algorithm scans $u$'s list and lowers $\mathrm{key}[v]$ to $w(u, v)$ where smaller. Over the run this is $V$ extract-min operations and at most $E$ decrease-key operations (each list entry once; $2E$ entries for undirected lists, which is still $O(E)$). A binary heap does each in $O(\log V)$: $O((V + E)\log V) = O(E \log V)$ for a connected graph, where $E \ge V - 1$. A Fibonacci heap does extract-min in $O(\log V)$ amortised and decrease-key in $O(1)$ amortised: $O(V \log V + E)$. With an array, extract-min scans all $V$ keys, $O(V^2)$ in total, and each decrease-key is $O(1)$; with a matrix, scanning $u$'s row costs $V$, so $V^2$ again. For $E = \Theta(V^2)$, the binary heap costs $\Theta(V^2 \log V)$ against $\Theta(V^2)$ for the array.

**GATE use.** MCQs ask for the order in which Prim adds edges from a given start: track $S$ and the frontier, and reject any option whose next edge does not touch $S$. Complexity MCQs pair the data structure with the bound and ask which is best for dense or sparse graphs. The traps are reading a Kruskal order as a Prim order and quoting $O(E \log V)$ as the best bound for a dense graph.

**Check.** On the graph of the Kruskal section, starting at $A$: $\{A\}$ takes $AC$ 1; $\{A, C\}$ sees $AB$ 4, $BC$ 3, $CD$ 5, $CE$ 7 and takes $BC$; $\{A, B, C\}$ takes $BD$ 2; $\{A, B, C, D\}$ takes $DE$ 6 over $CE$ 7 and $DF$ 9; then $EF$ 8. Order $AC, BC, BD, DE, EF$, weight 20, the same edges Kruskal takes in the order $AC, BD, BC, DE, EF$. For a complete graph on $V = 1024$ vertices, $E \log_2 V = 523{,}776 \cdot 10 \approx 5.24 \times 10^6$ against $V^2 \approx 1.05 \times 10^6$. A script matched Prim's weight with brute force on random connected graphs and reproduced both edge orders.

## Dijkstra: the settled-vertex invariant and why a negative edge breaks it
<!-- topics: algo-graph-algorithms.dijkstra -->

**Claim.** Let every edge weight be non-negative, $s$ the source, and $\delta(v)$ the shortest-path distance. Dijkstra sets $d[s] = 0$, $d[v] = \infty$ otherwise, and repeatedly extracts the unsettled vertex $u$ with the smallest $d[u]$, settles it, and relaxes each out-edge:

$$d[v] \leftarrow \min\bigl(d[v],\ d[u] + w(u,v)\bigr).$$

When $u$ is extracted, $d[u] = \delta(u)$. The running time is $O((V + E)\log V)$ with a binary heap, $O(V^2)$ with an array and $O(E + V \log V)$ with a Fibonacci heap. With a negative edge the invariant can fail, and adding the same constant to every edge does not repair it.

**Proof.** Two facts about relaxation hold for any weights. Each $d[v]$ is either $\infty$ or the length of some path from $s$ to $v$ (relaxation extends a path to $u$ by an edge), so $d[v] \ge \delta(v)$ always. And if a shortest path ends with the edge $(x, v)$, $d[x] = \delta(x)$, and $(x, v)$ is relaxed afterwards, then $d[v] = \delta(v)$ from then on.

Invariant (CLRS's proof). Suppose $u$ is the first vertex extracted with $d[u] > \delta(u)$; then $u \ne s$ and $u$ is reachable. Take a shortest path from $s$ to $u$ and let $y$ be its first vertex not yet settled, $x$ the vertex before $y$. $x$ is settled, so $d[x] = \delta(x)$ by the choice of $u$, and $(x, y)$ was relaxed when $x$ was settled, so $d[y] = \delta(y)$. Because all weights are non-negative and $y$ lies on a shortest path to $u$, $\delta(y) \le \delta(u)$. Then

$$d[y] = \delta(y) \le \delta(u) < d[u],$$

so the algorithm would have extracted $y$ before $u$, a contradiction. The non-negativity enters only in $\delta(y) \le \delta(u)$: the rest of the path from $y$ to $u$ costs at least 0.

Time. Each vertex is extracted once and its out-edges relaxed once, so there are $V$ extract-min operations and at most $E$ decrease-key operations. A binary heap does both in $O(\log V)$: $O((V + E)\log V)$. An unsorted array does extract-min in $O(V)$ and decrease-key in $O(1)$: $O(V^2 + E) = O(V^2)$. A Fibonacci heap does extract-min in $O(\log V)$ and decrease-key in $O(1)$, amortised: $O(E + V \log V)$. On a dense graph the binary heap gives $\Theta(V^2 \log V)$, so the array is better; on a sparse graph the heap wins.

Negative edges. If $(b, a)$ has negative weight, $\delta(y) \le \delta(u)$ can fail: a vertex $a$ can be settled with $d[a] > \delta(a)$ while a cheaper path through a later vertex $b$ exists. Even if the later relaxation of $(b, a)$ lowers $d[a]$, $a$'s out-edges are not relaxed again, so its successors keep stale values. Adding a constant $c$ to every edge adds $kc$ to a path of $k$ edges, so it penalises paths with more edges and can change which path is shortest, as the check below shows.

**GATE use.** The 2-mark NAT traces Dijkstra on a small digraph and asks for a distance or the extraction order; tabulate $d[\,]$ and extract the minimum each round. MCQs pair the data structure with the bound, and the dense-graph trap prefers $O((V + E)\log V)$ over $O(V^2)$. A third form gives a graph with a negative edge and asks what Dijkstra reports; settle in order and do not re-relax settled vertices.

**Check.** On $s \to a$ 4, $s \to b$ 1, $b \to a$ 2, $b \to c$ 5, $b \to d$ 8, $a \to c$ 1, $a \to d$ 2, $c \to t$ 3, $d \to t$ 1, the extraction order is $s, b, a, c, d, t$ with distances 0, 1, 3, 4, 5, 6: $\delta(t) = 6$ along $s \to b \to a \to d \to t$. On $s \to a$ 2, $s \to b$ 4, $b \to a$ $-3$, $a \to c$ 1 the order is $s$ (0), $a$ (2), $c$ (3), $b$ (4); Dijkstra reports $d[c] = 3$, while Bellman-Ford gives $\delta(a) = 1$ and $\delta(c) = 2$. On $s \to t$ 1, $s \to a$ 2, $a \to t$ $-2$, $\delta(t) = 0$ through $a$; adding 2 to every edge makes the direct edge (3) beat the path through $a$ (4). A script compared Dijkstra with brute force over simple paths on 1,500 random digraphs with weights 0 to 9.

## Path relaxation: Bellman-Ford, negative cycles and DAG shortest paths
<!-- topics: algo-graph-algorithms.bellman-ford, algo-graph-algorithms.dag-unweighted-sp -->

**Claim.** Let $G$ have arbitrary real weights and no negative cycle reachable from $s$.

1. Path-relaxation property: if $s = v_0, v_1, \dots, v_k$ is a shortest path and the edges $(v_0, v_1), (v_1, v_2), \dots, (v_{k-1}, v_k)$ are relaxed in that order, possibly with other relaxations interleaved, then afterwards $d[v_k] = \delta(v_k)$.
2. Bellman-Ford relaxes every edge in each of $V - 1$ passes, $O(VE)$ time. After pass $i$, every vertex with a shortest path of at most $i$ edges has its final distance; $V - 1$ passes suffice, and a pass that changes nothing allows an early stop (best case one productive pass plus one quiet pass, $O(E)$).
3. If a negative cycle is reachable from $s$, some edge can still be relaxed after $V - 1$ passes; if none is reachable, no edge can.
4. On a DAG, relaxing the out-edges of each vertex in topological order gives all shortest distances in $O(V + E)$, negative weights allowed; negating every weight turns this into longest paths.

**Proof.** (1) Induction on $j$: after $(v_{j-1}, v_j)$ is relaxed, $d[v_j] = \delta(v_j)$. For $j = 0$, $d[s] = 0 = \delta(s)$, which holds because no negative cycle makes $\delta(s) < 0$. If $d[v_{j-1}] = \delta(v_{j-1})$ when $(v_{j-1}, v_j)$ is relaxed, then $d[v_j] \le \delta(v_{j-1}) + w(v_{j-1}, v_j) = \delta(v_j)$, the last step because a prefix of a shortest path is shortest. With $d \ge \delta$ always (previous section), equality holds, and values never rise afterwards.

(2) A vertex $v$ whose shortest path has $k \le i$ edges: pass 1 relaxes the first edge, pass 2 the second, and so on, so by (1) $d[v] = \delta(v)$ after pass $k$. With no negative cycle reachable, every reachable vertex has a shortest path that is simple (removing a cycle of weight at least 0 does not lengthen it), and a simple path has at most $V - 1$ edges. Each pass is $E$ relaxations, so $(V - 1) \cdot E = O(VE)$. If a pass changes nothing, later passes see the same $d$ values and change nothing either, so stopping is safe. Nothing stronger is guaranteed: with the edges listed in the worst order, pass $i$ finalises only the vertices at $i$ edges.

(3) Suppose a negative cycle $v_0, v_1, \dots, v_k = v_0$ is reachable, so all its $d$ values are finite after $V - 1$ passes, and suppose no edge can be relaxed: $d[v_j] \le d[v_{j-1}] + w(v_{j-1}, v_j)$ for $j = 1, \dots, k$. Summing around the cycle, each $d[v_j]$ appears once on each side and cancels, leaving $0 \le \sum_j w(v_{j-1}, v_j)$, which contradicts the negative weight. So one more pass would still lower some $d$. If no negative cycle is reachable, (2) shows every $d$ is final after $V - 1$ passes, so no edge can be relaxed.

(4) In a topological order every path visits its vertices in order, so for a shortest path $v_0, \dots, v_k$ the out-edges of $v_0$, then of $v_1$, and so on are relaxed in path order, and (1) applies. A DAG has no cycles at all, so no negative cycle and the weights may be negative. Topological sort and one relaxation per edge cost $O(V + E)$. Negating every weight turns the longest path into the shortest one, still with no cycle, which is critical-path scheduling. In a general graph, negation would create negative cycles from positive ones, and longest simple path is NP-hard.

**GATE use.** MCQs ask what is guaranteed after pass $i$ (shortest paths with at most $i$ edges), why $V - 1$ passes, and what a $V$-th improving pass means (a reachable negative cycle). Algorithm-choice MCQs: a DAG with negative edges calls for topological relaxation in $O(V + E)$, where Bellman-Ford and Floyd-Warshall are also correct but slower and Dijkstra is not safe. The trap is believing pass $i$ fixes "the $i$ closest vertices".

**Check.** The chain $0 \to 1 \to 2 \to 3 \to 4$ of unit edges, with the edges listed in reverse order, leaves $d[4] = \infty$ until pass 4, when it becomes 4; with the edges in path order, one pass finds every distance and the second changes nothing. On $s \to x$ 1, $x \to y$ $-2$, $y \to x$ 1 (cycle weight $-1$), the two passes give $d[x] = -1$, $d[y] = -2$, and $x \to y$ can still be relaxed to $-3$. Topological relaxation in the order $s, b, a, c$ on $s \to a$ 2, $s \to b$ 4, $b \to a$ $-3$, $a \to c$ 1 gives 0, 4, 1, 2. Longest paths on $S \to A$ 3, $S \to B$ 2, $A \to C$ 4, $B \to C$ 6, $C \to T$ 1, $A \to T$ 2 give $C = 8$ and $T = 9$ (along $S, B, C, T$). Scripts compared Bellman-Ford with brute force on 1,083 random digraphs without negative cycles, checked after every pass that $d[v]$ was at most the best walk of at most $i$ edges, checked negative-cycle detection on 600 more, and compared DAG relaxation (shortest and, negated, longest) with exhaustive path search on 1,500 random DAGs.

## Floyd-Warshall and Johnson: all-pairs shortest paths
<!-- topics: algo-graph-algorithms.floyd-warshall -->

**Claim.** Number the vertices $1, \dots, n$ and assume no negative cycle. Let $d_k[i][j]$ be the length of a shortest path from $i$ to $j$ whose intermediate vertices all lie in $\{1, \dots, k\}$, with $d_0$ the weight matrix (0 on the diagonal, $\infty$ for non-edges). Then

$$d_k[i][j] = \min\bigl(d_{k-1}[i][j],\ d_{k-1}[i][k] + d_{k-1}[k][j]\bigr),$$

and $d_n$ is the distance matrix. The loop over $k$ must be outermost, the update can be done in one matrix in place, and the algorithm takes $\Theta(V^3)$ time and $O(V^2)$ space. If negative cycles are allowed and there are no self-loops, some diagonal entry ends negative exactly when the graph has one. Johnson's reweighting $w'(u, v) = w(u, v) + h(u) - h(v)$, with $h(v)$ the Bellman-Ford distance from an added vertex $q$ joined to every vertex by weight-0 edges, makes every weight non-negative and keeps every shortest path shortest; $V$ Dijkstra runs then give all pairs in $O(VE + V^2 \log V)$ with Fibonacci heaps.

**Proof.** Recurrence. Take a shortest $i$-to-$j$ path with intermediates in $\{1, \dots, k\}$; with no negative cycle it can be taken simple. If $k$ is not on it, its intermediates lie in $\{1, \dots, k-1\}$ and its length is $d_{k-1}[i][j]$. If $k$ is on it, exactly once, it splits at $k$ into an $i$-to-$k$ path and a $k$-to-$j$ path, each with intermediates in $\{1, \dots, k - 1\}$ and each shortest of its kind, of lengths $d_{k-1}[i][k]$ and $d_{k-1}[k][j]$. The minimum of the two cases is $d_k[i][j]$. With $k = n$ every vertex may be an intermediate.

Loop order. Phase $k$ reads $d_{k-1}[i][k]$ and $d_{k-1}[k][j]$ for all $i$, $j$, so every pair must have finished phase $k - 1$ before any pair starts phase $k$; that is what an outermost $k$ loop guarantees. With $k$ innermost, $d[i][j]$ is finalised in one visit using values of other entries that may not be computed yet, and a path that needs two intermediates in the wrong order is missed. In place: during phase $k$ the entries of row $k$ and column $k$ do not change, because $d[i][k] + d[k][k] = d[i][k]$ when $d[k][k] = 0$ (no negative cycle). So reading an entry already updated in this phase reads the same value as the old matrix, and one $n \times n$ matrix suffices. Three nested loops of $n$ give $n^3$ updates.

Negative cycles. Every entry is always the length of some walk, so a negative $d[i][i]$ means a negative closed walk, which contains a negative cycle. Conversely, let $C$ be a negative simple cycle, $k$ its highest-numbered vertex and $i \ne k$ another vertex on it. The two arcs of $C$ from $i$ to $k$ and from $k$ to $i$ have all intermediates below $k$, so after phase $k - 1$ the entries $d[i][k]$ and $d[k][i]$ are at most their lengths, and phase $k$ sets $d[i][i] \le d[i][k] + d[k][i] \le w(C) < 0$.

Johnson. For a path $p = v_0, \dots, v_m$, the reweighted length telescopes:

$$w'(p) = \sum_{j=1}^{m} \bigl(w(v_{j-1}, v_j) + h(v_{j-1}) - h(v_j)\bigr) = w(p) + h(v_0) - h(v_m),$$

so every path from $u$ to $v$ shifts by the same $h(u) - h(v)$ and the shortest ones stay shortest; afterwards $\delta(u, v) = \delta'(u, v) - h(u) + h(v)$. With $h(v) = \delta(q, v)$, the triangle inequality $\delta(q, v) \le \delta(q, u) + w(u, v)$ gives $w'(u, v) \ge 0$, so Dijkstra is valid. The cost is one Bellman-Ford, $O(VE)$, plus $V$ Dijkstra runs at $O(E + V \log V)$ each: $O(VE + V^2 \log V)$, better than $V^3$ on sparse graphs. With binary heaps, and likewise for $V$ plain Dijkstra runs on a graph without negative edges, it is $O(VE \log V)$.

**GATE use.** MCQs ask which loop must be outermost, the time and space ($\Theta(V^3)$, $O(V^2)$), or what $d[i][i] < 0$ means. Fill-in questions give a $4 \times 4$ matrix and ask for an entry after phase $k$. Algorithm-choice questions compare $V^3$ with $VE \log V$ or Johnson for sparse graphs. The trap is the inner-$k$ order, which looks plausible and is wrong.

**Check.** Edges $1 \to 3$, $3 \to 4$, $4 \to 2$, each of weight 1: with $k$ outermost $d[1][2] = 3$; with $k$ innermost $d[1][2]$ is computed while $d[3][2]$ and $d[1][4]$ are still $\infty$, and stays $\infty$. Johnson on $s \to a$ 2, $s \to b$ 4, $b \to a$ $-3$, $a \to c$ 1 gives $h = (0, -3, 0, -2)$ for $(s, a, b, c)$ and reweighted edges $s \to a$ 5, $s \to b$ 4, $b \to a$ 0, $a \to c$ 0; Dijkstra from $s$ finds $\delta'(a) = 4$ via $s \to b \to a$, so $\delta(a) = 4 - 0 + (-3) = 1$, and $\delta'(c) = 4$ gives $\delta(c) = 4 - 0 + (-2) = 2$. Scripts checked on 3,000 random digraphs with negative weights that in-place $k$-outer Floyd-Warshall equals the layered version and brute force whenever no negative cycle exists, that a negative diagonal entry appears exactly when one does, and that on 800 more Johnson's weights are non-negative and give the true distances.

## Articulation points and bridges from DFS low values
<!-- topics: algo-graph-algorithms.articulation-bridges, algo-graph-algorithms.dfs -->

**Claim.** Run DFS on a connected undirected graph, recording $\mathrm{disc}[v]$ and

$$\mathrm{low}[v] = \min\bigl(\mathrm{disc}[v],\ \min_{(v,w)\,\text{back}} \mathrm{disc}[w],\ \min_{c\,\text{child}} \mathrm{low}[c]\bigr),$$

the smallest discovery time reachable from $v$'s subtree by tree edges down and at most one back edge up. Then:

1. A non-root vertex $v$ is an articulation point if and only if some DFS child $c$ has $\mathrm{low}[c] \ge \mathrm{disc}[v]$.
2. The root is an articulation point if and only if it has at least two DFS children.
3. A tree edge $(u, v)$, $v$ the child, is a bridge if and only if $\mathrm{low}[v] > \mathrm{disc}[u]$; back edges are never bridges, and no edge on a cycle is a bridge.
4. An endpoint of a bridge is an articulation point unless its degree is 1.

All of it takes one DFS, $O(V + E)$.

**Proof.** Undirected DFS produces only tree and back edges (third section, part 5), and a back edge always joins a vertex to one of its ancestors. So an edge leaving the subtree $T_c$ of a vertex $c$ goes either to $c$'s parent (the tree edge) or, as a back edge, to a proper ancestor of $c$; there are no edges between the subtrees of two different children. By induction up the tree, $\mathrm{low}[c]$ is the smallest $\mathrm{disc}$ among the vertices of $T_c$ and the ancestors that $T_c$ reaches by one back edge.

(1) Let $v$ be a non-root with child $c$. Removing $v$ leaves $T_c$ joined to the rest only by back edges from $T_c$ to proper ancestors of $v$, the only edges out of $T_c$ other than those into $v$. Such an edge exists exactly when $T_c$ reaches a vertex with $\mathrm{disc}$ smaller than $\mathrm{disc}[v]$, that is $\mathrm{low}[c] < \mathrm{disc}[v]$. If this holds for every child, each child's subtree stays attached to $v$'s parent's side, which is connected, so $v$ is not a cut vertex. If some child has $\mathrm{low}[c] \ge \mathrm{disc}[v]$, $T_c$ is cut off from the parent's side once $v$ goes.

(2) The root has no ancestors, so the test in (1) would always fire; instead note that the subtrees of different children have no edges between them, so with two or more children removing the root disconnects them, and with one child the rest is that single subtree, which is connected.

(3) Removing the tree edge $(u, v)$ separates $T_v$ from the rest unless some back edge leaves $T_v$ for $u$ or a proper ancestor of $u$, that is unless $\mathrm{low}[v] \le \mathrm{disc}[u]$. The test is strict, unlike (1): a back edge from $T_v$ to $u$ itself keeps $T_v$ attached when only the edge $(u, v)$ is removed, but not when the vertex $u$ is. A back edge $(x, y)$ with the tree path from $y$ down to $x$ lies on a cycle, and removing an edge of a cycle leaves its endpoints joined by the rest of the cycle, so no cycle edge is a bridge.

(4) If $\{u, v\}$ is a bridge and $\deg u \ge 2$, $u$ has a neighbour $x \ne v$. Every path from $x$ to $v$ uses the bridge and therefore passes through $u$, so removing $u$ separates $x$ from $v$.

**GATE use.** MSQs list vertices or edges and ask which are articulation points or bridges. For small graphs, spot cycles first (no cycle edge is a bridge) and test by deletion; for larger ones, run DFS and apply the tests. The traps are applying (1) to the root, and using $\ge$ for bridges, which marks cycle edges whose lower end has a back edge to its parent's level.

**Check.** On 1–2, 2–3, 3–1, 3–4, 4–5, 5–6, 6–4, 6–7, DFS from 1 discovers 1 to 7 in order, with back edges 3–1 and 6–4, and $\mathrm{low} = (1, 1, 1, 4, 4, 4, 7)$. Vertex 3 has child 4 with $\mathrm{low}[4] = 4 \ge 3$, vertex 4 has child 5 with $4 \ge 4$, and vertex 6 has child 7 with $7 \ge 6$: cut vertices 3, 4, 6. Vertex 5's child 6 has $\mathrm{low} = 4 < 5$, vertex 2's child 3 has $1 < 2$, and the root 1 has one child, so 1, 2, 5 and 7 are not. Bridges: $(3, 4)$ with $4 > 3$ and $(6, 7)$ with $7 > 6$; $(4, 5)$ fails $4 > 4$ and would wrongly pass with $\ge$. A script compared both tests with deletion by brute force on 3,000 random graphs of up to 9 vertices, and checked (4) on every bridge found.
