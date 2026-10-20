# Analytical aptitude: derivations

## The four categorical forms as set statements, and the square of opposition
<!-- topics: ga-analytical.categorical-propositions -->

**Claim.** Read each term as a set inside a universe $U$, and assume (as aptitude questions do) that every named term is non-empty. Then the four standard forms are

$$\text{A: } S \subseteq P, \qquad \text{E: } S \cap P = \varnothing, \qquad \text{I: } S \cap P \ne \varnothing, \qquad \text{O: } S \setminus P \ne \varnothing.$$

From these: A and O are contradictories, and so are E and I (in every situation exactly one of each pair is true). A and E cannot both be true but can both be false. I and O cannot both be false but can both be true. A implies I, and E implies O. "Some S are P" never implies "Some S are not P".

**Proof.** O says some element of $S$ lies outside $P$, which is word for word the negation of "every element of $S$ lies in $P$", so A and O are negations of each other. I says $S \cap P$ has an element and E says it has none, so they are negations too. If A and E were both true, every element of $S$ would lie in $P$ and none would, so $S = \varnothing$, which the non-emptiness assumption excludes. Taking $S = \{x, y\}$ and $P = \{x\}$ makes A false (y is outside $P$) and E false (x is in both), so both can fail; the same set pair makes I true (x) and O true (y). I and O both false would mean $S \cap P = \varnothing$ and $S \subseteq P$, which again forces $S = \varnothing$. For A implies I: pick any $x \in S$, which exists because $S$ is non-empty; A puts $x$ in $P$, so $x \in S \cap P$. E implies O the same way. Without the non-emptiness assumption A no longer implies I: with $S = \varnothing$, A is vacuously true and I is false. Finally, "Some S are P" is true when $S = P$, and then "Some S are not P" is false, so I never carries O with it: in logic "some" means at least one, possibly all.

**GATE use.** Premises are taken as true whatever they say ("All dogs are clouds"); only the set relations count. The traps are reading "Some" as "Some but not all", and treating A and E as contradictories, which lets a student who rejects "All" wrongly accept "No".

**Check.** An enumeration over every pattern of occupied regions for two non-empty terms (the four regions $S \cap P$, $S \setminus P$, $P \setminus S$, outside both) confirmed: A and E never both true; A and E both false possible; I and O never both false; I and O both true possible; A true forces I true; and with $S$ allowed empty, A true with I false occurs.

## Conversion, obversion and contraposition
<!-- topics: ga-analytical.immediate-inference, ga-analytical.categorical-propositions -->

**Claim.** Write $\bar{X} = U \setminus X$ for "non-X". Conversion (swap the terms) is valid for E and I, valid for A only in the weakened form "Some P are S", and invalid for O. Obversion (change the quality and replace the predicate by its complement) is valid in both directions for all four forms. Contraposition (swap the terms and complement both) is valid for A and O and invalid for E and I.

**Proof.** Conversion. E and I speak about $S \cap P$, which equals $P \cap S$, so swapping the terms changes nothing. For A, $S \subseteq P$ and a non-empty $S$ give an element of $P \cap S$, so "Some P are S" follows; "All P are S" fails on $S = \{x\}$, $P = \{x, y\}$. For O, take $S = \{x, y\}$ and $P = \{y\}$: some S ($x$) is not P, but every P is S, so "Some P are not S" is false.

Obversion rests on two set identities, $X \subseteq Y \iff X \cap \bar{Y} = \varnothing$ and $\bar{\bar{Y}} = Y$. Then A, $S \subseteq P$, is the same statement as $S \cap \bar{P} = \varnothing$, which is E with predicate non-P: "No S is non-P". E, $S \cap P = \varnothing$, is $S \subseteq \bar{P}$: "All S are non-P". I, $S \cap P \ne \varnothing$, is $S \cap \bar{\bar{P}} \ne \varnothing$: "Some S are not non-P". O, $S \cap \bar{P} \ne \varnothing$, is "Some S are non-P". Each step is an identity, so each obverse is equivalent to its original.

Contraposition. For A, $S \subseteq P \iff \bar{P} \subseteq \bar{S}$, because $x \notin P$ and $x \in S$ would contradict $S \subseteq P$, and conversely. For O, "Some non-P are not non-S" says $\bar{P} \cap S \ne \varnothing$, the same set as $S \setminus P$, so it is identical to the original. For E, "No non-P is non-S" says $\bar{P} \cap \bar{S} = \varnothing$, that is $S \cup P = U$; the premise $S \cap P = \varnothing$ does not force this, since some element of $U$ can lie outside both. For I, take $U = \{x, y, z\}$, $S = \{x, y\}$, $P = \{x, z\}$, so all four terms are non-empty ($\bar{S} = \{z\}$, $\bar{P} = \{y\}$): "Some S are P" holds ($x$), but $\bar{P} \cap \bar{S} = \varnothing$, so "Some non-P are non-S" fails.

**GATE use.** From "All engineers are graduates" you may infer "All non-graduates are non-engineers" (contraposition) and "Some graduates are engineers" (limited conversion), never "All graduates are engineers". The trap is the full conversion of an A statement, which is the converse of a conditional in disguise.

