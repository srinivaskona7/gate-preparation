# Verbal aptitude: derivations

## The twelve tense forms and the passive as one composition rule
<!-- topics: ga-verbal.tenses-voice, ga-verbal.subject-verb-agreement -->

**Claim.** An English finite verb phrase is built from four optional layers in a fixed order: a time choice (present, past, or future with *will*), the perfect layer *have* + V3, the progressive layer *be* + V-ing and the passive layer *be* + V3, followed by the main verb. Two rules fix every form: each auxiliary decides the form of the word right after it, and tense and agreement are carried only by the first word of the phrase. The active forms therefore number $3 \times 2 \times 2 = 12$, the passive is obtained by adding the passive layer to any of them, and in a passive sentence the first auxiliary agrees with the new subject (the old object).

**Derivation.** Choose the time (3 ways), then whether the perfect layer is present (2 ways) and whether the progressive layer is present (2 ways). The layers always stack in the order perfect, progressive, passive, so a choice of layers gives exactly one sequence of words, and the product rule gives 12 active forms. Build the phrase left to right. *Have* forces the next word into V3, *be* of the progressive forces V-ing, *be* of the passive forces V3, and *will* forces V1. The first word is the only free slot, so it alone takes the present or past form and the person and number of the subject. For *fix* with subject *it*: present perfect continuous is *has been fixing* (*has* carries present and singular, *been* is V3 because *have* precedes it, *fixing* is V-ing because progressive *be* precedes it). Adding the passive layer to the present perfect gives *has been fixed*: *have* forces *been*, passive *be* forces *fixed*. Since only the first word carries tense, the passive of *The team fixes the bug* is *The bug is fixed*, with *is* agreeing with *bug*.

Time markers then select among the 12. The present perfect describes an interval that reaches the moment of speaking, so it fits *since Monday* and *for ten years* and clashes with *two years ago* or *yesterday*, which name a closed point in the past and need the simple past. Of two past events, the earlier one is placed one step further back, in the past perfect: *By the time we arrived, the train had left.*

**GATE use.** Choose the correct verb form for a blank with a time marker. The traps are *has joined two years ago* (closed past point with a present perfect), a continuous form of a stative verb (*am knowing*), and a passive whose auxiliary agrees with the agent instead of the new subject.

**Check.** A script generated all 12 active forms and their passives for *it* + *fix*: from *fixes*, *is fixing*, *has fixed*, *has been fixing* through *will have been fixing*, and the passives *is fixed*, *was being fixed*, *will have been fixed*. The count was 12, and every form matched the left-to-right rule.

## Subject-verb agreement as a decision procedure
<!-- topics: ga-verbal.subject-verb-agreement, ga-verbal.pronouns -->

**Claim.** The verb agrees with the head of the subject noun phrase. Applied to the shapes GATE uses, this gives a procedure that returns singular or plural:

1. Delete prepositional phrases and relative clauses attached to the head (*of expensive chocolates*, *who live nearby*), and in an inverted sentence move the subject in front of the verb.
2. *X and Y* is plural, unless the pair names one thing (*bread and butter* as a dish) or *each* or *every* stands in front of the coordination (*Every boy and girl was present*), which makes it singular.
3. *either X or Y*, *neither X nor Y*, *X or Y*: agree with the nearer subject $Y$ (proximity rule).
4. *X as well as Y*, *X along with Y*, *X together with Y*: agree with $X$.
5. *each*, *every*, *either* or *neither* standing alone, *one of …*, *anyone*, *everyone*: singular.
6. A collective noun acting as one unit: singular.
7. Otherwise the verb takes the number of the head noun left by rule 1.

