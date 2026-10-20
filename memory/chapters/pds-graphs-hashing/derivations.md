# Graphs and hashing: derivations

## Degree sums, edge bounds and forests
<!-- topics: pds-graphs-hashing.terminology, pds-graphs-hashing.graph-counting -->

**Claim.** Let $G = (V, E)$ be a graph with $n = \lvert V \rvert$ vertices.

1. If $G$ is undirected, $\sum_{v} \deg(v) = 2\lvert E \rvert$ (a self-loop counts 2 towards the degree of its vertex), so the number of odd-degree vertices is even. If $G$ is directed, $\sum_v \mathrm{in}(v) = \sum_v \mathrm{out}(v) = \lvert E \rvert$.
2. A simple undirected graph has at most $\binom{n}{2} = n(n-1)/2$ edges and a simple directed graph at most $n(n-1)$. There are exactly $2^{\binom{n}{2}}$ labelled simple undirected graphs on a fixed vertex set of size $n$.
3. A tree on $n$ vertices has $n - 1$ edges, a forest with $c$ components has $n - c$ edges, and any graph with $n$ vertices and $c$ components has at least $n - c$ edges.

**Proof.** (1) Count the incidences, the pairs (vertex, edge) with the vertex an endpoint of the edge. Grouped by vertex the count is $\sum_v \deg(v)$; grouped by edge it is $2\lvert E \rvert$, because every edge has two endpoints (a loop is counted twice at its one vertex, which is the stated convention). Split the degree sum into odd and even terms: the even terms and $2\lvert E \rvert$ are even, so the sum of the odd terms is even, and a sum of odd numbers is even only when it has an even number of terms. In a directed graph each edge has one tail and one head, so it adds 1 to exactly one out-degree and one in-degree.

(2) In a simple undirected graph an edge is a 2-element subset of $V$ and distinct edges are distinct subsets, so there are at most $\binom{n}{2}$. In a simple directed graph an edge is an ordered pair $(u, v)$ with $u \ne v$: $n$ choices for $u$ and $n - 1$ for $v$. A labelled simple graph is determined by which of the $\binom{n}{2}$ possible edges it contains, and every subset gives a graph, so graphs and subsets are in bijection and there are $2^{\binom{n}{2}}$.

(3) A tree with $n \ge 2$ vertices has a leaf: the last vertex of a longest path has no neighbour off the path (the path would extend) and no neighbour on it other than its predecessor (that would close a cycle). Deleting a leaf and its edge leaves a tree on $n - 1$ vertices, so induction from the one-vertex tree (0 edges) gives $n - 1$ edges. A forest whose components have $n_1, \dots, n_c$ vertices has $\sum_i (n_i - 1) = n - c$ edges. For the lower bound, build $G$ by starting from $n$ isolated vertices ($n$ components) and adding the edges one at a time. An edge joins two components or lies inside one, so each edge lowers the component count by at most 1; reaching $c$ components takes at least $n - c$ edges.

**GATE use.** The handshake lemma settles "can this degree sequence exist" in one direction only (odd sum: no) and "how many entries do the adjacency lists hold" ($2\lvert E \rvert$ undirected, $\lvert E \rvert$ directed). The traps are counting each undirected edge once in the lists, and reading an even sum as "yes": parity is necessary, not sufficient, for a simple graph, which also needs Havel–Hakimi (or the Erdős–Gallai inequalities). Counting graphs on labelled vertices is $2^{n(n-1)/2}$; the trap is confusing labelled with non-isomorphic. The bound $n - c$ answers "fewest edges for a graph with $n$ vertices and $c$ components" and "how many tree edges does the DFS or BFS forest have".

**Check.** The sequence 3, 3, 1 sums to 7 and cannot be a degree sequence; 3, 3, 3, 1 sums to 10 and passes the parity test, yet no simple graph has it: each degree-3 vertex must be adjacent to all three others, so the fourth vertex has degree at least 3 (Havel–Hakimi: remove a 3 to get 2, 2, 0, remove a 2 to get 1, −1). The sequence 3, 3, 2, 2, 2 sums to 12, needs 6 edges, and is realised by 70 labelled simple graphs on 5 vertices. A graph with 10 vertices and 15 edges has 30 adjacency-list nodes. On 4 labelled vertices there are $2^6 = 64$ graphs, and a graph with 7 vertices and 3 components has at least 4 edges. A script enumerated every labelled graph on up to 5 vertices (1, 2, 8, 64 and 1,024 of them) and confirmed the handshake identity, the even count of odd degrees, $\lvert E \rvert = n - c$ for each forest and $\lvert E \rvert \ge n - c$ for every graph.

## Adjacency matrix and adjacency lists: costs and matrix powers
<!-- topics: pds-graphs-hashing.representations, pds-graphs-hashing.adjacency-matrix-properties -->

**Claim.** Take a graph with $V$ vertices and $E$ edges, and let $A$ be its $V \times V$ adjacency matrix, $A_{ij} = 1$ when edge $(i, j)$ exists and 0 otherwise.

1. The matrix uses $\Theta(V^2)$ space, tests an edge in $O(1)$ and lists the neighbours of a vertex in $\Theta(V)$. Adjacency lists use $\Theta(V + E)$ space, test edge $(u, v)$ in $O(\deg u)$ and list the neighbours of $u$ in $\Theta(\deg u)$.
2. For every $k \ge 1$, $(A^k)_{ij}$ is the number of walks of length exactly $k$ (counted in edges, vertices may repeat) from $i$ to $j$.
3. For a simple undirected graph, $(A^2)_{ii} = \deg(i)$ and the number of triangles is $\operatorname{tr}(A^3)/6$.

**Proof.** (1) The matrix has $V^2$ cells whatever $E$ is; reading cell $(u, v)$ is one array access, and finding the neighbours of $u$ means reading all $V$ cells of row $u$. The lists hold one header per vertex and one node per edge end: $\lvert E \rvert$ nodes for a directed graph and $2\lvert E \rvert$ for an undirected one by the handshake lemma, so the space is $\Theta(V + E)$. Testing $(u, v)$ walks $u$'s list, at most $\deg u$ nodes.

(2) Induction on $k$. For $k = 1$, a walk of length 1 from $i$ to $j$ is the edge $(i, j)$, and $A_{ij}$ counts it. Assume the claim for $k$. A walk of length $k + 1$ from $i$ to $j$ is a walk of length $k$ from $i$ to some vertex $t$ followed by the edge $(t, j)$, and $t$ (the second-to-last vertex) is determined by the walk. Splitting by $t$,

$$\#\{\text{walks of length } k+1 \text{ from } i \text{ to } j\} = \sum_{t} (A^k)_{it}\, A_{tj} = (A^{k+1})_{ij}.$$

