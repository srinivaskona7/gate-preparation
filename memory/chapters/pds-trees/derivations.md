# Trees, BSTs and heaps: derivations

## Edges, levels and the height bounds of a binary tree
<!-- topics: pds-trees.terminology, pds-trees.binary-tree-types, pds-trees.binary-tree-counts -->

**Claim.** Measure depth and height in edges: the root has depth 0, a leaf has height 0, the height $h$ of a tree is the height of its root, and level $i$ is the set of nodes at depth $i$. Then a tree with $n \ge 1$ nodes has exactly $n - 1$ edges, a binary tree has at most $2^i$ nodes on level $i$, and a binary tree of height $h$ has

$$h + 1 \le n \le 2^{h+1} - 1,$$

with the upper bound reached exactly by the perfect tree. Consequently, for $n$ nodes,

$$\lfloor \log_2 n \rfloor = \lceil \log_2 (n+1) \rceil - 1 \le h \le n - 1,$$

the minimum reached by every complete tree and the maximum by every skewed tree. If height counts levels instead (a single node has height 1), every bound shifts: $n \le 2^{h} - 1$ and $h_{\min} = \lceil \log_2(n+1) \rceil$.

**Proof.** Every node except the root has exactly one parent, and each edge joins a node to its parent, so edges and non-root nodes are in bijection: $n - 1$ edges. For the level bound use induction on $i$: level 0 holds only the root, $1 = 2^0$ node, and each node on level $i$ contributes at most 2 children to level $i + 1$, so level $i + 1$ holds at most $2 \cdot 2^i = 2^{i+1}$. A tree of height $h$ has nodes only on levels $0, \dots, h$, so

$$n \le \sum_{i=0}^{h} 2^i = 2^{h+1} - 1,$$

with equality exactly when every level is full, which is the perfect tree. Conversely, a path of length $h$ exists from the root, and its $h + 1$ nodes are distinct, so $n \ge h + 1$; equality means no node lies off that path, so every node has at most one child: the skewed tree. Rearranging $n \le 2^{h+1} - 1$ gives $h \ge \log_2(n+1) - 1$, and since $h$ is an integer, $h \ge \lceil \log_2(n+1) \rceil - 1$. To see that this equals $\lfloor \log_2 n \rfloor$, let $2^k \le n < 2^{k+1}$. Then $\lfloor \log_2 n \rfloor = k$, and $2^k < n + 1 \le 2^{k+1}$ gives $\lceil \log_2(n+1) \rceil = k + 1$. A complete tree with $n$ nodes fills levels $0, \dots, k - 1$ (that is $2^k - 1$ nodes) and puts the remaining $n - 2^k + 1 \ge 1$ nodes on level $k$, so its height is exactly $k$ and it attains the minimum. The levels convention replaces $h$ by $h - 1$ in every formula, which is where the shifted versions come from.

**GATE use.** One-mark questions ask for the maximum nodes at height $h$, the minimum height of $n$ nodes, or which of full, complete and perfect a tree is. The trap is the convention: $2^{h+1} - 1$ for edges against $2^h - 1$ for levels, and the options usually contain both. A second trap is reading "complete" as "full": a complete tree with an even number of nodes always has one node with a single child.

**Check.** Exhaustive enumeration of all binary trees with up to 10 nodes confirms $h + 1 \le n \le 2^{h+1} - 1$ for each tree and that the minimum and maximum heights over all shapes are $\lfloor \log_2 n \rfloor$ and $n - 1$. For $n = 1000$, $2^9 = 512 \le 1000 < 1024$, so $h_{\min} = 9 = \lceil \log_2 1001 \rceil - 1$. A perfect tree of height 3 has $2^4 - 1 = 15$ nodes, which the levels convention calls height 4.

## Leaf counts from edge counting: binary and full k-ary trees
<!-- topics: pds-trees.binary-tree-counts, pds-trees.kary-trees, pds-trees.binary-tree-types -->

**Claim.** In any non-empty tree let $n_j$ be the number of nodes with exactly $j$ children. Then

$$n_0 = 1 + \sum_{j \ge 2} (j - 1)\, n_j .$$

For a binary tree this is $n_0 = n_2 + 1$, independent of $n_1$. A linked binary tree with $n$ nodes has exactly $n + 1$ null child pointers. A full $k$-ary tree (every internal node has exactly $k$ children) with $I$ internal nodes has

$$n = kI + 1, \qquad L = (k - 1)I + 1,$$

and any $k$-ary tree of height $h$ (edges) has at most $(k^{h+1} - 1)/(k - 1)$ nodes.

**Proof.** Count edges in two ways. Every edge leaves exactly one parent, so the number of edges is $\sum_j j\, n_j$. By the previous section it is also $n - 1 = \sum_j n_j - 1$. Equating and moving every term to one side,

$$\sum_j j\, n_j = \sum_j n_j - 1 \;\Longrightarrow\; 1 = \sum_j (1 - j)\, n_j = n_0 - \sum_{j \ge 2} (j - 1)\, n_j ,$$

which is the identity. The $j = 1$ term has coefficient $0$, which is why one-child nodes never change the leaf count. With children at most 2 only $j = 2$ survives, giving $n_0 = n_2 + 1$. For the null pointers, each of the $n$ nodes carries 2 child pointers, $2n$ in all, and exactly $n - 1$ of them are used, one per edge, leaving $2n - (n - 1) = n + 1$. In a full $k$-ary tree the only nonzero counts are $n_0 = L$ and $n_k = I$, so the identity gives $L = (k-1)I + 1$, and $n = L + I = kI + 1$. The height bound repeats the level argument with branching factor $k$: level $i$ has at most $k^i$ nodes, and $\sum_{i=0}^{h} k^i = (k^{h+1} - 1)/(k - 1)$, which is $2^{h+1} - 1$ at $k = 2$.