**Proof.** Rule 1 is the definition: a modifier does not change which noun heads the phrase, so it cannot change the number; deleting it removes only the distraction. In rule 2, *and* names two referents together, so the subject denotes a plurality; *each* or *every* in front distributes over the conjuncts and takes them one at a time, as in rule 5, so *Each student and teacher has a locker* is singular. Rule 7 is the head rule itself, applied when no special shape is present. In rule 4 the added phrase is a modifier, set off like a parenthesis, so by rule 1 it is deleted and $X$ remains. Rule 5 holds because these words pick out one member at a time: *each of the students* means every individual student taken singly, and the head is *each* or *one*, not the noun after *of*. Rule 3 is the case the head rule does not settle: with *or* or *nor* the sentence asserts the verb of $X$ or of $Y$ separately, and $X$ and $Y$ may differ in number, so English resolves the clash by agreeing with the subject nearer the verb. This also separates rule 3 from rule 5: *Neither of the plans works* has the pronoun *neither* as head (rule 5), while *Neither the plan nor the reports are ready* is the correlative (rule 3). The rules apply in order, rule 1 reduces the phrase and each of rules 2 to 7 returns a number when it matches; rule 7 matches every phrase that reaches it, so the procedure always ends with an answer.

**GATE use.** The grammar MCQ hides the head behind an *of* phrase or asks for a correlative. The traps are matching the noun nearest the verb inside an *of* phrase, applying the proximity rule to *neither of*, and treating *as well as* like *and*.

**Check.** A script encoded the seven rules and ran them on the chapter's sentences: *Neither the manager nor the employees* gives plural, *Neither the employees nor the manager* singular, *The box of chocolates* singular, *Neither of the plans* singular, *The captain as well as the players* singular, *Both Ravi and Amit* plural, *bread and butter* (one dish) singular, *The committee* acting as a unit singular, the inverted *On the table lies a stack of reports* singular, and *Every boy and girl* and *Each student and teacher* singular. All eleven matched the expected verb; *The box of chocolates* and *a stack of reports* are settled by rule 7.

## Conditionals: unreality is one step back in tense
<!-- topics: ga-verbal.conditionals-reported-speech -->

**Claim.** Write a conditional as a pair (if-clause form, result-clause form). The zero conditional is (present, present) and the first is (present, *will* + V1). The second conditional is the first with both clauses moved one step back, (simple past, *would* + V1), and the third is the second moved one step back again, (past perfect, *would have* + V3). In these four patterns the modal *would* appears only in the result clause, so *If I would have studied* is always wrong. The exception is an if-clause *would* that means willingness or a polite request (*If you would wait here, I will fetch the manager*), which is not an unreal condition and lies outside these patterns.

**Derivation.** English marks an unreal situation by moving the verb one step into the past, a distance in reality expressed as a distance in time. Define the step on the if-clause as present $\to$ simple past $\to$ past perfect, and on the result clause as *will* + V1 $\to$ *would* + V1 $\to$ *would have* + V3; the past of *will* is *would*, and the extra step past *would* is the perfect layer *have* + V3 from the first section. Applying the step once to the first conditional gives an unreal present or future: *If it rains, I will stay* becomes *If it rained, I would stay*. Applying it again gives an unreal past: *If it had rained, I would have stayed*. The past perfect is the last available step, so a mixed past-and-unreal meaning cannot be pushed further back. The if-clause never carries *will* or *would* in these patterns because the condition is stated as a fact in its own tense and the modal belongs to the consequence; this is also why a future condition takes the present: *If it rains tomorrow*, not *If it will rain tomorrow*. With *be* the past step gives *were* for every person in formal usage: *If I were you, I would accept.*

**GATE use.** A blank in either clause of a conditional. Read the form of the filled clause and step it to match: *if* + past perfect needs *would have* + V3, *if* + simple past needs *would* + V1. The traps are *would have* in the if-clause and mixing levels (*If I had known, I would tell you*, when the meaning is an unreal past).

**Check.** A script applied the step map to the first conditional (present, *will* + V1) and obtained (simple past, *would* + V1) and then (past perfect, *would have* + V3), the second and third conditionals of the chapter formulas.

## Reported-speech backshift is a function that loses information
<!-- topics: ga-verbal.conditionals-reported-speech -->

**Claim.** After a past reporting verb, the backshift map $f$ sends present simple to past simple, present continuous to past continuous, past simple and present perfect to past perfect, past continuous to past perfect continuous, *will* to *would*, *can* to *could* and *may* to *might*, and leaves past perfect, past perfect continuous, *would*, *could* and *might* unchanged. Then: (i) $f$ is not one-to-one, so the original direct speech cannot always be recovered from reported speech; (ii) every form reaches a fixed point in at most two applications; (iii) $f$ is not idempotent, so a sentence reported twice can differ from one reported once.

