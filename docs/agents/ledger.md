# Agent contract: build the PYQ ledger

You build `memory/pyq/papers/<paper>.json` for the official GATE CSE papers you are given.
Each file lists every one of the paper's 65 questions with the official answer key and the
chapter it belongs to. Later agents solve the questions from this ledger, so a wrong key or a
missing question here corrupts everything downstream.

Repo: the repository root (the lead passes you its absolute path; every path below is relative to it). Read `CLAUDE.md`
("Chapter alias map"), `.claude/rules/memory-layer.md` ("Paper ledger") and
`scripts/lib/pyq.mjs` first. The ledger
format, the key syntax and the numbering rules are defined there and enforced by
`node scripts/check-memory.mjs --paper <paper>`.

## Inputs per paper

1. **Question index.** GATE Overflow keeps one exam page per paper that lists every question
   with its GO id, URL and tags. Known pages (read them with `mcp__exa__web_fetch_exa` only when the
   lead asks for it; never curl):
   - 2015 S1 `https://gateoverflow.in/exam/10/gate-cse-2015-set-1-original-paper`
   - 2017 S1 `https://gateoverflow.in/exam/76/gate-cse-2017-set-1-original-paper`
   - 2018 `https://gateoverflow.in/exam/88/gate2018`
   - 2020 `https://gateoverflow.in/exam/218/gate-cse-2020`
   - 2021 S2 `https://gateoverflow.in/exam/264/gate-cse-2021-set-2`
   - 2022 `https://gateoverflow.in/exam/298/gate-cse-2022`
   - 2023 `https://gateoverflow.in/exam/430/gate-cse-2023-original-paper`
   - 2024 S1 `https://gateoverflow.in/exam/594/gate-cse-2024-set-1-original-paper`
   - 2025 S1 `https://gateoverflow.in/exam/860/gate-cse-2025-set-1`
   - 2025 S2 `https://gateoverflow.in/exam/861/gate-cse-2025-set-2-original-paper`
   - 2026 S2 `https://gateoverflow.in/exam/1315/gate-cse-2026-set-2`

   For other papers, find the exam page with `mcp__exa__web_search_exa`, for example
   "gateoverflow exam gate-cse-2016-set-1". Guessed short URLs fail. If a paper has no exam
   page, build the index from the per-question pages. Their titles read "GATE CSE 2016 Set 1 |
   Question: 30", and an exa search on that title finds each one.
2. **Official answer key.** Use the final key from the organising institute: IIT Kanpur
   2015 and 2023, IISc 2016 and 2024, IIT Roorkee 2017 and 2025, IIT Guwahati 2018 and 2026,
   IIT Madras 2019, IIT Delhi 2020, IIT Bombay 2021, IIT Kharagpur 2022. Confirm the
   institute from the PDF header.
   The papers and keys are already in `source/papers/` (gitignored; `source/papers/drive/INDEX.md`
   maps them). Convert with `pdftotext -layout` and read the table. Each row gives the question
   number, type, section, key and marks. Never download: agents run no `curl` or `wget` and
   fetch no external site, because the corporate security monitor flags it (GCISO incident,
   2026-10-18). If the official key is not in `source/papers/`, stop on that paper and report
   it; the user adds the file. Never take a key from GATE Overflow answers or from memory.
3. **Chapters.** Read the chapter titles in `CLAUDE.md` and the items in
   `data/official-syllabus.json`, and map each question to the chapter that teaches it.
   GO tags are the evidence. A guide:

   | GO subject tag | Chapters |
   |---|---|
   | verbal / quantitative / analytical / spatial aptitude | ga-verbal, ga-quantitative, ga-analytical, ga-spatial |
   | discrete-mathematics (sets, relations, functions, groups, logic, combinatorics, graph theory) | em-discrete-mathematics |
   | linear-algebra, calculus, probability / statistics | em-linear-algebra, em-calculus, em-probability-statistics |
   | digital-logic | dl-boolean-algebra (algebra, K-maps), dl-combinational-circuits, dl-sequential-circuits, dl-number-representations (bases, complements, IEEE 754) |
   | co-and-architecture | coa-instructions-addressing, coa-alu-datapath-control, coa-pipelining, coa-memory-hierarchy (cache, memory), coa-io-interface (DMA, interrupts, I/O) |
   | programming / programming-in-c | pds-c-programming |
   | data-structures | pds-linear-data-structures (arrays, stacks, queues, lists), pds-trees (trees, BST, AVL, heaps), pds-graphs-hashing |
   | algorithms | algo-complexity-sorting (asymptotics, recurrences, sorting, searching), algo-design-paradigms (greedy, DP, divide and conquer), algo-graph-algorithms |
   | theory-of-computation | toc-finite-automata (regular), toc-cfl-pda, toc-turing-machines (decidability) |
   | compiler-design | cd-lexical-analysis, cd-parsing, cd-sdt-ir-optimization (SDT, IR, optimisation, runtime) |
   | operating-system | os-processes-threads (fork, threads, system calls, IPC), os-cpu-scheduling (incl. disk scheduling), os-synchronization-deadlock, os-memory-management (paging, TLB, replacement), os-file-systems (allocation, inodes, disk geometry) |
   | databases | db-er-relational (ER, relational algebra, calculus), db-sql-constraints, db-normalization (FDs, keys, normal forms), db-indexing (B/B+ trees, indexing), db-transactions (serializability, recoverability, locking) |
   | computer-networks | cn-layering-switching, cn-data-link-layer (MAC, CRC, sliding window, Ethernet), cn-network-layer (IP, subnetting, routing, fragmentation), cn-transport-layer (TCP, UDP, congestion), cn-application-layer (DNS, HTTP, email) |

   A question outside every 2027 chapter gets `"chapter": null` and a `note` naming the topic,
   for example "software engineering: not in the GATE CS syllabus since 2016". A question that
   spans two chapters goes to the one that holds its decisive step, and a `note` names the other.

## Per question

`section`, `n` (as printed), `type` (`mcq`/`msq`/`nat`, from the official key), `marks`,
`key` (official key in the canonical syntax), `chapter`, `url` (the GO question page),
`go` (its numeric id), `tags` (GO tags, minus year and marks tags), and `note` when needed.
Normalise the key: "1.4 to 1.6" → `"1.4:1.6"`, "A;B" (MSQ) → `"A;B"`, "A, C, D or C, D"
(MSQ) → `"A;C;D|C;D"`, "A or B" (MCQ) → `"A|B"`, "Marks to all" → `"MTA"`.

## Checks before you finish a paper

- `node scripts/check-memory.mjs --paper <paper>` prints ✓. It enforces 65 questions,
  100 marks, numbering, marks by position, key syntax, and MSQ only from 2021.
- Cross-check by script: every ledger key equals the key in your `pdftotext` output, and
  every GO question number appears once.
- Do not edit any other file. Do not run `npm run memory`; the lead regenerates STATUS.md.

## Report

Per paper: the file written, the validator line, the counts by chapter, and the source URLs
used. List anything you could not resolve, such as a missing key or an ambiguous mapping.
Keep it under 40 lines.
