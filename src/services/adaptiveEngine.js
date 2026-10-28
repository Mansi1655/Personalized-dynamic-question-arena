// Adaptive Engine for Dynamic Difficulty Tagging & Skill Evaluation
// Implements Item Response Theory (IRT) & Elo-based Calibration

/**
 * Calculates personalized dynamic difficulty for a question based on user's topic skill.
 * @param {number} baseDifficulty - Objective system difficulty (1.0 to 10.0)
 * @param {number} userSkill - User's current mastery in this topic (1.0 to 10.0)
 */
export function getPersonalizedDifficulty(baseDifficulty, userSkill = 5.0) {
  // Delta: positive means question is harder than user skill; negative means easier
  const delta = Number((baseDifficulty - userSkill).toFixed(2));
  
  // Calculate expected probability of solving correctly (logistic sigmoid curve)
  // P(correct) = 1 / (1 + e^(delta * 0.8))
  const expectedProb = Number((1 / (1 + Math.exp(delta * 0.8))).toFixed(2));

  let label = 'Medium';
  let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  let dotColor = 'bg-amber-500';
  let description = 'Calibrated Challenge: Ideal for your current skill level';

  if (delta <= -1.2) {
    label = 'Low';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    dotColor = 'bg-emerald-500';
    description = `Confidence Booster: High expected success (${Math.round(expectedProb * 100)}%)`;
  } else if (delta >= 1.2) {
    label = 'Hard';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    dotColor = 'bg-rose-500';
    description = `Stretch Challenge: Push mastery in weak/complex areas (${Math.round(expectedProb * 100)}% expected)`;
  }

  return {
    label,
    delta,
    expectedProb,
    badgeColor,
    dotColor,
    description,
    baseDifficulty: Number(baseDifficulty.toFixed(1)),
    userSkill: Number(userSkill.toFixed(1))
  };
}

/**
 * Updates user topic skills based on mock test performance
 * @param {Object} currentSkills - Mapping of subjectId -> current skill (1-10)
 * @param {Array} attempts - List of question attempt objects { question, isCorrect, timeSpent }
 */
export function calculateUpdatedSkills(currentSkills, attempts) {
  const newSkills = { ...currentSkills };
  const topicStats = {};

  // Group attempts by subject
  attempts.forEach(att => {
    const subId = att.question.subjectId;
    if (!topicStats[subId]) {
      topicStats[subId] = { correct: 0, total: 0, sumBaseDiff: 0 };
    }
    topicStats[subId].total += 1;
    if (att.isCorrect) topicStats[subId].correct += 1;
    topicStats[subId].sumBaseDiff += att.question.baseDifficulty;
  });

  // Apply Elo-like adjustment
  Object.keys(topicStats).forEach(subId => {
    const stat = topicStats[subId];
    const current = newSkills[subId] || 5.0;
    const avgDiff = stat.sumBaseDiff / stat.total;
    const actualRatio = stat.correct / stat.total;
    
    // Expected ratio based on difference
    const expected = 1 / (1 + Math.exp((avgDiff - current) * 0.8));
    
    // K-factor sensitivity (scales with number of questions)
    const K = 0.6 * Math.min(stat.total, 5);
    const adjustment = K * (actualRatio - expected);

    // Keep skill bounded in [1.0, 9.8]
    const updated = Math.max(1.0, Math.min(9.8, current + adjustment));
    newSkills[subId] = Number(updated.toFixed(1));
  });

  return newSkills;
}

/**
 * Analyzes strengths, weaknesses, and generates prescriptive preparation recommendations.
 */
export function analyzeStrengthsAndWeaknesses(userSkills, subjects) {
  const breakdown = subjects.map(sub => {
    const skill = userSkills[sub.id] || 5.0;
    const masteryPercentage = Math.round((skill / 10) * 100);
    
    let status = 'Moderate';
    let statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
    let recommendation = 'Solve 5-7 medium practice questions to reinforce concepts.';

    if (skill >= 7.0) {
      status = 'Strong Area';
      statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      recommendation = 'Excellent grasp! Maintain speed with weekly high-difficulty mock quizzes.';
    } else if (skill <= 4.6) {
      status = 'Weak Area';
      statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
      recommendation = `Critical gap: Revisit theoretical foundations and solve step-by-step NATs.`;
    }

    return {
      subject: sub,
      skill,
      masteryPercentage,
      status,
      statusColor,
      recommendation
    };
  });

  // Sort: weakest first for focused remediation
  const sortedWeakestFirst = [...breakdown].sort((a, b) => a.skill - b.skill);
  const sortedStrongestFirst = [...breakdown].sort((a, b) => b.skill - a.skill);

  const strongAreas = sortedStrongestFirst.filter(b => b.skill >= 7.0);
  const weakAreas = sortedWeakestFirst.filter(b => b.skill <= 4.6);
  const moderateAreas = breakdown.filter(b => b.skill > 4.6 && b.skill < 7.0);

  // Overall readiness index (0 - 100)
  const averageSkill = Object.values(userSkills).reduce((a, b) => a + b, 0) / Object.values(userSkills).length;
  const readinessIndex = Math.round((averageSkill / 10) * 100);

  return {
    breakdown,
    strongAreas,
    weakAreas,
    moderateAreas,
    readinessIndex,
    averageSkill: Number(averageSkill.toFixed(1))
  };
}