(3) A closed walk of length 2 from $i$ is $i \to t \to i$ for a neighbour $t$, one per neighbour, so $(A^2)_{ii} = \deg(i)$. A closed walk of length 3 is $i \to a \to b \to i$. With no self-loops, $i \ne a$, $a \ne b$ and $b \ne i$, so $\{i, a, b\}$ is a triangle. Conversely a triangle $\{x, y, z\}$ yields 6 such walks: 3 choices of start vertex times 2 directions. Each closed walk is counted once on the diagonal, at its start vertex, so $\operatorname{tr}(A^3) = 6 \cdot \#\text{triangles}$. The 6 needs simplicity: a self-loop or parallel edge creates closed walks of length 3 that are not triangles.

**GATE use.** Questions ask which representation suits a sparse graph (lists: $E = o(V^2)$), the cost of an edge test or a neighbour scan, and facts read off $A$: symmetric with zero diagonal for a simple undirected graph, row sums are degrees (out-degrees when directed) and column sums in-degrees, and entries of $A^2$ or $A^3$ count walks. The trap is reading $(A^k)_{ij}$ as a count of paths: walks may revisit vertices, so $(A^2)_{ii}$ is the degree, not 0.

**Check.** For $K_4$ every diagonal entry of $A^2$ is 3, the off-diagonal entries of $A^2$ are 2 (two middle vertices for each pair), and $\operatorname{tr}(A^3) = 24$, so there are $24/6 = 4 = \binom{4}{3}$ triangles. A script compared $(A^k)_{ij}$ with a brute-force count of walks for $k = 1, 2, 3$ on 200 random graphs of up to 6 vertices and confirmed $(A^2)_{ii} = \deg(i)$ and $\operatorname{tr}(A^3) = 6 \cdot$ (triangles) on each.

## BFS: cost, valid orders and components
<!-- topics: pds-graphs-hashing.bfs, pds-graphs-hashing.representations -->

**Claim.** BFS from $s$ keeps a FIFO queue, marks a vertex visited when it is enqueued, and on each dequeue of $u$ enqueues every unvisited neighbour of $u$.

1. Every vertex reachable from $s$ is enqueued exactly once, and no other vertex is.
2. On adjacency lists the running time is $O(V + E)$; on an adjacency matrix it is $\Theta(V^2)$ once every vertex is visited (for instance with restarts over all components).
3. A sequence starting at $s$ is a BFS order (for some ordering of each adjacency list) exactly when it can be cut into consecutive blocks such that, processing the vertices in sequence order, the block of $u$ is precisely the set of neighbours of $u$ not in any earlier block, in any order.
4. Restarting BFS from each still-unvisited vertex visits one connected component per restart, so the restarts count the components of an undirected graph.

**Proof.** (1) A vertex is marked at the moment it is enqueued and only unmarked vertices are enqueued, so none enters twice. Only neighbours of dequeued vertices are enqueued, so every enqueued vertex is reachable. If some reachable vertex were never enqueued, take one, $v$, whose shortest path $s = v_0, \dots, v_r = v$ is shortest among such; $v_{r-1}$ was enqueued, hence dequeued (the loop runs until the queue is empty), and its dequeue enqueues $v$ unless $v$ was already marked. Either way $v$ is enqueued, a contradiction.

(2) Each enqueued vertex is dequeued once and its neighbours are scanned once. With lists the scans cost $\sum_u \deg(u) = 2E$ (or $E$ directed) plus $O(1)$ per vertex for the queue, which is $O(V + E)$. With a matrix each dequeue reads a whole row of $V$ cells, so visiting all $V$ vertices costs $V \cdot V = \Theta(V^2)$, whatever $E$ is.

(3) The output order is the enqueue order, and since the queue is FIFO it is also the dequeue order. When $u$ is dequeued, its unvisited neighbours are appended as one contiguous group, in the order of $u$'s list. So a BFS order has the block structure. Conversely, given a sequence with the block structure, order each list so that the block of $u$ comes in the given order; BFS then reproduces the sequence block by block. Reading off a candidate: dequeue vertices in sequence order, and check that the next $k$ vertices of the sequence are exactly the $k$ unvisited neighbours of the vertex being dequeued.

(4) By (1), BFS from $s$ visits exactly the vertices reachable from $s$, which in an undirected graph is the component of $s$. A restart begins at a vertex no earlier BFS reached, so it lies in a new component, and every component gets exactly one restart.

**GATE use.** "Which of these is a valid BFS order" (MSQ, 2 marks): check that the order is non-decreasing in distance and that the children of an earlier-dequeued vertex all come before those of a later one. The trap is accepting an order that is level-correct but interleaves blocks. Cost questions: $\Theta(V^2)$ on a matrix even for a sparse graph.

**Check.** For the graph with edges A–B, A–C, B–D, C–D, C–E, D–F, E–F, exhaustive enumeration over all list orderings gives exactly three BFS orders from A: A B C D E F, A C B D E F and A C B E D F. A B C E D F is level-correct but invalid: B is dequeued first and enqueues D before C can enqueue E. The lists of this graph hold $2 \cdot 7 = 14$ entries, which is the scan work, against $6^2 = 36$ matrix cells. A script checked the block rule against exhaustive enumeration of all orders on 150 random graphs.

## BFS levels: shortest paths and bipartiteness
<!-- topics: pds-graphs-hashing.bfs-levels, pds-graphs-hashing.terminology -->

**Claim.** In BFS from $s$ set $d(s) = 0$ and $d(v) = d(u) + 1$ when $v$ is enqueued while $u$ is dequeued. Let $\delta(v)$ be the least number of edges on a path from $s$ to $v$.

1. $d(v) = \delta(v)$ for every reachable $v$.
2. In an undirected graph every edge $(u, v)$ between reachable vertices has $\lvert d(u) - d(v) \rvert \le 1$. In a directed graph only $d(v) \le d(u) + 1$ holds.
3. A connected undirected graph is bipartite exactly when no edge joins two vertices of the same BFS level, and exactly when it has no odd cycle.
4. With unequal positive edge weights, BFS levels are not shortest weighted distances.