**Check.** A script enumerated every non-empty-term model on two terms with complements and tested each inference both ways. Conversion came out valid for E and I only, A converted to I, obversion was valid in both directions for all four forms, and contraposition was valid for A and O only.

## A conclusion follows only if it holds in every consistent diagram
<!-- topics: ga-analytical.venn-validity, ga-analytical.categorical-propositions -->

**Claim.** Three terms $A, B, C$ split the universe into $2^3 = 8$ regions. A situation is fixed, as far as categorical statements can tell, by which regions are non-empty. A conclusion follows from the premises exactly when it is true in every situation that makes all the premises true and keeps every term non-empty. Under that test the following chains are valid:

| Premise 1 | Premise 2 | Conclusion |
|---|---|---|
| All A are B | All B are C | All A are C |
| All A are B | No B is C | No A is C |
| Some A are B | All B are C | Some A are C |
| Some A are B | No B is C | Some A are not C |

while "Some A are B" with "Some B are C" yields no categorical conclusion about $A$ and $C$ in either order. When neither "Some A are C" nor "No A is C" follows, the disjunction "either I or II" still follows.

**Proof.** Each form is a statement about which regions are empty, so two situations with the same non-empty regions agree on every categorical statement; the finite list of region patterns covers every case.

The four chains are element chases. All–All: if $x \in A$ then $x \in B$ and so $x \in C$. All–No: if $x \in A$ then $x \in B$, and no member of $B$ is in $C$, so $x \notin C$. Some–All: the first premise gives a witness $x \in A \cap B$, and the second puts $x$ in $C$, so $x \in A \cap C$. Some–No: the same witness $x \in A \cap B$ is kept out of $C$ by the second premise, so $x \in A \setminus C$.

Some–Some gives nothing. In the situation $U = \{x\}$ with $x$ in all three sets, both premises hold, $A \subseteq C$ and $C \subseteq A$, so E and O between $A$ and $C$ (either order) are false. In the situation $U = \{x, y\}$ with $x \in A \cap B$ only and $y \in B \cap C$ only, both premises hold and $A \cap C = \varnothing$, so A and I between them are false. Each of the four forms fails in one of the two situations, so none follows. The shared B members may or may not be the same element, which is the whole reason.

Either-or. "Some A are C" and "No A is C" are contradictories (first section), so in every situation exactly one is true. The disjunction of the two is true in every situation, so it follows, even though neither disjunct does. The pair must be contradictory on the same two terms: I with E, or A with O. "Some A are C" with "Some A are not C" is not such a pair, since both can be true.

A "possibility" conclusion ("All A being C is a possibility") asks the opposite question: it follows when at least one consistent situation makes it true.

**GATE use.** The 1-mark MCQ gives two or three premises and asks which conclusions follow. Recipe: draw the tightest picture, then try to break each conclusion by stretching a circle (let a Some become All, move an unconstrained circle in or out). The traps are rejecting an either-or pair because neither part follows alone, and accepting a conclusion that holds in the first picture drawn.

**Check.** A script listed all 218 region patterns in which $A$, $B$ and $C$ are non-empty and confirmed the four chains, that Some–Some forces none of the eight conclusions $X(A, C)$ or $X(C, A)$, and that I/E and A/O split in every pattern. It also reproduced the chapter's examples: from "Some cats are dogs, All dogs are rats", "Some cats are rats" and "Some rats are cats" follow, while "All cats are rats" and "Some rats are not dogs" do not; from "Some tables are chairs, No chair is a desk" only "Some tables are not desks" follows.

## Affirmative premises never prove a negative conclusion
<!-- topics: ga-analytical.venn-validity -->

**Claim.** If every premise is affirmative (A or I form) and every term is non-empty, then no negative conclusion (E or O form) between any two of the terms follows. Such a conclusion is not false either: it can be true in some consistent situations and false in others.

**Proof.** Take the one-point situation: $U = \{x\}$ and every term equals $\{x\}$. For any two terms $S$ and $P$, $S \subseteq P$ holds and $S \cap P = \{x\}$ is non-empty, so every A and every I statement is true; every premise is satisfied. In the same situation $S \cap P \ne \varnothing$ makes every E statement false, and $S \setminus P = \varnothing$ makes every O statement false. So the premises are true and the negative conclusion is false in one consistent situation, and by the previous section it does not follow.

To see that "does not follow" is not "false", take "All A are B" and "Some B are C" with the conclusion "Some A are not C". In the one-point situation the conclusion is false. In the situation $A = \{x\}$, $B = \{x, y\}$, $C = \{y\}$ both premises hold ($x \in B$, and $y \in B \cap C$) and the conclusion is true ($x \in A \setminus C$). The conclusion is undetermined.

**GATE use.** A quick filter: with only All and Some premises, strike out every "No" and "Some … not" option at once. The trap, and the error in the source notes on page 70, is calling such a conclusion "universally false"; that would make its contradictory follow, and "Some A are C" does not follow from the example premises either.

**Check.** A script tried every pair of A or I premises on every ordered pair of the three terms, and every E or O conclusion on every ordered pair, over all 218 situations: no negative conclusion followed in any of the combinations. For the example it confirmed that both "Some A are not C" and "Some A are C" are undetermined.