**GATE use.** NAT questions give some of $n_0, n_1, n_2$ (or the degree counts of a general tree) and ask for the rest or the total. The trap is forgetting the one-child nodes in the total: they do not affect leaves but they do count as nodes. For ternary or quaternary trees, the trap is using $L = I + 1$, which holds only for $k = 2$; and the formula needs the tree to be full, since a $k$-ary tree with some nodes of fewer children obeys only the general identity.

**Check.** All binary trees up to 10 nodes satisfy $n_0 = n_2 + 1$ and have $n + 1$ null pointers, and all full $k$-ary trees for $k = 2, 3, 4$ with up to 5 internal nodes satisfy $L = (k-1)I + 1$ (both by enumeration). A binary tree with 10 leaves and 6 one-child nodes has $n_2 = 9$ and $10 + 6 + 9 = 25$ nodes. A full ternary tree with 15 internal nodes has $2 \cdot 15 + 1 = 31$ leaves and $3 \cdot 15 + 1 = 46$ nodes. A ternary tree of height 2 holds at most $(27 - 1)/2 = 13$ nodes.

## Traversal cost and the sorted inorder of a BST
<!-- topics: pds-trees.traversals, pds-trees.bst-operations -->

**Claim.** Inorder (left, node, right), preorder (node, left, right) and postorder (left, right, node) run in $\Theta(n)$ time on an $n$-node binary tree, using $O(h)$ stack space when written recursively; level order runs in $\Theta(n)$ time with a queue that holds at most the largest level's width. In a binary search tree with distinct keys, inorder lists the keys in increasing order. Preorder lists every node before its descendants and postorder after them, so the root is the first preorder element and the last postorder element.

**Proof.** Each recursive call is made either on a node or on a null pointer. Every node is the argument of exactly one call (from its parent, or the initial call for the root), and by the previous section there are $n + 1$ null pointers, so there are $2n + 1$ calls, each doing $O(1)$ work besides its recursive calls: $\Theta(n)$. The active calls at any moment form a path from the root, so the stack holds at most $h + 2$ frames, counting a final null call. Level order dequeues each node once and enqueues each child once: $\Theta(n)$. The queue at any time holds nodes of at most two consecutive levels, the unvisited part of one and the discovered part of the next, so its size is bounded by about twice the maximum width, up to $\lceil n/2 \rceil$ in a complete tree. For the BST claim use strong induction on the subtree size: the inorder of a subtree rooted at $x$ is (inorder of left) $x$ (inorder of right). By induction each part is sorted, every left key is below $x$ and every right key above it by the BST property, so the concatenation is sorted. The positions of the root follow from the definitions: preorder emits the root before recursing, postorder after both recursions finish.

**GATE use.** Traversal outputs are read off small trees, often expression trees: postorder of an expression tree is the postfix form, preorder the prefix form, inorder the infix form without parentheses. In BST questions, an option listing the keys in sorted order is the inorder answer and is the distractor whenever preorder or postorder is asked. Space questions ask for the recursion depth, which is $\Theta(n)$ on a skewed tree, not $\Theta(\log n)$.

**Check.** For the tree $1(2(4, 5), 3(-, 6))$ a script gives inorder 4 2 5 1 3 6, preorder 1 2 4 5 3 6, postorder 4 5 2 6 3 1 and level order 1 2 3 4 5 6. With 6 nodes it makes $2 \cdot 6 + 1 = 13$ recursive calls per depth-first traversal. The BST built from 50, 30, 70, 20, 40, 60, 80 has inorder 20 30 40 50 60 70 80, preorder 50 30 20 40 70 60 80 and postorder 20 40 30 60 80 70 50.

## Which traversal pairs determine a binary tree
<!-- topics: pds-trees.tree-reconstruction, pds-trees.traversals -->

**Claim.** For a binary tree with distinct keys, the inorder sequence together with any one of preorder, postorder or level order determines the tree uniquely. Preorder together with postorder does not in general: whenever some node has exactly one child, swapping that child between left and right changes the tree but neither sequence. Preorder with postorder is unique for full binary trees. For a BST, preorder alone (or postorder alone) determines the tree, because the inorder is the sorted key list.

**Proof.** Inorder with preorder, by strong induction on $n$. For $n = 0$ the tree is empty. Otherwise the root $r$ is the first preorder element. Since keys are distinct, $r$ occurs exactly once in the inorder sequence, and the elements before it are exactly the left subtree's keys, say $a$ of them, while the elements after it are the right subtree's. In preorder, after $r$, the left subtree is listed in full before the right, so the next $a$ elements are the left subtree's preorder and the rest the right's. Each subtree's pair of sequences is therefore determined, and by induction so is each subtree. With postorder the root is the last element and the left subtree's postorder is the first $a$ elements; the argument is otherwise identical. With level order the root is the first element, and the level order of the left subtree is the subsequence of the level order restricted to the left key set, because a breadth-first pass visits a subtree's nodes in that subtree's own breadth-first order. For the counterexample, the trees "1 with left child 2" and "1 with right child 2" both have preorder 1 2 and postorder 2 1. For a full tree with $n > 1$ the root has two children, so the second preorder element $\ell$ is the root of the left subtree; $\ell$'s position in postorder ends the left subtree's postorder, which gives the split size, and induction finishes as before. A one-child node is exactly the case where this fails, since $\ell$ might be a right child. For a BST, sort the given sequence to get the inorder and apply the first result.

