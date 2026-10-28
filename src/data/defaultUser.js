// User Profile State and Pre-configured Aspirant Personas
// Allows quick evaluator testing of dynamic difficulty adaptation

export const USER_PERSONAS = [
  {
    id: 'persona_balanced',
    name: 'Aarav Sharma',
    handle: '@gate_aspirant_26',
    role: 'Average Aspirant',
    description: 'Moderate preparation across core subjects; typical student benchmark.',
    topicSkills: {
      os: 5.5,
      algo: 5.0,
      dbms: 5.8,
      cn: 4.8,
      math: 5.2,
      coa: 4.5,
      toc: 5.1,
      cd: 4.4,
      dl: 6.0
    }
  },
  {
    id: 'persona_os_pro',
    name: 'Priya Iyer',
    handle: '@systems_whiz',
    role: 'Systems Specialist',
    description: 'Expert in Operating Systems & Networks, but struggles with DBMS & Math.',
    topicSkills: {
      os: 8.5,
      algo: 4.0,
      dbms: 3.2,
      cn: 8.0,
      math: 3.8,
      coa: 7.2,
      toc: 4.2,
      cd: 6.5,
      dl: 7.5
    }
  },
  {
    id: 'persona_beginner',
    name: 'Rohan Verma',
    handle: '@gate_beginner',
    role: 'Beginner / First Attempt',
    description: 'Just started preparation. Most questions will appear Medium or Hard for him.',
    topicSkills: {
      os: 2.8,
      algo: 3.0,
      dbms: 3.5,
      cn: 2.5,
      math: 3.2,
      coa: 2.2,
      toc: 2.6,
      cd: 2.0,
      dl: 3.1
    }
  },
  {
    id: 'persona_ranker',
    name: 'Sneha Patel',
    handle: '@air_under_100',
    role: 'GATE Top Ranker Candidate',
    description: 'High mastery across subjects; only complex multi-concept questions appear Hard.',
    topicSkills: {
      os: 8.8,
      algo: 9.0,
      dbms: 8.6,
      cn: 8.7,
      math: 8.5,
      coa: 8.2,
      toc: 8.9,
      cd: 8.4,
      dl: 9.1
    }
  }
];

export const INITIAL_USER_STATE = {
  name: 'Aarav Sharma',
  handle: '@gate_aspirant_26',
  targetExam: 'GATE CS / IT 2027',
  topicSkills: {
    os: 5.5,
    algo: 5.0,
    dbms: 5.8,
    cn: 4.8,
    math: 5.2,
    coa: 4.5,
    toc: 5.1,
    cd: 4.4,
    dl: 6.0
  },
  history: [
    {
      testId: 'mock-101',
      date: '2026-09-18',
      topic: 'Operating Systems - CPU & Virtual Memory',
      subjectId: 'os',
      score: 4.67,
      totalMarks: 7,
      accuracy: 71,
      totalQuestions: 4,
      correctCount: 3,
      timeTakenSec: 420
    },
    {
      testId: 'mock-102',
      date: '2026-09-20',
      topic: 'DBMS - Transactions & Normalization',
      subjectId: 'dbms',
      score: 5.0,
      totalMarks: 6,
      accuracy: 83,
      totalQuestions: 3,
      correctCount: 3,
      timeTakenSec: 360
    },
    {
      testId: 'mock-103',
      date: '2026-09-22',
      topic: 'Algorithms - Graphs & Heaps',
      subjectId: 'algo',
      score: 1.34,
      totalMarks: 5,
      accuracy: 40,
      totalQuestions: 3,
      correctCount: 1,
      timeTakenSec: 510
    }
  ],
  bookmarkedQuestionIds: ['gate-os-2023-1', 'gate-algo-2023-1', 'gate-toc-2023-1']
};