**Proof.** (i) $f(\text{past simple}) = f(\text{present perfect}) = f(\text{past perfect}) = \text{past perfect}$, so *He said he had finished* may report *I finished*, *I have finished* or *I had finished*. (ii) The fixed points are the past perfect forms and the past modals, since English has no tense one step behind them. The present forms map to past forms, which map to past perfect forms, so two steps suffice, and every other form reaches a fixed point in one step. (iii) $f(f(\text{present simple})) = \text{past perfect} \ne \text{past simple} = f(\text{present simple})$. The shift is required only after a past reporting verb; after *says* nothing shifts, and a universal truth may keep its tense (*He said that water boils at 100 °C*), because the claim is still true at the moment of reporting. Time and place words shift with the same logic: *tomorrow* becomes *the next day*, *here* becomes *there*. Reported questions use statement word order: *Where do you live?* becomes *where I lived*, since the question is now a noun clause, not a question.

**GATE use.** Pick the correct reported form. The traps are shifting after a present reporting verb, keeping question word order (*asked where did I live*), and treating a backshifted past perfect as proof that the speaker used the past perfect.

**Check.** A script built $f$ as a table of 13 forms, listed the forms with several preimages (past perfect has three: past simple, present perfect, past perfect), found the fixed points listed above, measured the largest number of steps to a fixed point as 2 (for the two present forms), and confirmed that $f(f(x)) \ne f(x)$ exactly for present simple and present continuous.

## The deletion test for pronoun case and parallel structure
<!-- topics: ga-verbal.pronouns, ga-verbal.conjunctions-parallelism -->

**Claim.** In a coordination *X and Y*, *X or Y*, or a correlative pair, each conjunct must be correct on its own in the slot the pair fills. Hence: (i) a pronoun in a coordination takes the case it would take alone: *between you and me*, *Ravi and I went*; (ii) *who* or *whom* is decided by answering the clause with *he* or *him*; (iii) the two parts after a correlative pair must be the same grammatical kind, and the items of a list must share one form.

**Proof.** Coordination joins units of equal rank and passes the role of the slot to each conjunct: in *between you and me* both *you* and *me* are objects of *between*. Deleting one conjunct keeps the role of the other, so the case required alone is the case required in the pair. *Between I* fails, so *between you and I* fails; *I went* is correct, so *Ravi and I went* is correct. For (ii), *who* and *whom* are the subject and object forms of the same pronoun, like *he* and *him*; answering the question or rewriting the clause with *he* or *him* reveals the role. *You invited him* gives *Whom did you invite*; *He called* gives *Who called*. For (iii), *not only A but also B* asserts A and asserts B in the same slot, so A and B must each fit that slot: *She is not only skilled but also patient* gives *She is skilled* and *She is patient*. In *She not only is skilled but also patient*, *not only* sits before a verb phrase and *but also* before an adjective, so deleting the first half leaves *She but also patient*, which is not a sentence. The same deletion shows *He likes coding, to test and debugging* is broken: each item must complete *He likes …* in one form. One contrast marker per contrast follows the same way: *Although it rained, but the match continued* joins a subordinate clause and a coordinate clause to one main clause, so deleting either marker repairs it.

**GATE use.** Grammatically correct sentence MCQs with *between you and I*, *myself* used for *me*, a misplaced *not only*, or a list with mixed forms. The trap is that the wrong form sounds formal and therefore correct.

**Check.** Applying the test by deletion: *between you and me* leaves *between me* (correct) and *between I* (wrong); *Whom did you invite* matches *you invited him*; *not only skilled but also patient* leaves *She is skilled* and *She is patient*, both correct; and *Please contact myself* fails because there is no subject *I* for the reflexive to refer back to.

## Word-class tests: to as a preposition, linking verbs, a or an, fewer or less
<!-- topics: ga-verbal.parts-of-speech-verb-forms, ga-verbal.articles-prepositions, ga-verbal.modifiers-comparison -->

**Claim.** Four usage choices are decided by a substitution test, each a consequence of a word-class rule.