**GATE use.** The 2-mark MCQ gives two traversals and asks for the third: take the root from the end of postorder or the start of preorder, split the inorder at it, and recurse on equal-size slices. Variants ask which pairs suffice, and the trap is believing preorder with postorder is enough; it is only for full trees. BST variants give just a preorder and ask for the postorder, which needs no inorder at all.

**Check.** Exhaustive enumeration over all shapes with up to 8 nodes (keys assigned by inorder rank) finds no two distinct trees with the same (preorder, inorder) pair, the same (postorder, inorder) pair, or, for BSTs, the same preorder alone. All full trees with up to 9 nodes, labelled in preorder, have distinct postorders. Postorder 4 5 2 6 3 1 with inorder 4 2 5 1 3 6 rebuilds to the tree with preorder 1 2 4 5 3 6, and level order 1 2 3 4 5 6 with the same inorder rebuilds the same tree.

## Catalan numbers count binary tree shapes and BSTs
<!-- topics: pds-trees.counting-trees -->

**Claim.** The number $C_n$ of structurally distinct binary trees with $n$ nodes (left and right children distinguished) satisfies

$$C_0 = 1, \qquad C_n = \sum_{i=0}^{n-1} C_i\, C_{n-1-i}, \qquad C_n = \frac{1}{n+1}\binom{2n}{n} = \binom{2n}{n} - \binom{2n}{n+1}.$$

The number of distinct BSTs on $n$ distinct keys is also $C_n$; the number with the key of rank $r$ at the root is $C_{r-1}\, C_{n-r}$. Binary trees whose $n$ distinct labels may be placed freely number $n!\, C_n$.

**Proof.** Recurrence: a non-empty tree is a root with an ordered pair (left subtree, right subtree), and if the left has $i$ nodes the right has $n - 1 - i$. Shapes with left size $i$ number $C_i C_{n-1-i}$, and summing over $i = 0, \dots, n-1$ counts every shape once. Closed form, through a bijection with balanced parenthesis strings of $n$ pairs: map the empty tree to the empty string and a tree with subtrees $L$ and $R$ to "(" $w(L)$ ")" $w(R)$. Every non-empty balanced string splits uniquely at the ")" that closes its first "(", so the map is invertible, and the strings obey the same recurrence. Count balanced strings by reflection: of the $\binom{2n}{n}$ strings with $n$ of each symbol, the bad ones have a first prefix where ")" outnumbers "(" by one. Flipping every symbol after that prefix turns a bad string into a string with $n + 1$ ")" and $n - 1$ "(", and this is a bijection, because every such string must reach that excess somewhere and flipping back after the first such point recovers the original. So the good strings number

$$\binom{2n}{n} - \binom{2n}{n-1} = \binom{2n}{n}\left(1 - \frac{n}{n+1}\right) = \frac{1}{n+1}\binom{2n}{n},$$

using $\binom{2n}{n-1} = \binom{2n}{n}\frac{n}{n+1}$, and $\binom{2n}{n-1} = \binom{2n}{n+1}$. For BSTs on keys $k_1 < \dots < k_n$: in a BST the inorder is the sorted order, so a shape admits exactly one valid labelling, the one that gives the $j$-th inorder node the key $k_j$. Shapes and BSTs are therefore in bijection. With root of rank $r$ the left subtree is any BST on the $r - 1$ smaller keys and the right any BST on the $n - r$ larger ones, giving $C_{r-1}C_{n-r}$. Without the order constraint each shape takes the $n$ labels in any of $n!$ ways, all giving distinct trees, so $n!\,C_n$.

**GATE use.** NAT questions ask for the number of BSTs on $n$ keys, the number of shapes, or the number of BSTs with a given root. Traps: answering $n!$ (that counts insertion orders, and many orders produce the same BST), answering $n!\,C_n$ for a BST question, and forgetting that $C_0 = 1$ counts the empty subtree in the root-fixed product.

**Check.** A script computes $C_0, \dots, C_7 = 1, 1, 2, 5, 14, 42, 132, 429$ from the recurrence, matches both closed forms up to $n = 14$, and confirms by enumerating shapes up to $n = 10$. Inserting all $n!$ permutations of $1, \dots, n$ for $n \le 7$ produces exactly $C_n$ distinct BSTs, and the permutations of $1..5$ starting with 3 give $C_2 C_2 = 4$ distinct BSTs. For 3 freely labelled nodes, $3! \cdot 5 = 30$ trees.

## BST search and insertion: correctness and cost
<!-- topics: pds-trees.bst-operations -->

**Claim.** In a BST of height $h$, search, insertion, minimum and maximum each follow one root-to-leaf path and cost $O(h)$: $O(\log n)$ for a balanced tree, $\Theta(n)$ for a skewed one. Insertion attaches the new key as a leaf at the null pointer where its unsuccessful search ends, so the first key inserted stays the root. Building a BST by $n$ insertions takes $n(n-1)/2$ key comparisons in the worst case (sorted input), and averaged over all $n!$ insertion orders of distinct keys it takes

$$P(n) = 2(n+1)H_n - 4n \approx 1.39\, n \log_2 n$$

comparisons, where $H_n = \sum_{k=1}^{n} 1/k$; this $P(n)$ is also the average sum of node depths, so a random BST has average depth $O(\log n)$.