## Conditionals: the contrapositive is the only equivalent form
<!-- topics: ga-analytical.conditional-statements, ga-analytical.logical-fallacies -->

**Claim.** The material conditional $P \to Q$ is false only when $P$ is true and $Q$ is false. Then

$$(P \to Q) \equiv (\lnot Q \to \lnot P) \equiv (\lnot P \lor Q), \qquad \lnot(P \to Q) \equiv P \land \lnot Q.$$

The converse $Q \to P$ and the inverse $\lnot P \to \lnot Q$ are equivalent to each other and not to $P \to Q$. "P only if Q" is $P \to Q$; "P if Q" is $Q \to P$; "P unless Q" is $\lnot Q \to P$, which is $P \lor Q$. From $P \to Q$ and $\lnot Q$ one may infer $\lnot P$ (modus tollens), but affirming the consequent ($Q$, so $P$) and denying the antecedent ($\lnot P$, so $\lnot Q$) are invalid.

**Proof.** Two propositions are equivalent when they agree on all four rows of the truth table.

| $P$ | $Q$ | $P \to Q$ | $\lnot Q \to \lnot P$ | $\lnot P \lor Q$ | $Q \to P$ | $\lnot P \to \lnot Q$ |
|---|---|---|---|---|---|---|
| T | T | T | T | T | T | T |
| T | F | F | F | F | T | T |
| F | T | T | T | T | F | F |
| F | F | T | T | T | T | T |

Each column is filled from the defining rule: a conditional is false exactly in the row where its own antecedent is true and its consequent false. For $\lnot Q \to \lnot P$ that row is $Q$ false and $P$ true, the same row as for $P \to Q$, so the two columns agree. $\lnot P \lor Q$ is false only when $\lnot P$ and $Q$ are both false, again the row $P$ true, $Q$ false. The converse fails only in row 3, and the inverse also fails only in row 3 (its antecedent $\lnot P$ is true and its consequent $\lnot Q$ is false there), so they agree with each other and differ from $P \to Q$ in row 3. Negating the column $P \to Q$ leaves T only in row 2, which is $P \land \lnot Q$. "If P then not Q" is a different statement: in rows 3 and 4 it is true, while $\lnot(P \to Q)$ is false.

Translations. "P only if Q" says P cannot happen without Q, so whenever $P$ holds, $Q$ holds: $P \to Q$, and $Q$ is a necessary condition. "P if Q" puts $Q$ in the antecedent. "P unless Q" says that if $Q$ fails then $P$ holds: $\lnot Q \to P$, and by the disjunction rule this is $\lnot\lnot Q \lor P = Q \lor P$.

Inference rules. An argument form is valid when no row makes all premises true and the conclusion false. For modus tollens the premises $P \to Q$ and $\lnot Q$ are both true only in row 4, where $\lnot P$ holds. For affirming the consequent, row 3 makes $P \to Q$ and $Q$ true and $P$ false, a counterexample. For denying the antecedent, row 3 again makes $P \to Q$ and $\lnot P$ true and $\lnot Q$ false.

**GATE use.** "If it rains, the match is cancelled" ($R \to C$) licenses only "If the match is not cancelled, it did not rain". Options built as the converse ("if cancelled, it rained"), the inverse ("if no rain, not cancelled") or "cancelled only if it rains" (again $C \to R$) are all wrong. The trap is the converse, which sounds natural in English, and reading "only if" as "if".

**Check.** A script evaluated every identity in the claim on all four rows, found the counterexample row $P = $ F, $Q = $ T for both fallacies, and confirmed that among the four rain options only the first matches $R \to C$, and that for "enter only if ticket" options 1, 2 and 4 match $E \to T$ and option 3 does not.

## Truth-teller puzzles reduce to a finite case table
<!-- topics: ga-analytical.truth-teller-puzzles -->

**Claim.** Suppose exactly one of $n$ suspects is the culprit and each statement's truth depends only on who the culprit is. Then the puzzle has exactly $n$ cases; evaluating every statement in each case and keeping the cases whose number of true statements matches the stated count solves it. Two statements that contradict each other (in particular a statement $S$ and "the speaker of $S$ is lying") contain exactly one truth in every case.

**Proof.** Fixing the culprit fixes every fact the statements mention, so each statement has one truth value per case. The condition "exactly $k$ statements are true" is a test on that row, and a case is consistent exactly when it passes. Since the cases are disjoint and exhaust the possibilities, the consistent cases are precisely the possible answers: the puzzle has a definite answer if and only if exactly one case passes, which is why stopping at the first passing case is unsafe. A statement "B is lying" is true exactly when B's statement is false, so the two always split one true and one false. With the budget "exactly one statement is true", such a pair spends the whole budget, so every other statement must be false, which usually pins the culprit at once.

**GATE use.** The 2-mark MCQ gives four suspects and a count of true statements. Write the 4-row table, then confirm only one row passes. The trap is accepting a passing row without checking the others.

**Check.** A says "B did it", B says "D did it", C says "I did not do it", D says "B is lying", and exactly one statement is true. B's and D's statements split, so A's and C's are false; C's being false means C did it. A script ran all four cases: true-statement counts 2, 3, 1 and 2 for culprits A, B, C and D, so C is the unique answer.