1. After a preposition a verb takes the gerund. The test is one-way: if a noun cannot replace the verb after *to*, the *to* is the infinitive marker and takes V1 (*decided to leave*). A noun that fits does not settle it, because many verbs take both *to* + noun and *to* + infinitive (*agreed to the plan*, *agreed to go*). The prepositional *to* that takes a gerund comes in a fixed list of expressions: *look forward to*, *object to*, *be used to*, *be accustomed to*, *with a view to*, so *look forward to meeting*, *object to waiting*, *be used to working*.
2. After a linking verb (*be*, *seem*, *feel*, *look*, *taste*) the complement describes the subject and is an adjective; after an action verb a modifier of the action is an adverb. Test: replace the verb with *is*; if the sentence keeps its sense, use the adjective.
3. *A* or *an* is chosen by the first sound of the next word: *an* before a vowel sound, *a* before a consonant sound.
4. *Fewer*, *many* and *number* go with countable nouns; *less*, *much* and *amount* with uncountable ones. Test: a noun that takes a plural and a numeral (*three bugs*) is countable.

**Proof.** (1) The infinitive marker *to* is followed by V1, while a preposition is followed by a noun phrase, and the gerund is the verb form that functions as a noun phrase. If no noun phrase fits after *to*, the *to* cannot be a preposition, so it is the infinitive marker. The converse fails: *He agreed to the plan* is grammatical, yet *agreed to go* is correct and *agreed to going* is not, because *agree* takes either a *to* + noun complement or an infinitive. Only in the fixed expressions is *to* a preposition before a verb too, and there the verb must take its noun form: *look forward to the meeting* and *look forward to meeting*. In *decided to leave*, *decided to the departure* fails, so this *to* is the infinitive marker. (2) A linking verb asserts a property of the subject, and properties of nouns are adjectives: *The food tastes good* keeps its sense as *The food is good*. *She sings beautifully* does not become *She is beautiful* in meaning, because *beautifully* describes the singing, so *sing* is an action verb and needs the adverb. (3) The older form *an* lost its n before consonant sounds and kept it before vowel sounds, where it separates two vowel sounds; the rule is therefore about sound, and spelling is irrelevant: *university* and *one* begin with the sounds y and w, *hour* and *honest* with a silent h, and *MBA* is read *em-bee-ay*. Hence *a university*, *a one-time fee*, *an hour*, *an MBA*. (4) *Fewer* compares counts and *less* compares quantities, so the noun must be countable for *fewer*: *fewer errors*, *less time*.

**GATE use.** Fill the blank with the right form. The traps are *look forward to meet*, *sings beautiful*, *an university*, and *less errors*; each is fixed by one substitution.

**Check.** *look forward to* is on the list and *I look forward to the meeting* is grammatical, so *to meeting* is required; *agreed to the plan* is grammatical but *agree* is not on the list, so *agreed to go* keeps the infinitive; *They decided to the departure* is not, so *decided to leave* keeps the infinitive. *The soup is good* matches *tastes good*. The first sounds of *university*, *European*, *one* are consonant sounds (a), of *hour*, *honest*, *MBA* vowel sounds (an).

## Polarity of a blank flips once per contrast signal
<!-- topics: ga-verbal.transition-signals, ga-verbal.contextual-vocabulary -->

**Claim.** Give a clue clause the polarity $p = +1$ (favourable) or $p = -1$ (unfavourable). Each contrast signal between the clue and the blank (*however*, *although*, *despite*, *yet*, *nevertheless*, *whereas*) multiplies the polarity by $-1$; a continuation signal (*because*, *so*, *therefore*, *as a result*, *also*, *in addition*, `moreover`) multiplies it by $+1$. With $c$ contrast signals the blank needs polarity

$$p_{\text{blank}} = p_{\text{clue}} \cdot (-1)^{c}.$$

**Proof.** By induction on the number of signals. With none, the blank continues the clue, so its polarity is $p_{\text{clue}}$. Suppose the claim holds for $k$ signals, and a $(k+1)$-st signal is placed before the blank. A continuation signal asserts that what follows agrees with what precedes it, so the polarity is unchanged; a contrast signal asserts that what follows goes against the expectation set by what precedes, so the polarity is negated. Multiplication by $\pm 1$ records both, and the product over $k + 1$ signals is $p_{\text{clue}} \cdot (-1)^{c}$, where $c$ counts only the contrast factors. A negation (*not*, *un-*, *hardly*) also reverses polarity and enters as a factor $-1$. Polarity fixes only the direction; the degree (mild or strong), the part of speech and the collocation are checked after elimination.