**Proof.** Search invariant: if key $k$ is in the tree, it lies in the subtree rooted at the current node. It holds at the root; comparing $k$ with the current key $x$ either finds it or, by the BST property, rules out $x$ and one whole subtree, so the invariant holds for the chosen child. Each step moves one level down, so at most $h + 1$ comparisons are made, and an empty subtree means $k$ is absent. Insertion runs the same search and puts $k$ at the null pointer reached; every ancestor's comparison sent $k$ to the side where it belongs, so the BST property still holds, and no existing node moves, which is why the root never changes. The minimum is found by going left until no left child exists, since any key smaller than the current node lies in its left subtree; the maximum symmetrically. The key inserted $j$-th is compared once with each of its ancestors, that is (its depth) times, so the total build cost is the sum of depths. Sorted input puts the $j$-th key at depth $j - 1$, giving $\sum_{j=1}^{n} (j-1) = n(n-1)/2$. For the average, the first key is equally likely to have each rank $r$; the keys below it form a uniformly random order on $r - 1$ keys and build the left subtree independently, likewise on the right. Every non-root node sits one level deeper than in its subtree, so

$$P(n) = (n - 1) + \frac{1}{n}\sum_{r=1}^{n} \big(P(r-1) + P(n-r)\big) = (n-1) + \frac{2}{n}\sum_{k=0}^{n-1} P(k), \qquad P(0) = 0.$$

Multiply by $n$ and subtract the same equation for $n - 1$: $nP(n) - (n-1)P(n-1) = 2(n-1) + 2P(n-1)$, so $nP(n) = (n+1)P(n-1) + 2(n-1)$. Dividing by $n(n+1)$ and using $\frac{2(n-1)}{n(n+1)} = \frac{4}{n+1} - \frac{2}{n}$,

$$\frac{P(n)}{n+1} = \frac{P(n-1)}{n} + \frac{4}{n+1} - \frac{2}{n} \;\Longrightarrow\; \frac{P(n)}{n+1} = \sum_{k=1}^{n}\left(\frac{4}{k+1} - \frac{2}{k}\right) = 2H_n + \frac{4}{n+1} - 4,$$

and multiplying back gives $P(n) = 2(n+1)H_n - 4n$. Since $H_n \approx \ln n$, $P(n) \approx 2n \ln n = (2\ln 2)\, n\log_2 n \approx 1.39\, n \log_2 n$. This is the quicksort comparison recurrence, as CLRS notes: the BST built from an order makes exactly the comparisons quicksort makes with first-element pivots.

**GATE use.** Insertion traces ask for the final tree's height or a traversal; the first key is the root and later keys never displace it. Complexity MCQs ask for the worst-case search in a BST without balancing, which is $\Theta(n)$, and the cost of building from sorted input, $\Theta(n^2)$. The trap is quoting $O(\log n)$ for an arbitrary BST.

**Check.** Exact enumeration over all permutations gives average depth sums $8/3$, $7.4$ and $13.4857$ for $n = 3, 5, 7$, matching $2(n+1)H_n - 4n$. Inserting $1, \dots, 7$ in order makes $0 + 1 + \dots + 6 = 21$ comparisons and builds a chain of height 6.

## BST deletion and the inorder successor
<!-- topics: pds-trees.bst-deletion -->

**Claim.** Deleting key $x$ from a BST keeps the BST property when done as follows: a leaf is removed; a node with one child is replaced by that child; a node with two children takes the key of its inorder successor $s$ (the leftmost node of its right subtree), and then $s$ is deleted from the right subtree, where it has no left child. The predecessor (rightmost node of the left subtree) works symmetrically. The successor of a node without a right subtree is its nearest ancestor whose left subtree contains it. Each deletion costs $O(h)$.

**Proof.** Removing a leaf or splicing out a one-child node $x$ keeps every remaining node's set of ancestors in the same relative order: the child's subtree moves up one level but stays on the same side of every ancestor of $x$, because those ancestors had already compared the whole subtree of $x$ to the correct side. For two children, let $s$ be the leftmost node of the right subtree $R$. Going left from the root of $R$ reaches smaller keys only, and $s$ has no left child, so $s = \min R$. Then every key in the left subtree is below $x < s$, and every key of $R \setminus \{s\}$ is above $s$. Putting $s$ at $x$'s position therefore satisfies the BST property there, and nothing changes for $x$'s ancestors, since $s$ was already inside $x$'s subtree on the same side of each of them. The node $s$ has at most a right child, so removing it from $R$ is one of the easy cases. For the successor without a right subtree: inorder visits a node right after finishing the left subtree that contains the previous node. Walking up from $x$ while $x$ is a right child stays inside subtrees that inorder has already finished; the first ancestor reached from its left side is the next node visited. Each step of any case moves along one root-to-leaf path, at most $O(h)$ steps.

**GATE use.** Questions delete a key from a given BST and ask for the new root, a traversal, or the height. The trap is the rule: "inorder successor" and "inorder predecessor" give different trees, and the question usually names one. A second trap is forgetting the second deletion, of the successor itself, which can splice up its right child.

**Check.** Build 50, 30, 70, 20, 40, 60, 80 and delete 50: with the successor rule the preorder becomes 60 30 20 40 70 80, so 60 is the new root, and with the predecessor rule it becomes 40 30 20 70 60 80. A randomised script that deletes 10 random keys from 3000 random BSTs of 30 keys, mixing both rules, always leaves a sorted inorder of the remaining keys.

## Minimum nodes and maximum height of an AVL tree
<!-- topics: pds-trees.avl-height -->