**Proof.** (1) This is the argument of CLRS 22.2. First $d(v) \ge \delta(v)$: following the vertices that enqueued $v$, then its enqueuer, and so on, gives a path from $s$ of $d(v)$ edges. Next, the queue invariant: if the queue holds $v_1, \dots, v_r$ from head to tail, then $d(v_1) \le d(v_2) \le \dots \le d(v_r) \le d(v_1) + 1$. It holds for the queue $[s]$. A dequeue removes $v_1$, and the new head $v_2$ has $d(v_2) \ge d(v_1)$, so the bound only loosens. An enqueue during the processing of $v_1$ appends $d(v_1) + 1$, which is at least $d(v_r)$ and at most the new head's value plus 1. So vertices are dequeued in non-decreasing $d$. Now suppose some $v$ has $d(v) > \delta(v)$, and pick one with the least $\delta(v)$. Let $u$ precede $v$ on a shortest path, so $\delta(u) = \delta(v) - 1$ and, by minimality, $d(u) = \delta(u)$. When $u$ is dequeued: if $v$ is unvisited, it gets $d(v) = d(u) + 1 = \delta(v)$; if $v$ was enqueued earlier, it was enqueued while some $w$ dequeued no later than $u$ was being processed, so $d(v) = d(w) + 1 \le d(u) + 1 = \delta(v)$. Both contradict $d(v) > \delta(v)$.

(2) An edge gives $\delta(v) \le \delta(u) + 1$, since a shortest path to $u$ extends by the edge. In an undirected graph the edge also works backwards, giving $\delta(u) \le \delta(v) + 1$; with (1) this is $\lvert d(u) - d(v) \rvert \le 1$. In a directed graph an edge can lead from a far vertex back to $s$, with $d(u) - d(v)$ as large as $V - 1$.

(3) If no edge joins two vertices of one level, every edge joins adjacent levels by (2), so colouring even levels one colour and odd levels the other is a proper 2-colouring. If some edge $(u, v)$ has $d(u) = d(v) = k$, follow the BFS-tree paths from $u$ and $v$ up to their deepest common ancestor $w$ at level $j < k$. The two tree paths have $k - j$ edges each and share only $w$, so with the edge $(u, v)$ they form a cycle of $2(k - j) + 1$ edges, which is odd. An odd cycle cannot be 2-coloured: colours alternate along it, and after an odd number of steps the start vertex would need the other colour. So a same-level edge forces an odd cycle and non-bipartiteness, and its absence gives a 2-colouring; that proves both equivalences.

(4) Take edges $s \to a$ and $a \to t$ of weight 1 and $s \to t$ of weight 5. BFS puts $t$ at level 1 through the weight-5 edge, but the cheapest path costs 2. Shortest weighted paths need Dijkstra; with weights 0 and 1, a deque that pushes 0-edges to the front keeps the queue monotone in distance, which is 0-1 BFS.

**GATE use.** Unweighted shortest distances, "an edge joins vertices whose levels differ by at most one", and bipartiteness tests. Traps: applying the $\pm 1$ property to a directed graph, calling a graph bipartite after checking only one component, and using BFS for weighted shortest paths.

**Check.** On the graph with edges A–B, A–C, B–D, C–D, C–E, D–F, E–F the levels from A are {A}, {B, C}, {D, E}, {F}. No edge lies inside a level, so the graph is bipartite with sides {A, D, E} and {B, C, F}. Adding D–E puts an edge inside level 2; the tree paths D–B–A and E–C–A meet at A, closing the 5-cycle A–B–D–E–C–A. A script checked on 500 random graphs that BFS levels equal brute-force shortest distances, that $\lvert d(u) - d(v) \rvert \le 1$ on every edge, and that a same-level edge exists exactly when no 2-colouring does.

## DFS: parenthesis theorem, white paths and valid orders
<!-- topics: pds-graphs-hashing.dfs -->

**Claim.** DFS keeps a global clock. Visiting $u$ sets $d[u]$ on entry, recursively visits each still-unvisited neighbour in list order, and sets $f[u]$ on exit; an outer loop restarts from every unvisited vertex.

1. Parenthesis theorem: for any $u \ne v$ the intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are disjoint or nested, and $v$ is a descendant of $u$ in the DFS forest exactly when $d[u] < d[v] < f[v] < f[u]$.
2. White-path theorem: $v$ becomes a descendant of $u$ exactly when, at time $d[u]$, there is a path from $u$ to $v$ through vertices not yet discovered.
3. DFS costs $O(V + E)$ on lists and $\Theta(V^2)$ on a matrix; its stack depth is at most $V$, and $V$ on a path.
4. On an undirected graph with $n$ vertices and $c$ components the DFS forest has $c$ trees and $n - c$ tree edges.
5. A sequence is a DFS order exactly when each next vertex is an unvisited neighbour of the most recently discovered vertex that still has an unvisited neighbour.

**Proof.** (1) This follows CLRS 22.3. Let $d[u] < d[v]$. If $d[v] < f[u]$, then $v$ was discovered while $u$ was on the recursion stack, so $v$ is visited inside $u$'s call and is a descendant of $u$; its call returns before $u$'s does, so $f[v] < f[u]$ and the intervals nest. Otherwise $f[u] < d[v]$ and the intervals are disjoint. The case $d[v] < d[u]$ is symmetric. Descendants are exactly the vertices visited inside $u$'s call, which are the ones with nested intervals.

(2) If $v$ is a descendant, the tree path from $u$ to $v$ consists of vertices discovered after $d[u]$, so it was undiscovered at $d[u]$. Conversely, let a path from $u$ to $v$ be undiscovered at $d[u]$, and suppose some vertex on it does not become a descendant; take the first such, $x$, and its predecessor $w$ on the path, which is $u$ or a descendant, so $f[w] \le f[u]$. Vertex $w$ scans the edge to $x$ before finishing, so $x$ is discovered before $f[w]$, and after $d[u]$ because it was undiscovered then: $d[u] < d[x] < f[w] \le f[u]$. By (1) the interval of $x$ nests inside that of $u$, so $x$ is a descendant, a contradiction.

(3) Each vertex is entered once, because it is visited only when undiscovered and is marked on entry, and on entry its adjacency is scanned once. That is $O(1)$ per vertex plus $\sum_u \deg(u) = O(E)$ with lists, or $V$ cells per vertex with a matrix. The recursion stack holds one tree path, so its depth is at most $V$; on a path graph started at an end it reaches $V$ frames, $V - 1$ edges deep.

(4) Each restart begins at an undiscovered vertex and, by (2), discovers exactly the undiscovered vertices it can reach, which in an undirected graph is the rest of its component; so each tree spans one component and there are $c$ trees. Every vertex except the $c$ roots enters through exactly one tree edge, giving $n - c$.

(5) The gray vertices, discovered but not finished, form the recursion stack. When the top vertex has an unvisited neighbour, the next discovery is one of them (any one, for a suitable list order); when it has none, it finishes and the next vertex below becomes the top. So the next discovered vertex is an unvisited neighbour of the deepest gray vertex that still has one, and every such choice is realised by some list ordering.

**GATE use.** "Which sequences are valid DFS orders" (MSQ): run a stack and reject the first vertex that is not an unvisited neighbour of the top live vertex. The trap is jumping back up while a deeper vertex still has an unvisited neighbour. Also: a DFS tree on $n$ vertices of a connected graph has $n - 1$ edges, the recursion depth is $O(V)$, and the cost on a matrix is $\Theta(V^2)$.

