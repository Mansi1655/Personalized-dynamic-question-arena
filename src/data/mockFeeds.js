// Additional authentic GATE feeds available for dynamic ingestion / scraping simulation
export const EXTERNAL_AUTHENTIC_FEED = [
  {
    id: 'gate-os-2020-ext-1',
    subjectId: 'os',
    topic: 'Disk Scheduling',
    source: 'GATE CS 2020 (IIT Delhi)',
    sourceUrl: 'https://gate.iitd.ac.in',
    type: 'NAT',
    marks: 2,
    negativeMarks: 0,
    baseDifficulty: 4.5,
    question: `Consider a disk queue with requests for I/O to blocks on cylinders: 98, 183, 37, 122, 14, 124, 65, 67. The head is currently at cylinder 53. If Shortest Seek Time First (SSTF) disk scheduling is used, what is the total head movement in cylinders?`,
    options: [],
    correctAnswer: '236',
    tolerance: [236, 236],
    explanation: `SSTF Head Movement Sequence:
Starting head = 53.
1. 53 -> 65 (dist = 12)
2. 65 -> 67 (dist = 2)
3. 67 -> 37 (dist = 30)
4. 37 -> 14 (dist = 23)
5. 14 -> 98 (dist = 84)
6. 98 -> 122 (dist = 24)
7. 122 -> 124 (dist = 2)
8. 124 -> 183 (dist = 59)
Total Seek Time = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236 cylinders.`,
    conceptTags: ['Disk Scheduling', 'SSTF', 'Seek Time']
  },
  {
    id: 'gate-algo-2020-ext-2',
    subjectId: 'algo',
    topic: 'Dynamic Programming',
    source: 'GATE Overflow #2020-ALGO',
    sourceUrl: 'https://gateoverflow.in',
    type: 'MCQ',
    marks: 2,
    negativeMarks: 0.66,
    baseDifficulty: 8.0,
    question: `What is the minimum number of scalar multiplications required to multiply a chain of 4 matrices A1, A2, A3, and A4 with dimensions 10x30, 30x5, 5x60, and 60x10 respectively?`,
    options: [
      { id: 'A', text: '4,500' },
      { id: 'B', text: '6,000' },
      { id: 'C', text: '5,500' },
      { id: 'D', text: '7,200' }
    ],
    correctAnswer: 'A',
    explanation: `Matrix Chain Multiplication:
Dimensions array: p = [10, 30, 5, 60, 10]
Evaluating optimal parenthesization: ((A1 * A2) * A3) * A4 vs (A1 * A2) * (A3 * A4) vs A1 * ((A2 * A3) * A4)
Cost of (A1 * A2) = 10 * 30 * 5 = 1,500
Cost of ((A1 * A2) * A3) = 1,500 + 10 * 5 * 60 = 1,500 + 3,000 = 4,500
Cost of (((A1 * A2) * A3) * A4) = 4,500 + 10 * 60 * 10 = 4,500 + 6,000 = 10,500.
Alternative: (A1 * (A2 * A3)) * A4:
(A2 * A3) = 30 * 5 * 60 = 9,000.
Optimal splitting:
((A1 * A2) * (A3 * A4)):
(A1 * A2) = 10 * 30 * 5 = 1,500
(A3 * A4) = 5 * 60 * 10 = 3,000
Multiply them: 10 * 5 * 10 = 500
Total = 1,500 + 3,000 + 500 = 4,500 multiplications!`,
    conceptTags: ['Matrix Chain Multiplication', 'Dynamic Programming', 'Optimization']
  },
  {
    id: 'gate-dbms-2020-ext-3',
    subjectId: 'dbms',
    topic: 'B+ Tree Indexing',
    source: 'NPTEL Database Engineering Archive',
    sourceUrl: 'https://nptel.ac.in',
    type: 'NAT',
    marks: 2,
    negativeMarks: 0,
    baseDifficulty: 7.8,
    question: `A B+ tree index is created on a search key of 12 bytes. Block size is 1024 bytes and block pointer is 6 bytes. What is the maximum order (fanout) of an internal node in this B+ tree?`,
    options: [],
    correctAnswer: '57',
    tolerance: [57, 57],
    explanation: `For an internal node with order p (maximum child pointers):
Formula: p * (Block Pointer) + (p - 1) * (Search Key) <= Block Size
p * 6 + (p - 1) * 12 <= 1024
6p + 12p - 12 <= 1024
18p <= 1036
p <= 1036 / 18 = 57.55
Since p must be an integer, maximum order = 57.`,
    conceptTags: ['B+ Tree', 'Order of Node', 'Block Pointer', 'Indexing']
  },
  {
    id: 'gate-cn-2020-ext-4',
    subjectId: 'cn',
    topic: 'Application Layer Protocols',
    source: 'GATE CS 2020 (IIT Delhi)',
    sourceUrl: 'https://gate.iitd.ac.in',
    type: 'MSQ',
    marks: 1,
    negativeMarks: 0,
    baseDifficulty: 3.5,
    question: `Which of the following application layer protocols typically operate over UDP as their underlying transport protocol?`,
    options: [
      { id: 'A', text: 'DNS (Domain Name System queries)' },
      { id: 'B', text: 'SNMP (Simple Network Management Protocol)' },
      { id: 'C', text: 'FTP (File Transfer Protocol)' },
      { id: 'D', text: 'DHCP (Dynamic Host Configuration Protocol)' }
    ],
    correctAnswer: ['A', 'B', 'D'],
    explanation: `Analysis:
- DNS primarily uses UDP port 53 for standard name queries.
- SNMP uses UDP port 161/162.
- DHCP uses UDP port 67/68.
- FTP uses TCP port 20 and 21 for reliable file transfers and control commands.
Correct answers: A, B, and D.`,
    conceptTags: ['UDP', 'DNS', 'SNMP', 'DHCP', 'Transport Layer']
  },
  {
    id: 'gate-toc-2021-ext-5',
    subjectId: 'toc',
    topic: 'Pumping Lemma & Turing Machines',
    source: 'GATE Overflow #2021-TOC',
    sourceUrl: 'https://gateoverflow.in',
    type: 'MCQ',
    marks: 2,
    negativeMarks: 0.66,
    baseDifficulty: 8.2,
    question: `Consider the language L = { a^n b^n c^n | n ≥ 1 }. Which of the following statements is TRUE about L?`,
    options: [
      { id: 'A', text: 'L is Context-Free but not Regular' },
      { id: 'B', text: 'L is Deterministic Context-Free' },
      { id: 'C', text: 'L is Context-Sensitive and Recursive, but NOT Context-Free' },
      { id: 'D', text: 'L is Undecidable and not Recursively Enumerable' }
    ],
    correctAnswer: 'C',
    explanation: `Language Analysis:
L = { a^n b^n c^n | n ≥ 1 } requires matching counts of three independent symbols (a, b, and c).
A Single Pushdown Automaton (PDA) can only match counts of two groups using its stack.
Using Pumping Lemma for Context-Free Languages, we can prove L is NOT context-free.
However, a Linear Bounded Automaton (LBA) or Turing Machine can decide L in polynomial time.
Therefore, L is Context-Sensitive and Recursive, but NOT Context-Free.`,
    conceptTags: ['Pumping Lemma', 'Context-Sensitive Languages', 'Turing Machines']
  },
  {
    id: 'gate-cd-2020-ext-6',
    subjectId: 'cd',
    topic: 'Syntax-Directed Translation (SDT)',
    source: 'NPTEL Compiler Engineering Archive',
    sourceUrl: 'https://nptel.ac.in',
    type: 'NAT',
    marks: 2,
    negativeMarks: 0,
    baseDifficulty: 6.5,
    question: `Consider the S-attributed SDT grammar for arithmetic evaluation:
E → E1 + T { E.val = E1.val + T.val }
E → T { E.val = T.val }
T → T1 * F { T.val = T1.val * F.val }
T → F { T.val = F.val }
F → num { F.val = num.val }
What is the evaluated synthesized attribute E.val for expression string "3 + 4 * 5"?`,
    options: [],
    correctAnswer: '23',
    tolerance: [23, 23],
    explanation: `Evaluation Order by Operator Precedence:
1. F1 → 3 (F1.val = 3), T1 → 3 (T1.val = 3), E1 → 3 (E1.val = 3)
2. F2 → 4 (F2.val = 4), F3 → 5 (F3.val = 5)
3. T2 → T(4) * F(5) = 20 (T2.val = 20)
4. E → E(3) + T(20) = 23 (E.val = 23).
Synthesized attribute E.val evaluates to 23.`,
    conceptTags: ['SDT', 'Synthesized Attributes', 'Operator Precedence']
  },
  {
    id: 'gate-dl-2021-ext-7',
    subjectId: 'dl',
    topic: 'Karnaugh Maps & Minimization',
    source: 'GATE CS 2021 (IIT Bombay)',
    sourceUrl: 'https://gate.iitb.ac.in',
    type: 'NAT',
    marks: 1,
    negativeMarks: 0,
    baseDifficulty: 3.8,
    question: `How many prime implicants are present in the K-map for the 3-variable Boolean function F(A, B, C) = ∑m(0, 1, 4, 5, 6, 7)?`,
    options: [],
    correctAnswer: '2',
    tolerance: [2, 2],
    explanation: `K-map Minimization:
Minterms: 0(000), 1(001), 4(100), 5(101), 6(110), 7(111).
Group 1: Minterms (0, 1, 4, 5) combine to form quad term B'.
Group 2: Minterms (4, 5, 6, 7) combine to form quad term A.
Simplified Expression: F = A + B'.
Number of Prime Implicants = 2 (namely A and B').`,
    conceptTags: ['K-Map', 'Prime Implicants', 'Boolean Minimization']
  }
];