**Claim.** An AVL tree is a BST in which every node's balance factor $\text{height(left)} - \text{height(right)}$ is $-1$, $0$ or $+1$, with the empty tree's height $-1$. With heights in edges, the minimum number of nodes of an AVL tree of height $h$ is

$$N(h) = N(h-1) + N(h-2) + 1, \qquad N(0) = 1,\ N(1) = 2, \qquad N(h) = F_{h+3} - 1,$$

with Fibonacci numbers $F_0 = 0$, $F_1 = 1$. Hence an AVL tree with $n$ nodes has height at most the largest $h$ with $N(h) \le n$, and

$$\log_2(n+1) - 1 \le h < \frac{\log_2(n+2) + \log_2\sqrt5}{\log_2 \varphi} - 3 \approx 1.44042\,\log_2(n+2) - 1.32772,$$

where $\varphi = (1 + \sqrt5)/2$. In the levels convention (single node of height 1) every height is one larger, so the base cases become $N(1) = 1$, $N(2) = 2$ and the bound becomes $h < 1.4405\,\log_2(n+2) - 0.3277$. The constants are tight, so decimals must be rounded upwards: $1.4404\,\log_2(n+2) - 1.3277$, with the slope rounded down, already fails at $h = 18$.

**Proof.** Let $T$ be an AVL tree of height $h \ge 2$ with the fewest nodes. Its root has a subtree of height $h - 1$, and the other subtree has height $h - 1$ or $h - 2$ by the balance condition. Both subtrees are AVL trees, and replacing either by a smallest AVL tree of the same height keeps $T$ valid, so minimality forces each subtree to be minimal for its height, and the second subtree to have the smaller allowed height $h - 2$ because $N$ is increasing (a tree of height $h$ contains one of height $h - 1$). So $N(h) = 1 + N(h-1) + N(h-2)$. The bases: a single node, $N(0) = 1$; a root with one child, $N(1) = 2$. Put $M(h) = N(h) + 1$: then $M(h) = M(h-1) + M(h-2)$ with $M(0) = 2 = F_3$ and $M(1) = 3 = F_4$, so $M(h) = F_{h+3}$ and $N(h) = F_{h+3} - 1$. Binet's formula gives $F_m > \varphi^m/\sqrt5 - 1$, so $n + 2 \ge N(h) + 2 = F_{h+3} + 1 > \varphi^{h+3}/\sqrt5$. Taking $\log_2$,

$$h + 3 < \frac{\log_2(n+2) + \log_2\sqrt5}{\log_2 \varphi} \;\Longrightarrow\; h < \frac{\log_2(n+2)}{\log_2\varphi} + \frac{\log_2\sqrt5}{\log_2\varphi} - 3 \approx 1.44042\,\log_2(n+2) + \frac{1.16096}{0.69424} - 3 = 1.44042\,\log_2(n+2) - 1.32772 .$$

The lower bound is the general binary-tree bound $n \le 2^{h+1} - 1$ from the first section. In the levels convention every height is one larger, which shifts the base cases.

**GATE use.** The NAT asks for the minimum nodes in an AVL tree of height $h$, or the maximum height with $n$ nodes. Tabulate $N$ and take the largest $h$ with $N(h) \le n$. The trap is the base case: a question that calls a single node height 1 wants the shifted table, and the answers differ by one. The rounded form $h < 1.44\log_2(n+2)$ is the one quoted in options; it is safe for every tree size a question can name, and only the exact constant $1/\log_2\varphi = 1.44042$ makes it a theorem for all $n$.

**Check.** A script gives $N(0..9) = 1, 2, 4, 7, 12, 20, 33, 54, 88, 143$ and confirms $N(h) = F_{h+3} - 1$ up to $h = 59$. Then 20 nodes allow height 5 and 19 allow only 4, since $N(5) = 20$; 100 nodes allow height 8, since $N(8) = 88 \le 100 < 143$. Over the sparsest trees up to $h = 6000$, $h - 1.44042\log_2(N(h)+2)$ rises towards $-1.32772$ without reaching it, so the additive constant cannot be improved; $1.44043\log_2(n+2) - 1.3277$ holds at all of them, $1.4404\log_2(n+2) - 1.3277$ first fails at $h = 18$, and the rounded $1.44\log_2(n+2)$ first fails at the sparsest tree of height 4552.

## AVL rotations restore balance with one fix per insertion
<!-- topics: pds-trees.avl-rotations, pds-trees.avl-height -->

**Claim.** A single rotation changes $O(1)$ pointers and preserves the inorder sequence. After inserting a key into an AVL tree, let $z$ be the lowest ancestor of the new leaf with balance factor $\pm 2$, and name the case by the first two steps from $z$ towards the new key: LL is fixed by a right rotation at $z$, RR by a left rotation, LR by a left rotation at $z$'s left child followed by a right rotation at $z$, and RL symmetrically. After this one single or double rotation, the subtree has its pre-insertion height, so no ancestor needs fixing. A deletion can reduce a subtree's height after its rotation and may need rotations at $O(\log n)$ levels. Every operation stays $O(\log n)$.