**GATE use.** *Despite the manager's ___ approach, the team delivered on time.* The clue *delivered on time* is favourable and *despite* is one contrast, so the blank is unfavourable: *tyrannical*, not *supportive*. Eliminate every option of the wrong sign first. The trap is a double reversal such as *although not unsuccessful*, where two factors cancel.

**Check.** A script computed the sign step by step for every sequence of five signals drawn from contrast, cause and addition, with both clue signs, and found it equal to $p_{\text{clue}} (-1)^{c}$ in all $3^5 \cdot 2 = 486$ cases. The manager sentence gives $(+1)(-1) = -1$.

## Analogies are equalities of relations
<!-- topics: ga-verbal.word-roots-analogies, ga-verbal.idioms-one-word-substitutes -->

**Claim.** Let $R(A, B)$ be the set of relations, each stated as a sentence, that hold from $A$ to $B$. Define $A : B :: C : D$ to hold when $R(A, B)$ is nonempty and equal to $R(C, D)$. Then: (i) the analogy relation is symmetric and transitive on pairs; (ii) $A : B :: C : D$ gives $B : A :: D : C$, since equal relations have equal inverses; (iii) unlike a numerical proportion, $A : B :: C : D$ does not give $A : C :: B : D$; (iv) an option that shares the topic of $C$ but not the relation is wrong.

**Proof.** (i) Equality of sets is symmetric and transitive, so the analogy relation inherits both. (ii) The inverse of a relation sentence ($B$ contains $A$ as a member, for $A$ is a member of $B$) holds from $B$ to $A$ exactly when the original holds from $A$ to $B$, so equal relation sets give equal inverse sets. (iii) For numbers, $a/b = c/d$ and $a/c = b/d$ are both $ad = bc$, so alternation is valid. For words, $R(A, C)$ relates two members and $R(B, D)$ relates two groups, and nothing forces these to coincide: *bird : flock :: fish : school* holds (member of group), but *bird : fish* (two kinds of animal) and *flock : school* (two kinds of group) have different relations. (iv) If $D$ merely belongs to the subject of $C$ (*star : sky*, location), then $R(C, D)$ is a different set and the equality fails. The test is therefore to write $R(A, B)$ as a sentence and substitute each option: *An archipelago is a group of islands*; *A constellation is a group of stars* passes, *The sky is a group of stars* fails. Idiom questions use the same substitution: check that the meaning of the idiom fits the situation of each option.

**GATE use.** Word-analogy MCQs. The trap is an option on the same topic as $C$ with a different relation. When two options both satisfy the sentence, the relation was stated too loosely; tighten it (a small named pattern, not a vast system) before choosing.

**Check.** A script modelled the relations as sets of pairs. It confirmed *island : archipelago :: star : constellation*, rejected *star : sky*, confirmed symmetry and transitivity over all modelled pairs, rejected the alternation *bird : fish :: flock : school*, and confirmed numerical alternation over all quadruples from 1 to 8. It also showed *star : galaxy* passes the loose relation "member of a group", so it is not a relation-mismatch distractor.

## Converse, inverse and contrapositive
<!-- topics: ga-verbal.rc-inference-traps, ga-verbal.rc-method -->

**Claim.** For statements $P$ and $Q$, the implication $P \Rightarrow Q$ is equivalent to its contrapositive $\lnot Q \Rightarrow \lnot P$ and is not equivalent to its converse $Q \Rightarrow P$ or its inverse $\lnot P \Rightarrow \lnot Q$. The converse and inverse are equivalent to each other. An inference option that restates a passage rule as its converse or inverse does not follow.

**Proof.** $P \Rightarrow Q$ is false only when $P$ is true and $Q$ false. $\lnot Q \Rightarrow \lnot P$ is false only when $\lnot Q$ is true and $\lnot P$ false, which is the same row, so the two have identical truth tables. $Q \Rightarrow P$ is false only when $Q$ is true and $P$ false, a different row: at $P$ false and $Q$ true the rule holds and its converse fails, and at $P$ true and $Q$ false the converse holds and the rule fails. The inverse is the contrapositive of the converse, so it is equivalent to the converse.