**Check.** On the graph with edges A–B, A–C, B–D, C–D, C–E, D–F, E–F, exhaustive enumeration gives the DFS orders from A as A B D C E F, A B D F E C, A C D B F E, A C D F E B and A C E F D B. A B C D E F fails at C (B still has the unvisited neighbour D, and C is not adjacent to B), and A B D F C E fails at C (F still has E). A script checked the parenthesis theorem and "nested exactly when descendant" on 400 random digraphs, the stack rule against exhaustive enumeration on 150 random graphs, and $n - c$ tree edges on 400 random undirected graphs.

## DFS edge classes and cycle detection
<!-- topics: pds-graphs-hashing.dfs-edge-classes -->

**Claim.** In DFS of a directed graph, classify edge $(u, v)$ by the state of $v$ when $u$ scans it: undiscovered gives a tree edge; discovered but unfinished gives a back edge; finished with $d[u] < d[v]$ gives a forward edge; finished with $d[v] < d[u]$ gives a cross edge. Then

- tree or forward: $d[u] < d[v] < f[v] < f[u]$;
- back: $d[v] \le d[u] < f[u] \le f[v]$ (equality for a self-loop);
- cross: $d[v] < f[v] < d[u] < f[u]$, so a cross edge always points to a vertex that finished earlier.

An undirected DFS has only tree and back edges. A directed graph has a cycle exactly when DFS finds a back edge; an undirected simple graph has a cycle exactly when DFS finds an edge to an ancestor other than the parent.

**Proof.** Tree: $v$ is a child of $u$. Forward: $v$ was discovered after $u$ and has finished while $u$ is still active, so by the parenthesis theorem it lies inside $u$'s interval and is a descendant. Both give the first pattern. Back: the unfinished vertices form the recursion stack, a tree path from a root to $u$, so $v$ is an ancestor of $u$ (or $u$ itself) and $u$'s interval nests in $v$'s. Cross: $v$ is finished and $d[v] < d[u]$, while $u$ is active, so $f[v] <$ the current time $< f[u]$. Intervals with $d[v] < d[u]$ and $f[v] < f[u]$ cannot nest, so they are disjoint, $f[v] < d[u]$.

No edge points from $u$ to a later-discovered vertex that is not a descendant: if $d[u] < d[v]$ and $v$ is discovered when $u$ scans the edge, $v$ was discovered while $u$ was active and is a descendant; if it is undiscovered, the edge becomes a tree edge.