## Left and right from the facing direction
<!-- topics: ga-analytical.arrangement-puzzles -->

**Claim.** With east as $x$ and north as $y$, a person facing the unit direction $f = (f_x, f_y)$ has their right along $(f_y, -f_x)$, that is $f$ turned $90^\circ$ clockwise. Consequently: in a row numbered west to east, a person facing north has the higher seat numbers on the right, and a person facing south has them on the left. At a round table seen from above, a person facing the centre has the next seat anticlockwise on the right; facing outward, the next seat clockwise. A puzzle's asked fact is determined only if it is the same in every arrangement that satisfies all clues.

**Proof.** A clockwise quarter turn sends north $(0, 1)$ to east $(1, 0)$, east to south $(0, -1)$, and so on; as a linear map it is $(x, y) \mapsto (y, -x)$, and one's right is one's facing direction turned a quarter clockwise (facing north, right is east). Facing north, $f = (0, 1)$ gives right $(1, 0)$, east, the direction of higher seat numbers. Facing south, $f = (0, -1)$ gives right $(-1, 0)$, west, so left and right swap relative to the seat numbers.

At a round table, put a person at angle $\varphi$ on the unit circle, position $(\cos\varphi, \sin\varphi)$. Facing the centre means $f = (-\cos\varphi, -\sin\varphi)$, and the rule gives right $= (-\sin\varphi, \cos\varphi)$. That is the derivative of the position with respect to $\varphi$, the direction in which $\varphi$ increases, which is anticlockwise. Facing outward negates $f$ and therefore negates the right vector: clockwise.

For determinacy: the clues cut the set of all seatings down to a set of surviving arrangements, and the true seating is one of them. If two survivors disagree on the asked fact, the clues cannot tell which holds, so the fact is undetermined; if all survivors agree, it is forced.

**GATE use.** Fix the frame (row or circle, facing direction, numbering) first, then place absolute clues, then rigid blocks, then branch. The traps are reading "to the right of" as "immediately to the right of", and the facing-south or facing-centre flip. The source notes' square-table problem on page 76 makes the related slip: A in the north seat faces south, so A's right is the west seat; B sits there and, facing the centre, faces east. "West" is B's seat, not B's facing direction.

**Check.** A script confirmed the right-vector rule at 12 seats around a circle and the square-table case (right of south is west; the west seat faces east). With P, Q, R, S, T in seats 1–5 facing north, Q immediately right of P, R and S at the two ends, S not next to Q and T not next to P, it found exactly two seatings, R P Q T S and S P Q T R: "who is in the middle" is answerable (Q) but "who is at seat 1" is not. For the chapter's row puzzle it found the unique seating R T S P Q.

## Direction sense: displacement adds by axis, headings add mod 360°
<!-- topics: ga-analytical.direction-sense -->

**Claim.** Measure headings clockwise from north. A walk of legs with lengths $\ell_i$ and headings $\theta_i$ ends at the net displacement $(x, y) = \left(\sum_i \ell_i \sin\theta_i,\; \sum_i \ell_i \cos\theta_i\right)$, and its straight-line distance from the start is

$$d = \sqrt{x^2 + y^2}.$$

After turns from a starting heading $\theta_0$, the heading is $\theta = (\theta_0 + \sum \theta_{cw} - \sum \theta_{acw}) \bmod 360^\circ$, with a right turn $+90^\circ$ and a left turn $-90^\circ$. The start as seen from the end is the direction of $(-x, -y)$, the reverse of the end as seen from the start.

**Derivation.** A leg of length $\ell$ at heading $\theta$ is the vector $\ell(\sin\theta, \cos\theta)$: heading $0^\circ$ gives $(0, \ell)$, north, and $90^\circ$ gives $(\ell, 0)$, east. Position after several legs is the sum of the leg vectors, and vector addition is done coordinate by coordinate, so east–west legs add into $x$ and north–south legs into $y$; opposite legs cancel. The axes are perpendicular, so the start, the point $(x, 0)$ and the end form a right triangle with legs $\lvert x \rvert$ and $\lvert y \rvert$, and Pythagoras gives $d$. The path length $\sum \ell_i$ is at least $d$ by the triangle inequality and equals it only for a straight walk.

A turn rotates the facing direction; rotations about a point compose by adding their angles, clockwise counted positive, and a rotation by $360^\circ$ is the identity, so only the sum mod $360^\circ$ matters. A negative sum gets $360^\circ$ added. The vector from end to start is start minus end, $-(x, y)$; negating both coordinates swaps north with south and east with west, so north-east becomes south-west.

**GATE use.** NAT questions ask for $d$ after three or four legs; MCQs ask for the final heading or the direction of the start from the end. The traps are adding path lengths, tracking the heading wrongly after a left turn from south (it faces east), and answering the end-from-start direction when the start-from-end is asked. Shadows: the morning sun is in the east, so a shadow points west; in the evening it points east.

**Check.** North 10, right 8, right 4 ends at $(8, 6)$ with heading $(0 + 90 + 90) \bmod 360 = 180^\circ$ (south) and $d = 10$; the start lies south-west of the end. Facing north, $135^\circ$ clockwise then $45^\circ$ anticlockwise gives $90^\circ$, east; three left turns give $-270 \bmod 360 = 90^\circ$, east. The chapter's walk (north 10, right 6, right 18, left 9) ends at $(15, -8)$ with $d = 17$. All verified by script.