**GATE use.** *Every library opened after the policy offers evening hours.* Valid: a library without evening hours opened before the policy (contrapositive). Invalid: every library with evening hours opened after the policy (converse), and every library opened before the policy lacks evening hours (inverse). The main idea of a passage is likewise a statement the passage supports, not a stronger one it would need extra facts for; an option is a valid inference only if it is true in every situation the passage allows.

**Check.** A script enumerated the four truth assignments: the rule and its contrapositive agree on all four, the rule and its converse disagree on exactly $(P, Q) = (F, T)$ and $(T, F)$, and the inverse agrees with the converse on all four.

## Quantified statements and the fifteen valid syllogisms
<!-- topics: ga-verbal.rc-inference-traps, ga-verbal.rc-method -->

**Claim.** Read *All X are Y* (A), *No X are Y* (E), *Some X are Y* (I) and *Some X are not Y* (O) over a universe of objects, with *some* meaning at least one. Then: (i) E and I convert (*No X are Y* gives *No Y are X*; *Some X are Y* gives *Some Y are X*), while A and O do not; (ii) *Some X are Y* gives neither *All X are Y* nor *Some X are not Y*; (iii) *All X are Y* gives *Some X are Y* only when some X exists; (iv) of the 256 two-premise syllogisms (4 figures, 64 moods), exactly 15 are valid with no existence assumption and 24 when every term is assumed nonempty.

**Proof.** A statement about $X$ and $Y$ depends only on which of the four regions of the Venn diagram ($X$ only, $Y$ only, both, neither) contain an object, so it is valid exactly when it holds in all $2^4 = 16$ patterns of empty and nonempty regions where the premise holds. (i) E says the region $X \cap Y$ is empty and I says it is nonempty; both mention only $X \cap Y$, which is symmetric in $X$ and $Y$. A says $X \setminus Y$ is empty, and the pattern with only $Y \setminus X$ and $X \cap Y$ nonempty makes *All X are Y* true and *All Y are X* false. O says $X \setminus Y$ is nonempty, and the pattern with only $X \setminus Y$ nonempty makes *Some X are not Y* true and *Some Y are not X* false. (ii) I constrains only $X \cap Y$, so it is consistent both with $X \setminus Y$ empty (making *All X are Y* true and *Some X are not Y* false) and with $X \setminus Y$ nonempty (the reverse). (iii) If $X$ is empty, *All X are Y* is vacuously true and *Some X are Y* false; once $X$ has an object, and A puts every object of $X$ in $Y$, that object lies in $X \cap Y$. (iv) With three terms there are 8 regions and $2^8 = 256$ patterns; a syllogism is valid when its conclusion holds in every pattern where both premises hold, and checking all 256 syllogisms against all patterns gives the counts. A GATE passage asserts its claims as true, so a statement with an existence assumption follows only when the passage states that something of the kind exists.

**GATE use.** Inference and logical-completion questions. *All dogs are animals; some animals are pets* does not give *some dogs are pets* (the middle term is never covered in full, so the pets may be cats). An option with *all* or *always* is entailed only when the passage itself says *all*; a passage about *some* cases supports only an option about *some*.

**Check.** A script enumerated the region patterns. It confirmed (i), (ii) and (iii), found the valid syllogisms to be AAA-1, AII-1, EAE-1, EIO-1, AEE-2, AOO-2, EAE-2, EIO-2, AII-3, EIO-3, IAI-3, OAO-3, AEE-4, EIO-4 and IAI-4 (15 in all), counted 24 with every term nonempty, and rejected the dogs-and-pets argument while accepting Barbara (*all M are P, all S are M*, so *all S are P*).

## Elimination and the expected score under GATE marking
<!-- topics: ga-verbal.rc-inference-traps, ga-verbal.contextual-vocabulary, ga-verbal.rc-method -->

**Claim.** A four-option MCQ worth $m$ marks gives $+m$ for the right answer and $-m/3$ for a wrong one. If $k$ options remain after elimination, $1 \le k \le 4$, and the correct one is among them, a uniform guess among the survivors has expected score