**Proof.** A right rotation at $y$ with left child $x$ turns $y(x(A, B), C)$ into $x(A, y(B, C))$, where $A, B, C$ are subtrees. Inorder is $A\,x\,B\,y\,C$ before and after, so the BST property survives, and only three pointers change. Now fix an insertion. The new key raises the height of each subtree on its path by at most 1, and only nodes on the path change balance factor, so $z$ is on the path. Take the LL case, with $y$ the left child of $z$ and the key inserted into $y$'s left subtree. Before the insertion $z$ had balance $+1$, so for some $k$ its left subtree $y$ had height $k + 1$ and its right subtree $C$ height $k$. The insertion raised $y$'s height to $k + 2$; $y$ is not unbalanced, so its balance went from 0 to $+1$ (from $-1$ it would have gone to 0 without a height change, and from $+1$ to $+2$, contradicting the choice of $z$). So $y$'s left subtree $A$ now has height $k + 1$ and its right subtree $B$ height $k$. After the right rotation, $z$ has children $B$ and $C$, both of height $k$, so $z$ has balance 0 and height $k + 1$; $y$ has children $A$ (height $k+1$) and $z$ (height $k+1$), balance 0 and height $k + 2$, which was $z$'s height before the insertion. In the LR case, let $x$ be $y$'s right child, now of height $k + 1$ with subtrees $B_1, B_2$ of heights $k$ and $k - 1$ in some order (or both $-1$ when $x$ is the new leaf, $k = 0$). A single right rotation at $z$ would hang $x$ (height $k+1$) under $z$ beside $C$ (height $k$), making $z$ height $k+2$ against $A$ at height $k$, so the tree is unbalanced the other way. The double rotation puts $x$ on top with children $y(A, B_1)$ and $z(B_2, C)$; each of these has children of heights in $\{k-1, k\}$ and height $k + 1$, so all three nodes are balanced and the subtree height is $k + 2$, again the original. RR and RL are mirror images. Since the fixed subtree has its old height, ancestors above $z$ see no change. After a deletion the rotated subtree can end one shorter than before, which can unbalance the next ancestor, so rotations may cascade up the path.

**GATE use.** The 2-mark MCQ inserts a sequence and asks for the final root, a traversal or the number of rotations. Recompute balance factors bottom-up after each insertion and name the case at the lowest unbalanced node. The trap is calling an LR case LL: a single rotation then fails, as shown above. Another trap is rotating at the root when a lower node is the first unbalanced one.

**Check.** A simulation inserting $1, \dots, 7$ performs four RR rotations, at 1, 3, 2 and 5, and ends in the perfect tree with preorder 4 2 1 3 6 5 7. Inserting 30, 10, 20 triggers LR at 30 and gives root 20; inserting 50, 20, 60, 10, 30, 25 triggers LR at 50 and gives preorder 30 20 10 25 50 60. Across 2000 random sequences of 60 insertions, no insertion needed more than one single or double rotation.

## Red-black tree height bound
<!-- topics: pds-trees.red-black-trees -->

**Claim.** A red-black tree is a BST whose nodes are red or black, with black root and black NIL leaves, no red node with a red child, and the same number of black nodes on every path from a node down to its NIL leaves. Let the black-height $\text{bh}(x)$ count the black nodes on such a path, excluding $x$ and including the NIL. Then the subtree at $x$ holds at least $2^{\text{bh}(x)} - 1$ keys, and a red-black tree with $n$ keys has height

$$h \le 2\log_2(n+1).$$

Insertion fixes violations with recolouring and at most 2 rotations, deletion with at most 3, so all operations are $O(\log n)$.

**Proof.** This follows CLRS. Induct on the height of $x$. If $x$ is NIL, $\text{bh}(x) = 0$ and the subtree holds $0 = 2^0 - 1$ keys. Otherwise each child $c$ of $x$ has $\text{bh}(c) = \text{bh}(x)$ if $c$ is red and $\text{bh}(x) - 1$ if $c$ is black, so at least $\text{bh}(x) - 1$ either way. By induction each child's subtree holds at least $2^{\text{bh}(x)-1} - 1$ keys, and with $x$ itself the total is at least $2(2^{\text{bh}(x)-1} - 1) + 1 = 2^{\text{bh}(x)} - 1$. Now take a longest path from the root to a NIL, with $h$ edges. A red node's children are black, so no two consecutive nodes on the path are red. The path below the root has $h$ nodes ending in a black NIL, and at least half of them are black, so $\text{bh}(\text{root}) \ge h/2$. Combining, $n \ge 2^{h/2} - 1$, so $h/2 \le \log_2(n+1)$. Counting height in edges among key nodes only gives a smaller $h$, so the bound holds in either convention. The rotation counts come from the case analysis of the fix-up procedures: in insertion only the terminal cases rotate, and they end the loop.

**GATE use.** MCQs ask for the maximum height of a red-black tree with $n$ keys, compare it with AVL ($1.44\log_2 n$ against $2\log_2 n$, AVL tighter), or ask which colouring of a given tree is valid. The trap in validity questions is forgetting the NIL leaves when counting black nodes on a path through a node with one child.

**Check.** A script enumerates every shape with up to 10 keys and every colouring, keeps the valid red-black trees, and confirms $n \ge 2^{\text{bh}} - 1$ and $h \le 2\log_2(n+1)$ for each. The tallest valid trees found have heights (in edges among keys) 0, 1, 1, 2, 2, 3, 3, 3, 3, 4 for $n = 1, \dots, 10$, under the bound, which for $n = 7$ is $2\log_2 8 = 6$.

## Heap array layout, height and leaf positions
<!-- topics: pds-trees.heap-structure, pds-trees.binary-tree-types -->