## Blood relations as compositions of parent, sibling and spouse links
<!-- topics: ga-analytical.blood-relations -->

**Claim.** Every kinship term is a composition of three base relations (parent of, sibling of, spouse of) plus the gender of the person named. A chained description is decoded by composing links from the speaker outward, and coded relations ("A * B means A is the father of B") are decoded one operator at a time, each linking the two names beside it. A relation that depends on the gender of someone whose gender no gendered word fixes is undetermined. Generations count as $+1$ per parent link and $-1$ per child link.

**Derivation.** "Father" is "male parent", "uncle" is "male sibling of a parent" or "husband of a parent's sister", "nephew" is "male child of a sibling", and so on; each is a path in the family tree together with one gender at its end. The answer to "how is X related to Y" is the path from Y to X, read off the tree. Reversing a path gives the inverse relation, and naming it needs the gender at the new end: if A is B's father, B is A's son or daughter, depending on B. Gender enters only from words such as he, she, son, mother, brother; a name carries none, so if the last person on the path has no gendered word, the term is undetermined.

The phrase "the only son of my mother" is a case split on the speaker. If the speaker is male, the speaker is a son of the mother, and being the only son he is that son. If the speaker is female, the only son is her brother. So "he is the son of the only son of my mother" makes the speaker the boy's father in the first case and his aunt in the second. The source notes' answer "father" for Suresh on page 72 rests on reading the name as male, which is the assumption the gender rule forbids; the puzzle needs a gendered word to be fully determined.

In a coded chain "P * Q + R" with * for father and + for mother: P * Q makes P the father of Q, and Q + R makes Q the mother of R and so female. Composing, P is the father of R's mother, the maternal grandfather.

**GATE use.** MCQs give a sentence or a coded chain and ask the relation. The traps are answering the inverse (son for father), fixing gender from a name, and conflating paternal with maternal sides.

**Check.** A script enumerated both speaker genders for "only son of my mother" and returned father or aunt; it also composed father ∘ mother to get maternal grandfather.

## Series with a constant k-th difference are polynomials
<!-- topics: ga-analytical.number-series, ga-analytical.classification-matrix -->

**Claim.** Let $\Delta t_n = t_{n+1} - t_n$. A sequence has a constant non-zero $k$-th difference $d$ exactly when $t_n$ is a polynomial in $n$ of degree $k$, and then $d = k!\, a_k$ where $a_k$ is the leading coefficient. For $k = 2$ with second difference $\Delta^2$,

$$t_n = a n^2 + b n + c, \qquad a = \tfrac{\Delta^2}{2}, \quad b = (t_2 - t_1) - 3a, \quad c = t_1 - a - b.$$

A series built by "multiply by $p$, then add $q$" with $p \ne 1$ has $t_n = L + p^{\,n-1}(t_1 - L)$ where $L = q/(1 - p)$. Any finite list of terms fits infinitely many rules, so a rule counts only if it reproduces every given term.

**Proof.** For $j \ge 1$, $(n+1)^j - n^j = j n^{j-1} + (\text{lower powers})$ by the binomial theorem. So $\Delta$ sends a polynomial of degree $j$ with leading coefficient $a_j$ to one of degree $j - 1$ with leading coefficient $j a_j$, and sends a constant to 0. Applying $\Delta$ $k$ times to a degree-$k$ polynomial leaves the constant $k(k-1)\cdots 1 \cdot a_k = k!\, a_k$. Conversely, suppose $\Delta^k t$ is the constant $d$. Then $u_n = t_n - \tfrac{d}{k!} n^k$ has $\Delta^k u = 0$, so $\Delta^{k-1} u$ is constant and, by induction on $k$, $u$ is a polynomial of degree below $k$; hence $t$ has degree $k$. For $k = 2$: $d = \Delta^2 = 2a$ gives $a = \Delta^2/2$; $t_2 - t_1 = a(4 - 1) + b(2 - 1) = 3a + b$ gives $b$; and $t_1 = a + b + c$ gives $c$.

For the affine recurrence $t_{n+1} = p t_n + q$, the value $L$ with $L = pL + q$ is $L = q/(1-p)$. Subtracting, $t_{n+1} - L = p(t_n - L)$, so $t_n - L$ is geometric with ratio $p$, giving the formula.

Underdetermination: for any $m$ given terms and any proposed next value $v$, the $m + 1$ points $(1, t_1), \dots, (m, t_m), (m+1, v)$ lie on a polynomial of degree at most $m$ (Lagrange interpolation). So no finite list forces its continuation; the intended rule is the simplest one that fits every term, and a rule that fits the first three terms but not the fourth is simply wrong.

**GATE use.** Test first differences, second differences, ratios, nearby squares and cubes, primes, and interleaved series on alternate positions. Extending the difference table is faster than solving for $a, b, c$. Odd-one-out and matrix questions use the same discipline: the rule must hold on every item but one (or on every complete row), and 37, 41, 51, 53 has 51 $= 3 \times 17$ as the only composite. The trap is a rule fitted to the first few terms.