$$E_k = \frac{m(4 - k)}{3k},$$

so $E_4 = 0$, $E_3 = m/9$, $E_2 = m/3$ and $E_1 = m$. A guess pays off on average as soon as one option is eliminated with certainty. MSQ and NAT carry no negative marks, so there $E \ge 0$ for any attempt.

**Derivation.** The guess is right with probability $1/k$ and wrong with probability $(k - 1)/k$. Hence

$$E_k = \frac{m}{k} - \frac{k - 1}{k} \cdot \frac{m}{3} = \frac{3m - (k - 1)m}{3k} = \frac{m(4 - k)}{3k}.$$

At $k = 4$ the penalty $m/3$ was chosen so that blind guessing is worth exactly zero. For $k \le 3$ the numerator is positive. The assumption that the right answer survives is where elimination must be sound: removing the correct option by mistake turns every guess into a loss of $m/3$. This is why the elimination steps in this chapter are proofs (polarity sign, entailment, deletion test) rather than impressions.

**GATE use.** Decide whether to attempt a verbal MCQ when unsure. Ruling out an extreme option and an out-of-scope option leaves $k = 2$, worth $m/3$ in expectation. The trap is a confident but wrong elimination, which voids the formula.

**Check.** A script computed $E_k$ with exact fractions for $m = 1, 2$ and $k = 1, \dots, 4$ and matched the formula; a simulation of 200,000 guesses gave means 0.334, 0.112 and 0.0003 for $k = 2, 3, 4$ against $1/3$, $1/9$ and 0. Ten 2-mark questions narrowed to two options each are worth $10 \cdot 2/3 = 20/3 \approx 6.67$ marks in expectation.

## Jumbled sentences: fixed pairs cut the orders by a known factor
<!-- topics: ga-verbal.narrative-sequencing, ga-verbal.transition-signals -->

**Claim.** Take $n$ sentences. A valid paragraph is an order that respects every forced constraint: the opener comes first, a pronoun or definite reference comes after its noun, and a connector (*however*, *as a result*) comes after the idea it answers. Then fixing the opener leaves $(n - 1)!$ orders. A constraint "$u$ comes immediately before $v$", with $u$ and $v$ both free to move, divides the count by the number $f$ of items still free to arrange (gluing $u v$ into one block): $f = n$ from all $n!$ orders and $f = n - 1$ once the opener is fixed. A constraint "$u$ comes somewhere before $v$" halves the count. A sentence that begins with a pronoun, a definite back-reference or a connector cannot be the opener.

**Proof.** Fixing the first position leaves the other $n - 1$ sentences in any order, $(n - 1)!$ ways. For an immediate pair, let $f$ items be free to arrange in the open positions, which are consecutive (all $n$, or the last $n - 1$ once the opener is fixed). The orders with $v$ right after $u$ correspond one to one with orders of $f - 1$ items in which the block $uv$ is one item, so there are $(f - 1)! = f!/f$ of them: $n!/n$ from all orders and $(n - 1)!/(n - 1)$ after fixing the opener. For a precedence pair, swapping the positions of $u$ and $v$ is a bijection between orders with $u$ before $v$ and orders with $v$ before $u$, so each set has $n!/2$ members. The opener rule follows from the constraints: a sentence that begins with *it*, *this device* or *however* needs something earlier to refer to or to answer, so it has a forced predecessor and cannot be first. Each constraint applies to the order, so options that violate one are eliminated without reading the rest, and two options need comparing only at the first position where they differ.

**GATE use.** Four or five sentences and four candidate orders. Find the opener, then two or three forced pairs; usually one option survives. The trap is an option that starts with a connector, which fails at once.

**Check.** With five sentences P, Q, R, S, T and P the opener, a script counted $5! = 120$ orders, 24 with P first, 6 with P first and T right after S, and 3 when Q must also precede R (PQRST, PQSTR, PSTQR). Requiring R right after Q as well left 2. The fall from 24 to 6 is the factor $4 = n - 1$, the number of free items, not $n = 5$. It verified the $n!/n$ and $n!/2$ counts for every $n$ from 2 to 7, and the factor $n - 1$ with the opener fixed for every $n$ from 3 to 7.