Undirected: let $\{u, v\}$ be an edge with $d[u] < d[v]$. When $u$ is discovered, $v$ is undiscovered and adjacent, so by the white-path theorem $v$ becomes a descendant of $u$. Every edge therefore joins an ancestor and a descendant: it is a tree edge or a back edge, never forward (it would already have been seen from the descendant's side as back) or cross.

Cycles: a back edge $(u, v)$ plus the tree path $v \rightsquigarrow u$ is a cycle. Conversely, in a cycle let $v$ be the first vertex discovered and $u$ its predecessor on the cycle. At $d[v]$ the rest of the cycle is an undiscovered path from $v$ to $u$, so $u$ becomes a descendant of $v$, and when $u$ scans $(u, v)$, $v$ is still active: a back edge. In an undirected graph the tree edge to the parent is seen again from the child's side and must be skipped; a cycle has length at least 3 in a simple graph, so the same argument gives a back edge to a non-parent ancestor.

**GATE use.** Given $d$ and $f$ for the endpoints, name the class: $v$ nested in $u$ is tree or forward, $u$ nested in $v$ is back, disjoint with $v$ earlier is cross, and disjoint with $u$ earlier cannot happen. MSQs on undirected DFS: an option with forward or cross edges is false. Cycle detection is "DFS finds a back edge".

**Check.** DFS of the DAG with edges a→b, a→c, b→d, c→d, c→e, d→f, e→f, lists in alphabetical order, gives a (1, 12), b (2, 7), d (3, 6), f (4, 5), c (8, 11), e (9, 10). Tree edges are a→b, b→d, d→f, a→c and c→e; c→d has $3 < 6 < 8 < 11$ and e→f has $4 < 5 < 9 < 10$, both cross edges pointing to earlier-finished vertices. No back edge, consistent with acyclicity. A script compared the classes with the true ancestor relation on 400 random digraphs, matched "has a back edge" with a brute-force cycle search, and found only tree and back edges in 400 random undirected graphs.

## Topological order: finish times, Kahn and uniqueness
<!-- topics: pds-graphs-hashing.dfs-applications -->

**Claim.** In a DAG:

1. Every edge $(u, v)$ has $f[v] < f[u]$, so listing vertices by decreasing finish time is a topological order.
2. Kahn's algorithm (repeatedly output and delete a vertex of in-degree 0) outputs all vertices exactly when the graph is acyclic, in $O(V + E)$.
3. The topological order is unique exactly when the DAG has a Hamiltonian path.
4. The number of orders satisfies $N(S) = \sum_{x} N(S \setminus \{x\})$ over the vertices $x$ with no in-edge from inside $S$, with $N(\varnothing) = 1$.

**Proof.** (1) A DAG has no back edge (previous section), so each edge is tree, forward or cross, and all three patterns have $f[v] < f[u]$.

(2) A DAG has a vertex of in-degree 0: otherwise walk backwards along in-edges forever, and with finitely many vertices the walk repeats one, which is a cycle. Deleting a vertex keeps the graph acyclic, so Kahn never gets stuck on a DAG. If the graph has a cycle, no cycle vertex can be output first among its cycle (each has an in-edge from the cycle), so the algorithm stops with the cycle left. For the cost, compute all in-degrees in $O(V + E)$, keep the in-degree-0 vertices in a queue, and on deleting $u$ decrement the counter of each out-neighbour; each edge is decremented once.

(3) If $v_1 \to v_2 \to \dots \to v_n$ is a Hamiltonian path, every topological order puts $v_i$ before $v_{i+1}$, which fixes it. Conversely, let the order $v_1, \dots, v_n$ be unique and suppose $v_i \to v_{i+1}$ is not an edge for some $i$. Swapping $v_i$ and $v_{i+1}$ changes only their relative position, and no edge joins them (an edge $v_{i+1} \to v_i$ would violate the original order), so the swap is another valid order, a contradiction. So all consecutive pairs are edges, a Hamiltonian path.

(4) The first vertex of an order of $S$ is a vertex with no in-edge from $S$, and the rest is an order of the remaining set; distinct first choices give distinct orders.

**GATE use.** "How many topological orders" (NAT): fix the forced ends and branch on the in-degree-0 choices. "Which is a topological order" and "decreasing finish time of DFS gives …". The traps are listing by increasing finish time (that is a reverse topological order) and assuming a DAG's order is unique.

**Check.** The DAG with edges a→b, a→c, b→d, c→d, c→e, d→f, e→f has a first and f last, and exactly 5 orders: a b c d e f, a b c e d f, a c b d e f, a c b e d f, a c e b d f. The DFS of the previous section gives the decreasing-finish order a c e b d f, the last of them. There is no Hamiltonian path (b and e are incomparable), matching the order not being unique. A script verified the count by brute force, checked decreasing finish order on 188 random DAGs, and confirmed "unique exactly when Hamiltonian path" on each.

## Hash functions: division, multiplication and universal families
<!-- topics: pds-graphs-hashing.hash-tables, pds-graphs-hashing.hash-functions -->

**Claim.** Let the table have $m$ slots and keys be non-negative integers.

1. Division $h(k) = k \bmod m$ with $m = 2^p$ depends only on the low $p$ bits of $k$. Keys in an arithmetic progression $k_0, k_0 + s, k_0 + 2s, \dots$ hit only $m / \gcd(s, m)$ slots, so a prime $m$ spreads every progression with $s \not\equiv 0$ over all slots.
2. Multiplication $h(k) = \lfloor m (kA \bmod 1) \rfloor$ with $0 < A < 1$ uses the leading bits of the fractional part of $kA$, so $m = 2^p$ is fine.
3. For a prime $p$ larger than every key, the family $h_{a,b}(k) = ((ak + b) \bmod p) \bmod m$ with $1 \le a \le p - 1$, $0 \le b \le p - 1$ is universal: any two distinct keys collide with probability at most $1/m$ over the random choice of $(a, b)$.
4. Because the universe is larger than $m$, collisions are unavoidable, and a hash table keeps no key order.

**Proof.** (1) Write $k = q \cdot 2^p + r$ with $0 \le r < 2^p$; then $k \bmod 2^p = r$, the low $p$ bits. For the progression, $k_0 + is \equiv k_0 + js \pmod m$ exactly when $m \mid (i - j)s$, that is when $(m/g) \mid (i - j)$ with $g = \gcd(s, m)$, because $m/g$ and $s/g$ are coprime. So the slots repeat with period $m/g$ and exactly $m/g$ are hit; for prime $m$ and $m \nmid s$, $g = 1$.

(2) $kA \bmod 1$ is a fraction in $[0, 1)$, and multiplying by $m = 2^p$ and flooring keeps its first $p$ binary digits. Those digits depend on all bits of $k$, because the product $kA$ mixes them, so the power of two does not reduce the slot to a few bits of $k$ as it does in (1).

(3) This is CLRS Theorem 11.5. Fix keys $k \ne \ell$ below $p$ and put $r = (ak + b) \bmod p$, $s = (a\ell + b) \bmod p$. Then $r - s \equiv a(k - \ell) \pmod p$ is non-zero, since $p$ is prime and divides neither factor, so $r \ne s$. The map $(a, b) \mapsto (r, s)$ is invertible, $a = (r - s)(k - \ell)^{-1} \bmod p$ and $b = (r - ak) \bmod p$, so it is a bijection from the $p(p-1)$ pairs with $a \ne 0$ to the $p(p-1)$ ordered pairs $r \ne s$. A random $(a, b)$ therefore gives a uniformly random pair $r \ne s$. For a fixed $r$, the values $s \ne r$ in $\{0, \dots, p - 1\}$ with $s \equiv r \pmod m$ number at most $\lceil p/m \rceil - 1 \le (p - 1)/m$, so the collision probability is at most $\frac{(p-1)/m}{p - 1} = 1/m$.

(4) With $\lvert U \rvert > m$, the pigeonhole principle puts two keys of $U$ in one slot for every $h$. The slot of a key says nothing about its rank, so the minimum, a successor or a range query must scan all $n$ keys and $m$ slots, $O(n + m)$.

**GATE use.** MCQs on why $m$ should be prime and away from a power of 2 (keys with equal low bits, or with a common stride, pile up), what the multiplication method's $A$ is ($(\sqrt5 - 1)/2$ is the usual choice), and what universal hashing guarantees (collision probability $\le 1/m$ per pair, so no fixed input forces the worst case). Hashing loses to a balanced BST for order queries.

**Check.** Keys 3, 19, 35, 51 all give 3 modulo 16; keys 0, 4, 8, … modulo 12 hit only slots 0, 4 and 8, which is $12/\gcd(4, 12) = 3$ slots, and modulo 13 hit all 13. With $A = (\sqrt5 - 1)/2$, $m = 2^{14}$ and $k = 123456$ the multiplication method gives slot 67. For $p = 17$ and $m = 6$ a script enumerated all 272 functions and every pair of keys below 17: the worst collision probability is $2/17 \approx 0.118 \le 1/6$.

## Separate chaining: expected search cost
<!-- topics: pds-graphs-hashing.chaining, pds-graphs-hashing.load-factor -->

**Claim.** Under simple uniform hashing (each key independently lands in each of the $m$ slots with probability $1/m$), with $n$ keys stored, load factor $\alpha = n/m$ and new keys inserted at the head of their chain:

$$U = 1 + \alpha, \qquad S = 1 + \frac{\alpha}{2} - \frac{\alpha}{2n} \approx 1 + \frac{\alpha}{2}.$$

$U$ is the expected cost of an unsuccessful search: 1 for computing the hash plus the whole chain scanned. $S$ is the expected number of keys examined in a successful search for a key chosen uniformly from the $n$ stored; its 1 is the comparison with the key that is found. Both are $\Theta(1 + \alpha)$, $\alpha$ may exceed 1, and the worst case is $\Theta(n)$ with every key in one chain.

**Derivation.** Unsuccessful: the searched key hashes to some slot $j$, and the chain at $j$ has expected length $\sum_{i=1}^{n} \Pr[h(k_i) = j] = n/m = \alpha$ by linearity of expectation. Every key in it is examined, so $U = 1 + \alpha$.

Successful (CLRS 11.2): let $x_i$ be the $i$-th key inserted. With head insertion, the keys in front of $x_i$ in its chain are exactly the keys inserted after it into the same slot. Let $X_{ij}$ indicate $h(x_i) = h(x_j)$, so $\Pr[X_{ij} = 1] = 1/m$. A search for $x_i$ examines $1 + \sum_{j > i} X_{ij}$ keys: those in front of it and then $x_i$ itself. Averaging over $i$ and taking expectations,

$$S = \frac{1}{n}\sum_{i=1}^{n}\Bigl(1 + \sum_{j=i+1}^{n} \frac{1}{m}\Bigr) = 1 + \frac{1}{nm}\sum_{i=1}^{n}(n - i) = 1 + \frac{n(n-1)}{2nm} = 1 + \frac{\alpha}{2} - \frac{\alpha}{2n}.$$

Counting the hash computation as well adds 1 and keeps the cost $\Theta(1 + \alpha)$. Nothing bounds a chain except $n$, so chaining works for any $\alpha$, and when all keys share one slot a search scans $n$ keys.

**GATE use.** Chain-statistics MCQs: hash every key, tally the slots, and read off the longest chain, the empty slots and the average $n/m$. The trap is dividing by the non-empty slots only. Formula NATs: $1 + \alpha$ for a miss, about $1 + \alpha/2$ for a hit; the trap is swapping them, or quoting the open-addressing $1/(1 - \alpha)$ for chaining.

**Check.** Keys 5, 28, 19, 15, 20, 33, 12, 17, 10 modulo 9 give slot counts 0, 3, 1, 1, 0, 1, 2, 0, 1: longest chain 3, three empty slots, average $9/9 = 1$ (the wrong average over the 6 non-empty slots is 1.5). A script enumerated all $m^n$ hash assignments for $(n, m) = (3, 2), (4, 3), (5, 4), (3, 5)$ with head insertion and found the exact average number of keys examined in a successful search equal to $1 + \alpha/2 - \alpha/(2n)$ each time (for $n = 3$, $m = 2$: $1 + 3/4 - 1/4 = 3/2$), and the expected chain length scanned by a miss equal to $\alpha$.

## Open addressing: probe sequences, clustering and tombstones
<!-- topics: pds-graphs-hashing.open-addressing -->

**Claim.** In open addressing a key is stored in the first free slot of its probe sequence $h(k, 0), h(k, 1), \dots$, so $n \le m$.

1. Linear probing $h(k, i) = (h'(k) + i) \bmod m$ has only $m$ distinct probe sequences, and under uniform home slots the next key lengthens a maximal run of $r \le m - 2$ occupied slots with probability at least $(r + 2)/m$, exactly $(r + 2)/m$ when the slot just before the left bounding empty slot is also empty, against $1/m$ for an empty slot with empty neighbours (primary clustering).
2. Quadratic probing $h(k, i) = (h'(k) + i^2) \bmod m$ with $m$ prime: the first $(m + 1)/2$ probes are distinct, so an insert succeeds whenever fewer than $(m+1)/2$ slots are occupied, but no key ever probes more than $(m + 1)/2$ slots. Keys with the same home share one sequence (secondary clustering).
3. Double hashing $h(k, i) = (h_1(k) + i\, h_2(k)) \bmod m$ visits exactly $m / \gcd(h_2(k), m)$ distinct slots, so it reaches every slot when $h_2(k)$ is coprime to $m$: always for $m$ prime and $1 \le h_2(k) \le m - 1$, and for $m = 2^p$ when $h_2(k)$ is odd.
4. Deletion must leave a tombstone: blanking the slot can make a later search miss a stored key, while a tombstone that searches pass over and inserts may reuse keeps every search correct.

**Proof.** (1) The sequence is fixed by the home slot $h'(k)$, which takes $m$ values. Take a maximal run of $r$ occupied slots, bounded by an empty slot on each side; $r \le m - 2$ makes the two bounding slots distinct (for $r = m - 1$ they coincide and only $m$ homes exist). A new key whose home is one of the $r$ run slots probes to the end of the run and fills the empty slot after it; a key whose home is either bounding empty slot fills that slot. These $r + 2$ homes always lengthen the run. A key whose home lies in the neighbouring run that ends just before the left bounding slot also probes into that slot and fills it, merging the two runs, so the probability is $(r + 2)/m$ plus $1/m$ for each slot of that neighbouring run, and it equals $(r + 2)/m$ exactly when that neighbour is absent (the slot before the left bounding slot is empty). The right bounding slot has no such extra feeders: a key reaching it from the left must pass through the run itself. Meanwhile an empty slot with empty neighbours is filled only by its own home, probability $1/m$. Long runs therefore grow faster than short ones, and filling a bounding slot can merge two runs into one.

(2) Suppose $i^2 \equiv j^2 \pmod m$ with $0 \le j < i \le (m-1)/2$. Then $m \mid (i - j)(i + j)$, and since $m$ is prime it divides a factor; but $0 < i - j < m$ and $0 < i + j \le m - 1$, so neither is a multiple of $m$. Hence the $(m+1)/2$ probes $i = 0, \dots, (m-1)/2$ are distinct, and if fewer than $(m+1)/2$ slots are full, one of them is free. Since $(m - i)^2 \equiv i^2$, the offsets $i^2 \bmod m$ take only $(m + 1)/2$ values, so the other $(m-1)/2$ slots are never probed from that home, and an insert fails with free slots left as soon as the $(m+1)/2$ reachable ones are full. The sequence depends on $k$ only through $h'(k)$, so equal homes give equal sequences.

(3) $h_1 + i s \equiv h_1 + j s \pmod m$ exactly when $(m/g) \mid (i - j)$, with $g = \gcd(s, m)$, by the argument of the division-method section; the sequence cycles through $m/g$ slots. Coprimality ($g = 1$) is automatic when $m$ is prime and $s \in [1, m - 1]$, and when $m = 2^p$ and $s$ is odd. A step $s = 0$ probes one slot for ever, which is why $h_2$ must never be 0.

(4) The search for $k$ walks $h(k, 0), h(k, 1), \dots$ and stops with a miss at the first empty slot. Its correctness rests on the invariant: if $k$ is stored at $h(k, j)$, then $h(k, 0), \dots, h(k, j - 1)$ are all non-empty (occupied or tombstone). An insert places $k$ at the first slot of its sequence that is empty or a tombstone (after a search has ruled out a duplicate) and turns no slot empty, so the invariant holds for $k$ and for every other key. Replacing a key with a tombstone also turns no slot empty. Blanking does: a key $k'$ stored beyond the blanked slot on its own sequence now has an empty slot before it, and its search stops there and fails.

**GATE use.** The 2-mark probe trace: write the slots, insert in order, and for each key list $h(k, 0), h(k, 1), \dots$ until a free slot. Traps: quadratic probing adds $i^2$ to the home slot, not to the previous probe; $i$ starts at 0; double hashing fixes $h_2(k)$ once per key. MCQs: primary clustering belongs to linear probing, secondary to quadratic; deletion needs a tombstone; $h_2$ must be coprime to $m$.

**Check.** With $h(k) = k \bmod 10$ and linear probing, 12, 22, 32 land in 2, 3, 4, and 12, 18, 13, 2, 3, 23, 5, 15 give slots 0 to 9 as –, –, 12, 13, 2, 3, 23, 5, 18, 15. Quadratic probing modulo 11 with keys 10, 22, 31, 4, 15, 28, 17, 88, 59 puts 59 in slot 8 on its third probe (4 and 5 are taken). Double hashing modulo 13 with $h_2(k) = 7 - (k \bmod 7)$ and keys 18, 41, 22, 44, 59, 32, 31 puts 31 at slot 0 after probing 5 and 9. For $m = 7$ the quadratic offsets are only 0, 1, 2, 4, so a key with home 0 fails once slots 0, 1, 2 and 4 are full although 3, 5 and 6 are free; for $m = 10$ and step 4 from home 3 the sequence visits 3, 7, 1, 5, 9 and never an even slot. With 12 in slot 2 and 22 in slot 3, blanking slot 2 makes the search for 22 stop at once and miss, while a tombstone lets it reach slot 3. With $m = 10$ and slots 0, 1, 3, 4 occupied, the run $\{3, 4\}$ grows from homes 0 to 5, probability $6/10$ rather than $(r + 2)/m = 4/10$; with slots 3, 4, 6, 7 occupied instead it is exactly $4/10$. A script replayed every trace, enumerated those run-growth probabilities, and verified the distinctness and $m/\gcd$ claims for all primes up to 101 and all $m < 30$.

## Expected probes in open addressing, and rehashing
<!-- topics: pds-graphs-hashing.load-factor, pds-graphs-hashing.open-addressing -->

**Claim.** Let $\alpha = n/m < 1$.

1. Under uniform hashing (each key's probe sequence is a uniformly random permutation of the slots, independently of other keys) an unsuccessful search or an insert expects at most $U = 1/(1 - \alpha)$ probes, and a successful search for a uniformly chosen stored key at most $S = \frac{1}{\alpha}\ln\frac{1}{1-\alpha}$.
2. For linear probing with uniform, independent home slots, in the limit $m \to \infty$ with $\alpha$ fixed (Knuth, TAOCP Vol. 3, §6.4), $S \approx \frac12\bigl(1 + \frac{1}{1-\alpha}\bigr)$ and $U \approx \frac12\bigl(1 + \frac{1}{(1-\alpha)^2}\bigr)$.
3. Doubling the table and rehashing every key when the load crosses a fixed threshold costs $O(1)$ amortised per insert.

The hard constraint is $n \le m$, so $\alpha = 1$ is a legal full table; the formulas need $\alpha < 1$ to be finite.

**Derivation.** (1) This is CLRS Theorems 11.6 and 11.8. Let $X$ be the number of probes in a miss. The first $i - 1$ probes all hit occupied slots with probability

$$\Pr[X \ge i] = \frac{n}{m}\cdot\frac{n-1}{m-1}\cdots\frac{n-i+2}{m-i+2} \le \alpha^{\,i-1},$$

because each probe goes to a uniformly random slot not yet probed, and $(n - j)/(m - j) \le n/m$ for $n < m$. Then $E[X] = \sum_{i \ge 1}\Pr[X \ge i] \le \sum_{i \ge 1}\alpha^{i-1} = 1/(1-\alpha)$. An insert follows the same probes as a miss. A successful search for a key follows its probe sequence to the slot where it was inserted (keys never move), so it costs what that insert cost. The $(i+1)$-th key inserted found $i$ keys in the table and expected at most $1/(1 - i/m) = m/(m - i)$ probes. Averaging over the $n$ keys,

$$S \le \frac{1}{n}\sum_{i=0}^{n-1}\frac{m}{m-i} = \frac{m}{n}\sum_{q=m-n+1}^{m}\frac{1}{q} \le \frac{1}{\alpha}\int_{m-n}^{m}\frac{dx}{x} = \frac{1}{\alpha}\ln\frac{m}{m-n} = \frac{1}{\alpha}\ln\frac{1}{1-\alpha},$$

where the sum is bounded by the integral because $1/q \le \int_{q-1}^{q} dx/x$.

(2) Two facts about linear probing come first. The set of occupied slots, and the number of keys stored in each run, do not depend on the order of insertion: inserting keys in any order fills, run by run, the same slots. Second, a hit on a key costs $1 + d$ probes, where its displacement $d$ is the number of slots between its home and the slot where it sits.

Let $A_j$ be the number of keys whose home is slot $j$, and let $Q_j$ be the number of keys that probe past slot $j$ into slot $j + 1$ (home at or before $j$, stored after $j$). The keys that reach slot $j$ are the $Q_{j-1}$ arriving from the left and the $A_j$ that start there; one of them is stored at $j$ if there is any, and the rest pass on:

$$Q_j = \max(0,\ Q_{j-1} + A_j - 1).$$

A key with displacement $d$ crosses $d$ slot boundaries and adds 1 to $Q_j$ at each, so the total displacement is $\sum_j Q_j$ and

$$S = 1 + \frac{1}{n}\sum_{j} E[Q_j] = 1 + \frac{m}{n}E[Q] = 1 + \frac{E[Q]}{\alpha},$$

where in the limit every slot has the same distribution, the home counts $A_j$ become independent Poisson($\alpha$) variables ($n$ keys over $m$ slots with $n/m = \alpha$), and $Q$ is the stationary value of the recurrence, $A$ independent of the $Q$ before it.

To find $E[Q]$, write $Q' = Q + A - 1 + I$ with $I = 1$ exactly when $Q + A = 0$. Taking expectations, $E[Q'] = E[Q]$ gives $0 = \alpha - 1 + \Pr[I = 1]$, so $\Pr[I = 1] = 1 - \alpha$. Squaring, and using $I^2 = I$ and $(Q + A - 1)I = -I$ (when $I = 1$ the bracket is $-1$),

$$Q'^2 = (Q + A - 1)^2 + 2(Q + A - 1)I + I = (Q + A - 1)^2 - I.$$

Take expectations with $E[Q'^2] = E[Q^2]$, expand $(Q + A - 1)^2 = Q^2 + 2Q(A - 1) + (A - 1)^2$, and use independence, $E[A - 1] = \alpha - 1$ and $E[(A - 1)^2] = \operatorname{Var}A + (\alpha - 1)^2 = \alpha + (1 - \alpha)^2$:

$$0 = -2(1 - \alpha)E[Q] + \alpha + (1 - \alpha)^2 - (1 - \alpha), \qquad E[Q] = \frac{\alpha + (1-\alpha)^2 - (1-\alpha)}{2(1-\alpha)} = \frac{\alpha^2}{2(1 - \alpha)}.$$

Hence $S = 1 + \frac{\alpha}{2(1-\alpha)} = \frac{2 - \alpha}{2(1 - \alpha)} = \frac12\bigl(1 + \frac{1}{1-\alpha}\bigr)$.

For $U$, use the argument of (1) that a hit costs what its insert cost, and an insert at load $x$ costs the miss cost $U(x)$. With the sum over loads $i/m$ becoming an integral for large $m$, $\alpha S(\alpha) = \int_0^{\alpha} U(x)\,dx$, so

$$U(\alpha) = \frac{d}{d\alpha}\bigl(\alpha S(\alpha)\bigr) = \frac{d}{d\alpha}\,\frac12\Bigl(\alpha + \frac{\alpha}{1-\alpha}\Bigr) = \frac12\Bigl(1 + \frac{1}{(1-\alpha)^2}\Bigr),$$

since $\frac{d}{d\alpha}\frac{\alpha}{1-\alpha} = \frac{(1-\alpha) + \alpha}{(1-\alpha)^2}$. Integrating back confirms it:

$$\frac{1}{\alpha}\int_0^{\alpha} \frac12\Bigl(1 + \frac{1}{(1-x)^2}\Bigr)dx = \frac{1}{2\alpha}\Bigl(\alpha + \frac{1}{1-\alpha} - 1\Bigr) = \frac{1}{2\alpha}\Bigl(\alpha + \frac{\alpha}{1-\alpha}\Bigr) = \frac12\Bigl(1 + \frac{1}{1-\alpha}\Bigr).$$

The same integral applied to $U = 1/(1-x)$ reproduces the uniform-hashing $S$. The squared factor in the linear-probing $U$ is the cost of primary clustering: a miss must run to the end of a cluster, and clusters are long.

(3) With threshold $\alpha_0$ and doubling, the rehash at size $m$ moves about $\alpha_0 m$ keys and the sizes double, so over $N$ inserts the moves form a geometric series whose sum is below $2N$. Charging them to the inserts adds $O(1)$ each.

**GATE use.** NATs give $\alpha$ (or $n$ and $m$) and ask for expected probes. Pick the scheme (chaining, uniform or double hashing, linear probing) and the search kind. Traps: the miss formula for a hit, the uniform-hashing formula for linear probing, and using $\alpha$ as a percentage.

**Check.** At $\alpha = 0.75$: uniform $U = 4$ and $S = \frac{4}{3}\ln 4 \approx 1.85$; at $\alpha = 0.5$: uniform $U = 2$, $S = 2\ln 2 \approx 1.39$, linear $U = 2.5$, $S = 1.5$; at $\alpha = 0.9$: uniform $U = 10$, $S \approx 2.56$, linear $U = 50.5$, $S = 5.5$. Exact enumeration over all occupied sets and probe permutations gave miss costs $(m+1)/(m-n+1)$ (for $m = 7$, $n = 5$: $8/3 \le 1/(1 - 5/7) = 3.5$), within the bound. Simulating uniform hashing with $m = 2003$ at $\alpha = 0.5$ gave $S \approx 1.389$ against the exact value 1.385 and the limit 1.386. Iterating $Q' = \max(0, Q + A - 1)$ with Poisson arrivals for $2 \times 10^6$ steps gave $E[Q] \approx 0.250$ at $\alpha = 0.5$ and $1.11$ at $\alpha = 0.75$, against $\alpha^2/(2(1-\alpha)) = 0.25$ and $1.125$; on 200 random small tables the occupied set was the same for two insertion orders and $\sum_j Q_j$ equalled the total displacement. Simulating linear probing with $m = 20011$ gave $S = 1.49$, $U = 2.47$ at $\alpha = 0.5$ and $S = 2.49$, $U = 8.37$ at $\alpha = 0.75$, close to the asymptotic 1.5, 2.5, 2.5 and 8.5. Doubling from size 1 moved 1,023 keys over 1,000 inserts and 16,383 over 12,345, both below $2N$.

## Probability under uniform hashing: empty slots and collisions
<!-- topics: pds-graphs-hashing.hashing-probability -->

**Claim.** Under simple uniform hashing (each of $n$ keys independently lands in each of $m$ slots with probability $1/m$, as in chaining):

1. a given slot stays empty with probability $(1 - 1/m)^n$, and the expected number of empty slots is $m(1 - 1/m)^n$, which tends to $m/e \approx 0.368\,m$ when $n = m$;
2. $k$ given slots all stay empty with probability $\bigl((m - k)/m\bigr)^n$;
3. the expected number of unordered colliding pairs is $\binom{n}{2}/m$;
4. no two keys collide with probability $\prod_{i=0}^{n-1}\frac{m - i}{m}$.

**Proof.** (1) Each key misses the slot with probability $1 - 1/m$, and the keys are independent, so all $n$ miss it with probability $(1 - 1/m)^n$. Let $Y_j$ indicate that slot $j$ is empty; the number of empty slots is $\sum_j Y_j$, and linearity of expectation gives $m(1 - 1/m)^n$ without any independence between slots. With $n = m$, $(1 - 1/m)^m \to e^{-1}$.

(2) Each key avoids the $k$ slots with probability $(m - k)/m$, independently.

(3) For each of the $\binom{n}{2}$ pairs $\{i, j\}$ let $X_{ij}$ indicate $h(k_i) = h(k_j)$. Then $\Pr[X_{ij} = 1] = \sum_{s} \frac{1}{m}\cdot\frac{1}{m} = \frac{1}{m}$, and linearity gives $\binom{n}{2}/m$. A universal family gives $\Pr[X_{ij} = 1] \le 1/m$, so the same value is an upper bound there.

(4) Insert the keys one by one: the $(i+1)$-th avoids the $i$ slots already used with probability $(m - i)/m$, independently of where the earlier keys went, and the product follows by the chain rule.

These formulas use the independence of the keys' slots. In open addressing the final slot of a key depends on the slots taken before it, so a question about where keys end up in a probed table needs that table's own analysis.

**GATE use.** 2-mark NATs: "probability that the first 3 slots are empty after 3 insertions" or "expected number of empty slots". Traps: multiplying by the number of ways when the slots are fixed, using $1/m$ instead of $(m - k)/m$, and counting ordered pairs (a factor of 2) for collisions.

**Check.** With 100 slots, 3 given slots and 3 keys: $0.97^3 = 0.912673 \approx 0.9127$, and a 200,000-trial simulation gave 0.912. With 20 keys and 50 slots the expected number of colliding pairs is $190/50 = 3.8$. With 10 keys and 10 slots the expected number of empty slots is $10 \cdot 0.9^{10} \approx 3.49$, near $10/e \approx 3.68$. For 23 keys and 365 slots the no-collision probability is 0.4927. An exact enumeration of all $4^3$ assignments for $m = 4$, $n = 3$ gave expected empty slots $27/16 = 4(3/4)^3$, expected colliding pairs $3/4 = \binom{3}{2}/4$ and no-collision probability $24/64 = 3/8$.