**Check.** For 3, 8, 17, 30, 47 the differences are 5, 9, 13, 17 and the second difference 4, so $a = 2$, $b = 5 - 6 = -1$, $c = 3 - 2 + 1 = 2$, $t_n = 2n^2 - n + 2$, which reproduces all five terms and gives $t_6 = 68$ (the next difference is 21). For 5, 11, 23, 47 ($p = 2$, $q = 1$), $L = -1$ and $t_n = 6 \cdot 2^{n-1} - 1$, next term 95. The series 1, 4, 27, 16, 125, 36 is $n^3$ at odd $n$ and $n^2$ at even $n$, so the 7th term is 343. The terms 2, 4, 8 continue as 16 under doubling and as 14 under the quadratic with differences 2, 4, 6. A script checked these and, on 200 random polynomials of degree up to 4, that the $k$-th difference is the constant $k!\,a_k$.

## Letter positions, mirror codes, shift codes and value codes
<!-- topics: ga-analytical.letter-coding, ga-analytical.analogies -->

**Claim.** Number the letters $\mathrm{pos}(A) = 1, \dots, \mathrm{pos}(Z) = 26$. Then $E, J, O, T, Y$ sit at $5, 10, 15, 20, 25$. Reverse-alphabet coding sends a letter $x$ to the letter $\bar{x}$ with

$$\mathrm{pos}(x) + \mathrm{pos}(\bar{x}) = 27;$$

it is its own inverse and fixes no letter. A shift by $s$ sends position $p$ to $((p - 1 + s) \bmod 26) + 1$ and is decoded by the shift $-s$. A value code that sums letter positions gives the same number to any rearrangement of the same letters.

**Proof.** E is the 5th letter and every fifth letter after it moves the position by 5, so the anchors are $5k$ for $k = 1, \dots, 5$; every letter from C to Z is at most two steps from one of them ($R = T - 2 = 18$), and A and B are counted from A = 1 instead. Writing the alphabet backwards puts Z first, Y second, and in general the letter at position $p$ in place $27 - p$, since the place from the end is $26 - p + 1$. The mirror of the mirror is at $27 - (27 - p) = p$, so encoding twice returns the word and decoding uses the same rule. A fixed letter would need $p = 27 - p$, that is $p = 13.5$, not an integer, so M (13) pairs with N (14). For the shift, subtracting 1 moves positions to $0, \dots, 25$, where adding $s$ mod 26 wraps Z back to A; adding 1 restores the numbering. The shifts by $s$ and $-s$ compose to the shift by 0, the identity. Sums are unchanged by reordering the terms, so value codes cannot tell anagrams apart.

Number analogies hide a function in the same way: in $7 : 50 :: 9 : ?$ the rule $n^2 + 1$ fits $7 \mapsto 50$, so $9 \mapsto 82$; $n(n + 1)$ gives 56 for 7 and is rejected because it fails the given pair.

**GATE use.** Coding MCQs and NATs give one or two encoded words and ask for a third. Find the offset on the first two letters, then confirm on all of them. The traps are forgetting the wrap past Z and assuming a growing offset is constant. For word analogies the same discipline applies: name the relation in a sentence and check that it holds in the same order.

**Check.** A script confirmed the anchors, that GATE mirrors to TZGV and back, that no letter is its own mirror, that $Y + 3 = B$ and $B - 3 = Y$, that CAT, DOG and RAT sum to 24, 26 and 39, and that $7^2 + 1 = 50$ and $9^2 + 1 = 82$.

## Ranks in a line: total and people between
<!-- topics: ga-analytical.numerical-relations -->

**Claim.** In a line of $N$ people, a person ranked $r_{\text{top}}$ from one end and $r_{\text{bottom}}$ from the other gives

$$N = r_{\text{top}} + r_{\text{bottom}} - 1.$$

For person X ranked $r_1$ from the left and a different person Y ranked $r_2$ from the right, the number between them is

$$B = \begin{cases} N - (r_1 + r_2) & \text{if } r_1 + r_2 \le N,\\ r_1 + r_2 - N - 2 & \text{if } r_1 + r_2 \ge N + 2,\end{cases}$$

and $r_1 + r_2 = N + 1$ is impossible for two different people.

**Derivation.** Number places $1, \dots, N$ from the left. A person $r$-th from the right stands in place $N - r + 1$, because the rightmost is place $N$ and each step left lowers it by one. Setting the left rank equal to that place, $r_{\text{top}} = N - r_{\text{bottom}} + 1$, gives the total: the person is counted in both ranks. X stands in place $r_1$ and Y in place $q = N - r_2 + 1$. Between two places $u < v$ there are $v - u - 1$ people. If $r_1 < q$, that is $r_1 + r_2 \le N$, then $B = N - r_2 + 1 - r_1 - 1 = N - (r_1 + r_2)$. If $r_1 = q$ the two ranks name the same place. If $r_1 > q$, that is $r_1 + r_2 \ge N + 2$, Y is left of X and $B = r_1 - (N - r_2 + 1) - 1 = r_1 + r_2 - N - 2$; the stretches counted from the two ends overlap.