**Claim.** Store a complete binary tree in level order in an array $A[1..n]$. Then node $i$ has children $2i$ and $2i + 1$ and parent $\lfloor i/2 \rfloor$; it lies at depth $\lfloor \log_2 i \rfloor$, so the heap has height $\lfloor \log_2 n \rfloor$. Its leaves are exactly positions $\lfloor n/2 \rfloor + 1, \dots, n$, which number $\lceil n/2 \rceil$. In 0-indexed storage the children are $2i + 1$, $2i + 2$ and the parent is $\lfloor (i-1)/2 \rfloor$; a $d$-ary heap, 0-indexed, has children $d\,i + 1, \dots, d\,i + d$ and parent $\lfloor (i-1)/d \rfloor$. In a max-heap of distinct keys the $k$-th largest key lies at depth at most $k - 1$, so the minimum is at a leaf.

**Proof.** Level $t$ of a complete tree occupies positions $2^t, \dots, 2^{t+1} - 1$, since levels $0, \dots, t-1$ fill $2^t - 1$ slots. So position $i$ is on level $\lfloor \log_2 i \rfloor$, and the last position $n$ gives the height. Take $i$ on level $t$, with offset $i - 2^t$ in its level. The nodes before it on level $t$ each have two children on level $t + 1$, filled left to right, so $i$'s left child has offset $2(i - 2^t)$ on level $t+1$, at position $2^{t+1} + 2(i - 2^t) = 2i$, and its right child at $2i + 1$. Both $2i$ and $2i + 1$ halve down to $i$, which gives the parent. Node $i$ is a leaf exactly when its left child position exceeds $n$, that is $2i > n$, or $i > \lfloor n/2 \rfloor$; there are $n - \lfloor n/2 \rfloor = \lceil n/2 \rceil$ such positions. For 0-indexed storage substitute $i + 1$ for $i$: children $2(i+1) - 1$ and $2(i+1)$, parent $\lfloor (i+1)/2 \rfloor - 1 = \lfloor (i-1)/2 \rfloor$. For a $d$-ary heap, position 0 is the root and positions $1, \dots, d\,i$ are, in level order, the children of positions $0, \dots, i - 1$, $d$ each; so the children of $i$ are the next $d$ positions, $d\,i + 1, \dots, d\,i + d$, and $\lfloor (d\,i + j - 1)/d \rfloor = i$ for $1 \le j \le d$ recovers the parent. Finally, along any root-to-node path the keys strictly decrease, so a key at depth $t$ has $t$ larger keys above it, its ancestors; the $k$-th largest has at most $k - 1$ larger keys anywhere, so its depth is at most $k - 1$. A child of the minimum would hold a smaller key, so the minimum has no child: it is a leaf, and finding it means scanning all $\lceil n/2 \rceil$ leaves, $\Theta(n)$.

**GATE use.** Questions give an array and ask whether it is a heap (check $A[\lfloor i/2 \rfloor] \ge A[i]$ for every $i \ge 2$), where the $k$-th largest can lie, or the parent index of a node in a $d$-ary heap. The trap is mixing the 1-indexed and 0-indexed formulas, which the options exploit by offering both. Another is believing a max-heap is sorted: only the vertical order is fixed.

**Check.** A script confirms for every $n < 200$ that the leaf positions are $\lfloor n/2 \rfloor + 1, \dots, n$ and number $\lceil n/2 \rceil$, and for $d = 2, 3, 4$ and $i < 500$ that $\lfloor (d\,i + j - 1)/d \rfloor = i$. In a 0-indexed ternary heap, node 4 has children 13, 14, 15 and node 13 has parent 4. On 500 random heaps of up to 40 distinct keys, every $k$-th largest key sits at depth at most $k - 1$.

## Heap operations, linear build-heap and heapsort
<!-- topics: pds-trees.heap-operations, pds-trees.heap-structure -->

**Claim.** In a max-heap of $n$ elements, find-max is $O(1)$, insert (append and sift up) and delete-max (move the last element to the root and sift down, always swapping with the larger child) are $O(\log n)$. Bottom-up build-heap, which sifts down positions $\lfloor n/2 \rfloor, \dots, 1$, does at most

$$\sum_{h \ge 1} h \cdot \#\{\text{nodes of height } h\} = \sum_{h \ge 1} \left\lfloor \frac{n}{2^h} \right\rfloor = n - s_2(n) < n$$

swaps, where $s_2(n)$ is the number of 1 bits of $n$; this is the exact form of the bound $\sum_h \lceil n/2^{h+1} \rceil O(h) = O(n \sum_h h/2^h) = O(n)$, with $\sum_{h \ge 0} h/2^h = 2$. Building by $n$ successive inserts is $\Theta(n \log n)$ in the worst case. Heapsort is $\Theta(n \log n)$, in place and not stable.

**Proof.** Sift-down invariant: when sift-down reaches node $i$, both subtrees of $i$ are heaps, so the key at $i$ is the only possible violation in $i$'s subtree. Swapping $A[i]$ with its larger child $c$ (when that child beats $A[i]$) makes $A[i]$ at least both children, the other child's subtree is untouched and still a heap, and only $c$'s subtree may now violate order at $c$, so the invariant moves to $c$. Swapping with the smaller child would put the smaller key above the larger sibling and break the heap, which is why the larger child is mandatory. Each step goes one level down, so at most the node's height in swaps, $\lfloor \log_2 n \rfloor$ from the root. Sift-up is symmetric along the path to the root. Build-heap is correct by induction downward through positions: positions above $\lfloor n/2 \rfloor$ are leaves, already heaps, and each sift-down of $i$ starts with both subtrees heaps. For the cost, in a complete tree the height of node $i$ is the largest $j$ with $i\,2^j \le n$, because the leftmost descent is the longest path. So the nodes of height at least $h$ are exactly positions $1, \dots, \lfloor n/2^h \rfloor$. A node of height $h$ costs at most $h$ swaps, and summing $h$ times the count at height exactly $h$ is the same as summing, over $h \ge 1$, the count at height at least $h$:

$$\sum_{h \ge 1} \left\lfloor \frac{n}{2^h} \right\rfloor = n - s_2(n),$$

the last step being Legendre's formula for the power of 2 in $n!$, which follows by writing $n$ in binary: the bit of value $2^j$ contributes $2^{j-1} + \dots + 1 = 2^j - 1$ to the sum. The count at height exactly $h$ is $\lceil m/2 \rceil$ with $m = \lfloor n/2^h \rfloor$, which is at most $\lceil n/2^{h+1} \rceil$, so the coarser textbook sum bounds the same quantity; with $S = \sum_{h \ge 0} h x^h = x/(1-x)^2$ at $x = 1/2$ it gives $S = 2$ and $O(2n)$. Successive inserts of increasing keys make the $j$-th insert sift up to the root, $\lfloor \log_2 j \rfloor$ swaps, and $\sum_{j \le n} \lfloor \log_2 j \rfloor = \Theta(n \log n)$. Heapsort is $O(n)$ for building plus $n - 1$ rounds of swapping the root to the end and sifting down, each $O(\log n)$, and as a comparison sort it needs $\Omega(n \log n)$. The long-distance swap of the root with the last element is what breaks stability.

**GATE use.** The 2-mark MCQ gives an array and asks for the heap after build-heap, an insert or a delete-max. Bottom-up build-heap is deterministic: start at $\lfloor n/2 \rfloor$, always swap with the larger child, and keep sifting until the element settles. The traps are stopping after one swap, swapping with the left child by default, and choosing $O(n \log n)$ for build-heap.

**Check.** Simulated build-heap on 3, 5, 1, 8, 2, 7 gives exactly [8, 5, 7, 3, 2, 1]; on 1..7 it gives [7, 5, 6, 4, 2, 1, 3]. Delete-max on [8, 5, 7, 3, 2, 1] gives [7, 5, 1, 3, 2], and inserting 9 into [8, 5, 7, 3, 2, 1] gives [9, 5, 8, 3, 2, 1, 7]. The sum of node heights is 4, 11, 26, 994 and 1013 for $n = 7, 15, 31, 1000, 1023$, equal to $n - s_2(n)$ each time. Inserting 1..15 one at a time makes 34 swaps, against at most 11 for bottom-up build-heap on 15 elements. Heapsort on keys (2, a), (2, b), (1, c) outputs (1, c), (2, b), (2, a), reversing the equal keys.

## B-tree occupancy and height; trie cost
<!-- topics: pds-trees.multiway-and-tries -->

**Claim.** In a B-tree of order $m$ (at most $m$ children per node), with $t = \lceil m/2 \rceil$, every non-root node, leaf or internal, has between $t - 1$ and $m - 1$ keys, and every non-root internal node has between $t$ and $m$ children; the root has between 1 and $m - 1$ keys, and 2 to $m$ children unless it is a leaf. All leaves lie at one depth. A B-tree of height $h$ (edges) with $n$ keys therefore satisfies

$$2t^h - 1 \le n \le m^{h+1} - 1, \qquad h \le \log_t \frac{n+1}{2},$$

so search and updates are $O(\log n)$. A trie answers insert, search and delete for a key of length $L$ in $O(L)$ steps, independent of how many keys it holds.

**Proof.** Insertion adds a key to a leaf; when a node reaches $m$ keys it splits around its median, which moves up to the parent. The two halves get $\lceil (m-1)/2 \rceil$ and $\lfloor (m-1)/2 \rfloor = \lceil m/2 \rceil - 1 = t - 1$ keys, so every node created by a split meets the lower bound, and deletion restores it by borrowing or merging. The root is the exception: when it splits, the new root holds just the median, one key with two children, so a lower bound of $t - 1$ keys on the root would make that split impossible. The tree grows only at the root, which is why all leaves stay at one depth. For the minimum, the root has at least 1 key and 2 children, and every lower internal node at least $t$ children, so depth $i \ge 1$ holds at least $2t^{i-1}$ nodes, each with at least $t - 1$ keys:

$$n \ge 1 + \sum_{i=1}^{h} 2t^{i-1}(t-1) = 1 + 2(t^h - 1) = 2t^h - 1 .$$

Solving for $h$ gives the logarithmic bound. The maximum comes from $m^i$ nodes at depth $i$ with $m - 1$ keys each: $(m-1)\sum_{i=0}^{h} m^i = m^{h+1} - 1$. In a trie each edge carries one character and a key is the path spelled from the root, so every operation follows at most $L$ edges, one per character, plus $O(1)$ at the end; the number of stored keys never enters, only the alphabet size per step if children are scanned.

**GATE use.** Questions ask for the minimum or maximum number of keys or nodes in a B-tree of order $m$ and height $h$, or the result of inserting a sequence with splits. The traps are applying the $t - 1$ minimum to the root, which overstates the minimum key count (the root may hold a single key), and confusing order (max children) with the minimum degree $t$ used by CLRS. B+ tree index sizing belongs with indexing in DBMS.

**Check.** For $m = 3, \dots, 10$ a script confirms that splitting an $m$-key node leaves at least $\lceil m/2 \rceil - 1$ keys in each half, and for $m \in \{3, 4, 5, 7\}$, $h \le 4$, that the level-by-level minimum equals $2t^h - 1$. For $m = 5$ ($t = 3$) and $h = 2$: at least $2 \cdot 9 - 1 = 17$ keys and at most $5^3 - 1 = 124$.