**GATE use.** NATs ask for the total, or for the count between two people, or for a rank after two people swap. The traps are dropping the $-1$ in the total and using $N - (r_1 + r_2)$ when the stretches overlap, which gives a negative or wrong count.

**Check.** 14th from the left and 23rd from the right gives $N = 36$. With $N = 40$: ranks 10 from the left and 12 from the right stand in places 10 and 29 with 18 between, which is $40 - 22$; ranks 25 and 22 stand in places 25 and 19 with 5 between, which is $47 - 42$. A script compared both formulas with direct counting for every $N < 30$ and every pair of ranks.

## Inequality chains, data sufficiency and sign rules
<!-- topics: ga-analytical.numerical-relations -->

**Claim.** For real numbers: $A > B \ge C$ gives $A > C$; $A \ge B \ge C$ gives $A \ge C$; $A \ge B = C$ gives $A \ge C$; but $A > B < C$ (signs pointing opposite ways) gives no relation between $A$ and $C$. A statement is sufficient in data sufficiency exactly when every value consistent with it gives the same answer; a statement that forces the answer "no" is sufficient. A product of non-zero factors is negative exactly when it has an odd number of negative factors.

**Proof.** Write $A - C = (A - B) + (B - C)$. If the first bracket is positive and the second non-negative, the sum is positive; if both are non-negative, the sum is non-negative; equality $B = C$ makes the second bracket zero. With $A > B < C$ the brackets $A - B > 0$ and $B - C < 0$ have opposite signs, so the sum can have any sign: $(A, B, C) = (3, 0, 1)$, $(1, 0, 1)$ and $(1, 0, 3)$ satisfy the chain with $A > C$, $A = C$ and $A < C$. For sufficiency, if two values allowed by a statement give different answers, the statement cannot decide; "Is $x > 0$?" with $x^2 > 0$ allows $x = 2$ and $x = -2$, so it is insufficient, while $x^3 > 0$ is sufficient because $x \mapsto x^3$ is strictly increasing with $0^3 = 0$, so $x^3 > 0 \iff x > 0$. For signs, induct on the number of factors: multiplying by a positive factor keeps the sign, and by a negative one flips it, so the sign flips once per negative factor. Parity rules follow from the forms $2a$ and $2a + 1$: $(2a + 1) + (2b + 1) = 2(a + b + 1)$ is even.

**GATE use.** Given $P > Q \ge R = S < T$, the forced relations are $P > S$, $Q \ge S$ and $T > R$, while $P > T$ is not forced. Coded inequalities ("P @ Q means P is not greater than Q", i.e. $P \le Q$) are translated first, then chained: $A > B \ge C = D \le E$ forces $A > D$ and $E \ge C$ but neither $E > C$ nor $A > E$. The trap is chaining across a sign reversal.

**Check.** A script tested every triple in $\{-3, \dots, 3\}^3$: the two transitive rules never failed and $A > B < C$ produced all three relations between $A$ and $C$. It also confirmed $x^3 > 0 \iff x > 0$ on $-10, \dots, 10$, and the parity sign rule on all $4^4$ products of factors from $\{-3, -1, 2, 5\}$. $P = 2$, $Q = 1$, $R = S = 0$, $T = 5$ satisfies the chain above with $P < T$.

## Number properties: divisibility tests, unit-digit cycles and counting multiples
<!-- topics: ga-analytical.number-properties, ga-analytical.numerical-relations -->

**Claim.** Let $n$ have decimal digits $d_k \dots d_1 d_0$, so $n = \sum_i d_i 10^i$. Then $n \equiv \sum_i d_i \pmod 9$ (hence mod 3), $n \equiv \sum_i (-1)^i d_i \pmod{11}$, $n \equiv d_1 d_0 \pmod 4$ and $n \equiv d_2 d_1 d_0 \pmod 8$. If $a$ and $b$ are coprime, $a \mid n$ and $b \mid n$ give $ab \mid n$. For integers $a \ge 0$ and $n \ge 1$,

$a^n \equiv (a \bmod 10)^{r} \pmod{10}, \qquad r = ((n-1) \bmod 4) + 1.$

The count of integers in $1, \dots, N$ divisible by $a$ or $b$ is $\lfloor N/a \rfloor + \lfloor N/b \rfloor - \lfloor N/\operatorname{lcm}(a,b) \rfloor$. For positive reals and a positive integer $k$, $x < y \iff x^k < y^k$.

**Proof.** Since $10 \equiv 1 \pmod 9$, every $10^i \equiv 1$, so $n \equiv \sum d_i$; 3 divides 9, so the same holds mod 3. Since $10 \equiv -1 \pmod{11}$, $10^i \equiv (-1)^i$, which gives the alternating sum. Since $100 = 4 \cdot 25$ and $1000 = 8 \cdot 125$, all digits from place 2 (mod 4) or place 3 (mod 8) upward contribute multiples of the modulus. For the product rule, write $n = a m$; $b \mid am$ with $\gcd(a, b) = 1$ forces $b \mid m$ (Euclid's lemma), so $ab \mid n$. Without coprimality the rule fails: $6$ is divisible by 2 and by 6 but not by 12.

For unit digits, $a^n \bmod 10$ depends only on $a \bmod 10$, because $a = 10q + u$ gives $a^n = u^n + 10(\dots)$ by the binomial theorem. Check the ten last digits $u$: $u \in \{0, 1, 5, 6\}$ satisfy $u^2 \equiv u$; $u \in \{4, 9\}$ satisfy $u^3 \equiv u$; $u \in \{2, 3, 7, 8\}$ satisfy $u^5 \equiv u \pmod{10}$ (for example $2^5 = 32$, $3^5 = 243$). In every case $u^{m+4} \equiv u^m$ for $m \ge 1$, so the exponent can be reduced mod 4 as long as it stays at least 1, which is what $r = ((n-1) \bmod 4) + 1 \in \{1, 2, 3, 4\}$ does. Taking $r = 0$ instead would give $u^0 = 1$, wrong for $u = 2$ and $n = 8$.

For the count, the multiples of $a$ in $1, \dots, N$ are $a, 2a, \dots, \lfloor N/a \rfloor a$. An integer divisible by both $a$ and $b$ is exactly a multiple of $\operatorname{lcm}(a, b)$, so adding the two counts counts those twice, and subtracting them once gives $\lvert A \cup B \rvert = \lvert A \rvert + \lvert B \rvert - \lvert A \cap B \rvert$. For powers, $y^k - x^k = (y - x)(y^{k-1} + \dots + x^{k-1})$ and the second factor is positive, so the two differences share a sign.

**GATE use.** Last-digit NATs: reduce bases mod 10 and exponents mod 4 (0 becomes 4). Divisibility and data-sufficiency questions lean on the coprime product rule: "divisible by 3, and $n^2$ divisible by 4" settles divisibility by 6, since $n^2$ even forces $n$ even. Comparison MCQs raise all candidates to a common power: $\sqrt 2, \sqrt[3]{3}, \sqrt[6]{6}$ become 8, 9, 6. The traps are $r = 0$, subtracting $\lfloor N/ab \rfloor$ when $\gcd(a, b) > 1$, and combining non-coprime divisors.

**Check.** A script confirmed the digit tests for 3, 9, 11, 4 and 8 on every $n < 10^5$ (918082 $= 11 \times 83462$, alternating sum $-22$), that $12 \mid n \iff 3 \mid n \land 4 \mid n$ for $n < 10^4$, and the unit-digit rule for every $a < 200$ and $n < 60$. It gave $7^{95} \equiv 3$, $2^{2027} + 3^{2027} + 7^{2027} \equiv 8 \pmod{10}$, 47 multiples of 3 or 5 up to 100, 167 multiples of 4 or 6 up to 500 ($125 + 83 - 41$), and $2^{30} = 1073741824 < 3^{20} = 3486784401$. Over $-1000 \le n < 1000$, statement I alone and II alone each allow both answers to "is $6 \mid n$?", while both together allow only yes.

## Assumptions are necessary conditions: the negation test
<!-- topics: ga-analytical.critical-reasoning, ga-analytical.logical-fallacies -->

**Claim.** In an argument with premises $\Pi$ and conclusion $C$, an implicit assumption is a statement $H$ that the argument needs: given $\Pi$, if $C$ is to hold then $H$ holds, i.e. $C \to H$. The negation test (negate $H$; if the argument collapses, $H$ is an assumption) is the contrapositive $\lnot H \to \lnot C$ of that requirement. A sufficient assumption ($\Pi \land H$ guarantees $C$) is a different and stronger requirement. A circular argument is formally valid but gives no support; a false dilemma is a valid form with a false premise.

**Derivation.** "The argument needs $H$" means there is no way for the argument's conclusion to stand, given its premises, while $H$ fails. That is $C \to H$ in the context of $\Pi$, and by the contrapositive section it is equivalent to $\lnot H \to \lnot C$: assume $H$ false and see the conclusion fall. A statement that would merely make $C$ more likely, or that is true in the real world but unused by the argument, fails the test, because negating it leaves the argument intact. A strengthener adds a premise that makes $C$ more probable given $\Pi$, typically by closing the gap between premise and conclusion or ruling out another cause; a weakener supplies another cause or breaks that link.

Circular reasoning has the form "$C$, therefore $C$". As a form it is valid, since $C \to C$ is true in both rows, but accepting the premise already requires accepting the conclusion, so it supports nothing. A false dilemma uses disjunctive syllogism, "$A$ or $B$; not $A$; so $B$", which is valid (the only row with $A \lor B$ true and $A$ false has $B$ true); the fault is the premise $A \lor B$, which is false when a third option exists. The formal fallacies of the conditional (affirming the consequent, denying the antecedent) are invalid forms, shown by their counterexample row in the conditionals section. Ad hominem and straw man attack something other than the stated argument, so they leave its premises and its link to $C$ untouched.

**GATE use.** "Advertise on TV to raise sales" assumes TV adverts reach likely buyers: negate it and the recommendation has no point. Options with extreme words (always, only, never) usually overreach and fail as conclusions. The trap is choosing a statement that is true but that the argument does not need.

**Check.** A script confirmed by truth table that disjunctive syllogism is valid and that affirming the consequent and denying the antecedent each have the counterexample row $P = $ F, $Q = $ T.
