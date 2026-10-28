import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  Play,
  Clock,
  Calculator as CalcIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  Zap,
  Target,
  BarChart3,
  CheckCheck,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUBJECTS } from '../../data/authenticQuestions';
import { getPersonalizedDifficulty } from '../../services/adaptiveEngine';

// Subject color map
const SUBJECT_COLORS = {
  os: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-300', light: 'bg-indigo-50' },
  algo: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-300', light: 'bg-emerald-50' },
  dbms: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-300', light: 'bg-amber-50' },
  cn: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-300', light: 'bg-blue-50' },
  math: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-300', light: 'bg-purple-50' },
  coa: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-300', light: 'bg-rose-50' },
  toc: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500', border: 'border-cyan-300', light: 'bg-cyan-50' },
  cd: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-300', light: 'bg-violet-50' },
  dl: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-300', light: 'bg-orange-50' },
};

const QUICK_PRESETS = [
  { id: 'mini', label: 'Mini Mix', desc: '5 Questions · 10 Min', totalQ: 5, durationMins: 10, icon: '⚡', gateNote: null },
  { id: 'short', label: 'Short Mix', desc: '10 Questions · 20 Min', totalQ: 10, durationMins: 20, icon: '🎯', gateNote: null },
  { id: 'standard', label: 'Standard Mix', desc: '20 Questions · 40 Min', totalQ: 20, durationMins: 40, icon: '📋', gateNote: null },
  { id: 'full', label: 'Full GATE Mock', desc: '65 Questions · 3 Hours', totalQ: 65, durationMins: 180, icon: '🏆', gateNote: 'Actual GATE format: 65Q, 180 min, mixed MCQ + MSQ + NAT' },
];

export default function MixTestView({ questions, currentUser, onCompleteTest, onOpenCalculator }) {
  // 'SETUP' | 'ACTIVE' | 'RESULT'
  const [testState, setTestState] = useState('SETUP');
  // 'quick' | 'custom'
  const [setupMode, setSetupMode] = useState('quick');

  // Quick mode state
  const [selectedPreset, setSelectedPreset] = useState('mini');

  // Custom mode state
  // { [subjectId]: count } — count = 0 means not selected
  const [customConfig, setCustomConfig] = useState(() => {
    const init = {};
    SUBJECTS.forEach(s => { init[s.id] = 0; });
    return init;
  });
  const [customDuration, setCustomDuration] = useState(20);

  // Exam state
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  // Status: 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'REVIEW' | 'ANS_REVIEW'
  const [questionStatus, setQuestionStatus] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [totalTime, setTotalTime] = useState(600);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Timer
  useEffect(() => {
    let timer = null;
    if (testState === 'ACTIVE' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  // ===== SETUP HELPERS =====
  const preset = QUICK_PRESETS.find(p => p.id === selectedPreset);

  const customTotalQ = Object.values(customConfig).reduce((a, b) => a + b, 0);
  const customSelectedSubjects = SUBJECTS.filter(s => customConfig[s.id] > 0);

  const setCustomCount = (subId, val) => {
    const num = Math.max(0, Math.min(10, Number(val)));
    setCustomConfig(prev => ({ ...prev, [subId]: num }));
  };

  const availableForSubject = (subId) =>
    questions.filter(q => q.subjectId === subId).length;

  // ===== HELPERS =====
  // Pads a pool to targetCount by repeating questions with new unique IDs (for Full GATE Mock)
  const padPool = (pool, targetCount) => {
    if (pool.length === 0) return [];
    const result = [...pool];
    let cycle = 0;
    while (result.length < targetCount) {
      const src = pool[cycle % pool.length];
      result.push({ ...src, id: `${src.id}-repeat-${Math.floor(cycle / pool.length)}` });
      cycle++;
    }
    return result.slice(0, targetCount);
  };

  // ===== START TEST =====
  const handleStartTest = () => {
    let pickedQuestions = [];

    if (setupMode === 'quick') {
      const totalQ = preset.totalQ;
      // Pick proportionally from all subjects
      const perSubject = Math.ceil(totalQ / SUBJECTS.length);
      let pool = [];
      SUBJECTS.forEach(sub => {
        const subQ = questions.filter(q => q.subjectId === sub.id);
        const shuffled = [...subQ].sort(() => 0.5 - Math.random());
        // Take as many as available (no hard cap)
        pool.push(...shuffled.slice(0, perSubject));
      });
      // Shuffle pool
      pool = pool.sort(() => 0.5 - Math.random());
      // If pool is smaller than target (e.g. Full GATE 65Q with 40Q bank), pad with repeats
      pickedQuestions = padPool(pool, totalQ);
      initExam(pickedQuestions, preset.durationMins);
    } else {
      // Custom: pick exactly the count per subject
      SUBJECTS.forEach(sub => {
        const need = customConfig[sub.id];
        if (need > 0) {
          const subQ = questions.filter(q => q.subjectId === sub.id);
          const shuffled = [...subQ].sort(() => 0.5 - Math.random());
          pickedQuestions.push(...shuffled.slice(0, Math.min(need, subQ.length)));
        }
      });
      pickedQuestions = pickedQuestions.sort(() => 0.5 - Math.random());
      initExam(pickedQuestions, customDuration);
    }
  };

  const initExam = (qs, durationMins) => {
    if (qs.length === 0) return;
    const initialStatus = {};
    qs.forEach((q, idx) => {
      initialStatus[q.id] = idx === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
    });
    setTestQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});
    setQuestionStatus(initialStatus);
    setTimeLeft(durationMins * 60);
    setTotalTime(durationMins * 60);
    setTestState('ACTIVE');
  };

  // ===== EXAM NAVIGATION =====
  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= testQuestions.length) return;
    const targetQ = testQuestions[idx];
    if (questionStatus[targetQ.id] === 'NOT_VISITED') {
      setQuestionStatus(prev => ({ ...prev, [targetQ.id]: 'NOT_ANSWERED' }));
    }
    setCurrentIndex(idx);
  };

  const handleSelectOption = (optId, isMSQ = false) => {
    const q = testQuestions[currentIndex];
    if (isMSQ) {
      const current = answers[q.id] || [];
      const updated = current.includes(optId)
        ? current.filter(x => x !== optId)
        : [...current, optId];
      setAnswers({ ...answers, [q.id]: updated });
    } else {
      setAnswers({ ...answers, [q.id]: optId });
    }
  };

  const hasAnswerForCurrent = () => {
    const q = testQuestions[currentIndex];
    if (!q) return false;
    const ans = answers[q.id];
    return ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0);
  };

  const handleSaveAndNext = () => {
    const q = testQuestions[currentIndex];
    const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== '' &&
      (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
    setQuestionStatus(prev => ({
      ...prev,
      [q.id]: hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED'
    }));
    if (currentIndex < testQuestions.length - 1) goToQuestion(currentIndex + 1);
  };

  const handleMarkForReviewAndNext = () => {
    const q = testQuestions[currentIndex];
    const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== '' &&
      (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
    setQuestionStatus(prev => ({
      ...prev,
      [q.id]: hasAnswer ? 'ANS_REVIEW' : 'REVIEW'
    }));
    if (currentIndex < testQuestions.length - 1) goToQuestion(currentIndex + 1);
  };

  const handleClearResponse = () => {
    const q = testQuestions[currentIndex];
    const newAnswers = { ...answers };
    delete newAnswers[q.id];
    setAnswers(newAnswers);
    setQuestionStatus(prev => ({ ...prev, [q.id]: 'NOT_ANSWERED' }));
  };

  // ===== SUBMIT =====
  const handleSubmitTest = () => {
    const attempts = [];
    let totalMarks = 0;
    let score = 0;
    let positiveMarks = 0;
    let negativeMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    testQuestions.forEach(q => {
      totalMarks += q.marks;
      const ans = answers[q.id];
      const hasAnswer = ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0);

      if (!hasAnswer) {
        unattemptedCount++;
        attempts.push({ question: q, userAns: null, isCorrect: false, status: 'UNATTEMPTED', marksAwarded: 0 });
        return;
      }

      let isCorrect = false;
      if (q.type === 'MCQ') {
        isCorrect = ans === q.correctAnswer;
      } else if (q.type === 'MSQ') {
        const sortedSelected = (ans || []).sort().join(',');
        const sortedExpected = (q.correctAnswer || []).sort().join(',');
        isCorrect = sortedSelected === sortedExpected;
      } else if (q.type === 'NAT') {
        const num = parseFloat(ans);
        if (!isNaN(num) && q.tolerance) {
          isCorrect = num >= q.tolerance[0] && num <= q.tolerance[1];
        }
      }

      if (isCorrect) {
        correctCount++;
        positiveMarks += q.marks;
        score += q.marks;
        attempts.push({ question: q, userAns: ans, isCorrect: true, status: 'CORRECT', marksAwarded: q.marks });
      } else {
        incorrectCount++;
        const penalty = q.negativeMarks || 0;
        negativeMarks += penalty;
        score -= penalty;
        attempts.push({ question: q, userAns: ans, isCorrect: false, status: 'INCORRECT', marksAwarded: -penalty });
      }
    });

    const timeSpentSec = totalTime - timeLeft;
    const accuracy = correctCount + incorrectCount > 0
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
      : 0;

    // Subject-wise breakdown
    const subjectStats = {};
    attempts.forEach(att => {
      const sid = att.question.subjectId;
      if (!subjectStats[sid]) {
        subjectStats[sid] = { correct: 0, incorrect: 0, unattempted: 0, score: 0, totalMarks: 0 };
      }
      subjectStats[sid].totalMarks += att.question.marks;
      if (att.status === 'CORRECT') { subjectStats[sid].correct++; subjectStats[sid].score += att.marksAwarded; }
      else if (att.status === 'INCORRECT') { subjectStats[sid].incorrect++; subjectStats[sid].score += att.marksAwarded; }
      else { subjectStats[sid].unattempted++; }
    });

    const includedSubjectIds = [...new Set(testQuestions.map(q => q.subjectId))];

    const evaluation = {
      score: Number(Math.max(0, score).toFixed(2)),
      totalMarks,
      positiveMarks: Number(positiveMarks.toFixed(2)),
      negativeMarks: Number(negativeMarks.toFixed(2)),
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy,
      timeSpentSec,
      attempts,
      subjectStats,
      includedSubjectIds,
      subjectId: 'MIX',
      date: new Date().toISOString().split('T')[0],
      isMixTest: true,
      mixMode: setupMode,
    };

    setEvaluationResult(evaluation);
    setTestState('RESULT');

    if (accuracy >= 65) {
      try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
    }

    if (onCompleteTest) {
      const subjectNames = includedSubjectIds
        .map(sid => SUBJECTS.find(s => s.id === sid)?.name || sid)
        .join(', ');
      onCompleteTest({
        ...evaluation,
        topic: `Mix Test (${subjectNames})`,
      });
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ===========================
  // RENDER: SETUP
  // ===========================
  if (testState === 'SETUP') {
    // Always allow starting quick test as long as there are questions in the bank
    const canStartQuick = preset && questions.length > 0;
    const canStartCustom = customTotalQ > 0;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
              <Shuffle className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">GATE Mix Test — Multi-Subject CBT</h1>
              <p className="text-xs sm:text-sm text-indigo-300 mt-0.5">
                Simulate a real GATE exam with questions mixed across multiple subjects
              </p>
            </div>
          </div>

          {/* Two Mode Selector */}
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => setSetupMode('quick')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                setupMode === 'quick'
                  ? 'bg-white/15 border-white/40 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className={`w-5 h-5 ${setupMode === 'quick' ? 'text-yellow-300' : 'text-white/60'}`} />
                <span className="font-extrabold text-sm text-white">Quick Auto Mix</span>
                {setupMode === 'quick' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-full font-bold border border-yellow-400/30">ACTIVE</span>
                )}
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                System auto-generates a balanced test from all 9 subjects. Just pick a preset and go!
              </p>
            </button>

            <button
              onClick={() => setSetupMode('custom')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                setupMode === 'custom'
                  ? 'bg-white/15 border-white/40 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sliders className={`w-5 h-5 ${setupMode === 'custom' ? 'text-emerald-300' : 'text-white/60'}`} />
                <span className="font-extrabold text-sm text-white">Custom Mix</span>
                {setupMode === 'custom' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-400/20 text-emerald-300 rounded-full font-bold border border-emerald-400/30">ACTIVE</span>
                )}
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                You choose which subjects and exactly how many questions per subject. Full control!
              </p>
            </button>
          </div>
        </div>

        {/* ===== QUICK MODE CONTENT ===== */}
        {setupMode === 'quick' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="font-extrabold text-slate-900 text-base">Select a Test Preset</h2>
            </div>
            <p className="text-xs text-slate-500 -mt-3">
              The system picks questions proportionally from all 9 GATE CS subjects and shuffles them randomly.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_PRESETS.map(p => {
                const isSelected = selectedPreset === p.id;
                const isFullGate = p.id === 'full';
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPreset(p.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? isFullGate
                          ? 'border-amber-500 bg-amber-50 shadow-sm'
                          : 'border-indigo-600 bg-indigo-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    {isFullGate && (
                      <span className="absolute top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-300">
                        REAL GATE
                      </span>
                    )}
                    <span className="text-2xl block mb-2">{p.icon}</span>
                    <span className={`block font-extrabold text-sm ${
                      isSelected
                        ? isFullGate ? 'text-amber-900' : 'text-indigo-900'
                        : 'text-slate-800'
                    }`}>
                      {p.label}
                    </span>
                    <span className={`text-[11px] font-medium ${
                      isSelected
                        ? isFullGate ? 'text-amber-700' : 'text-indigo-600'
                        : 'text-slate-500'
                    }`}>
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-2xl border ${
              preset?.id === 'full'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-indigo-50 border-indigo-200'
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <Info className={`w-4 h-4 shrink-0 ${preset?.id === 'full' ? 'text-amber-600' : 'text-indigo-500'}`} />
                <span className={`text-xs font-semibold ${preset?.id === 'full' ? 'text-amber-800' : 'text-indigo-800'}`}>
                  Test Preview:
                </span>
                <span className={`text-xs ${preset?.id === 'full' ? 'text-amber-700' : 'text-indigo-700'}`}>
                  <strong>{preset?.totalQ} questions</strong> · <strong>all 9 subjects</strong> · <strong>{preset?.durationMins} min ({preset?.id === 'full' ? '3 hrs' : `${preset?.durationMins} min`})</strong> · GATE negative marking
                </span>
              </div>
              {preset?.gateNote && (
                <p className="text-[11px] text-amber-700 font-semibold mt-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {preset.gateNote}
                </p>
              )}
              {preset?.id === 'full' && questions.length < 65 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  ⚠️ Bank has {questions.length} unique questions — some will repeat to fill 65Q (add more via Dynamic Ingestion for full variety).
                </p>
              )}
            </div>

            {/* Subject preview pills */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subjects included:</p>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(sub => {
                  const c = SUBJECT_COLORS[sub.id] || SUBJECT_COLORS.os;
                  const skill = (currentUser.topicSkills && currentUser.topicSkills[sub.id]) || 5.0;
                  return (
                    <span key={sub.id} className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${c.bg} ${c.text} border ${c.border}`}>
                      {sub.name} · {skill}/10
                    </span>
                  );
                })}
              </div>
            </div>

            {/* GATE marking rules reminder */}
            <GateRulesBox />

            {/* Start CTA */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                disabled={!canStartQuick}
                onClick={handleStartTest}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Quick Mix Test
              </button>
            </div>
          </div>
        )}

        {/* ===== CUSTOM MODE CONTENT ===== */}
        {setupMode === 'custom' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-900 text-base">Customize Your Mix Test</h2>
            </div>
            <p className="text-xs text-slate-500 -mt-3">
              Toggle subjects on/off and set how many questions you want from each. The system picks randomly from that subject's question bank.
            </p>

            {/* Subject config grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SUBJECTS.map(sub => {
                const c = SUBJECT_COLORS[sub.id] || SUBJECT_COLORS.os;
                const count = customConfig[sub.id];
                const isOn = count > 0;
                const available = availableForSubject(sub.id);
                const skill = (currentUser.topicSkills && currentUser.topicSkills[sub.id]) || 5.0;

                return (
                  <div
                    key={sub.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isOn
                        ? `${c.light} ${c.border} shadow-sm`
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOn ? c.dot : 'bg-slate-300'}`} />
                        <span className={`text-xs font-extrabold truncate max-w-[120px] ${isOn ? c.text : 'text-slate-600'}`}>
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{skill}/10 Skill</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCustomCount(sub.id, 0)}
                        disabled={count === 0}
                        className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 ${
                          isOn ? `${c.bg} ${c.text} ${c.border}` : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min={0}
                        max={available}
                        value={count}
                        onChange={e => setCustomCount(sub.id, e.target.value)}
                        className={`w-12 text-center rounded-lg border py-1 text-sm font-bold focus:outline-none focus:ring-2 ${
                          isOn
                            ? `${c.border} focus:ring-indigo-400 ${c.text} bg-white`
                            : 'border-slate-200 text-slate-400 bg-white focus:ring-indigo-300'
                        }`}
                      />

                      <button
                        onClick={() => setCustomCount(sub.id, count + 1)}
                        disabled={count >= available}
                        className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 ${
                          isOn ? `${c.bg} ${c.text} ${c.border}` : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        +
                      </button>

                      <span className="text-[10px] text-slate-400 ml-auto">
                        max {available}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Duration selector */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Test Duration:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 45, 60, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setCustomDuration(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      customDuration === d
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            {customTotalQ > 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-emerald-800">Custom Test Preview</span>
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  <strong>{customTotalQ} questions</strong> from <strong>{customSelectedSubjects.length} subject{customSelectedSubjects.length > 1 ? 's' : ''}</strong>
                  {' '}· <strong>{customDuration} minutes</strong> · GATE negative marking
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customSelectedSubjects.map(sub => {
                    const c = SUBJECT_COLORS[sub.id] || SUBJECT_COLORS.os;
                    return (
                      <span key={sub.id} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.bg} ${c.text} border ${c.border}`}>
                        {sub.name}: {customConfig[sub.id]}Q
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs text-amber-700 font-medium">
                  Select at least one subject and set its question count to start the test.
                </span>
              </div>
            )}

            <GateRulesBox />

            {/* Start CTA */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                disabled={!canStartCustom}
                onClick={handleStartTest}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Custom Mix Test
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===========================
  // RENDER: ACTIVE EXAM
  // ===========================
  if (testState === 'ACTIVE' && testQuestions.length > 0) {
    const currentQ = testQuestions[currentIndex];
    const userSkill = (currentUser.topicSkills && currentUser.topicSkills[currentQ.subjectId]) || 5.0;
    const adaptive = getPersonalizedDifficulty(currentQ.baseDifficulty, userSkill);
    const isWarningTime = timeLeft <= 120;
    const subColor = SUBJECT_COLORS[currentQ.subjectId] || SUBJECT_COLORS.os;

    // Status counts for progress bar
    const answeredCount = Object.values(questionStatus).filter(s => s === 'ANSWERED' || s === 'ANS_REVIEW').length;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

        {/* CBT Top Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
              MIX
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm tracking-tight">GATE Mix Test (CBT)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subColor.bg} ${subColor.text} border ${subColor.border}`}>
                  {SUBJECTS.find(s => s.id === currentQ.subjectId)?.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">Candidate: {currentUser.name} ({currentUser.handle})</p>
            </div>
          </div>

          {/* Progress strip */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold">{answeredCount}</span>/<span>{testQuestions.length}</span>
            <span>answered</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <CalcIcon className="w-4 h-4" />
              <span>Calculator</span>
            </button>

            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-black border transition-all ${
              isWarningTime
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Main CBT Layout */}
        <div className="grid lg:grid-cols-4 gap-4">

          {/* Left: Question Area */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between min-h-[520px]">
            <div className="space-y-4">

              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Question {currentIndex + 1} of {testQuestions.length}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${subColor.bg} ${subColor.text} border ${subColor.border}`}>
                    {SUBJECTS.find(s => s.id === currentQ.subjectId)?.name}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {currentQ.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    +{currentQ.marks}M
                    {currentQ.negativeMarks > 0 && <span className="text-rose-500 font-mono"> (−{currentQ.negativeMarks})</span>}
                  </span>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${adaptive.badgeColor}`}>
                  Difficulty: {adaptive.label}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                {currentQ.question}
              </div>

              {/* MCQ */}
              {currentQ.type === 'MCQ' && (
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id, false)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400 bg-white text-slate-600'
                        }`}>
                          {opt.id}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MSQ */}
              {currentQ.type === 'MSQ' && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-purple-700 block">
                    Select all correct choices (One or more options may be correct):
                  </span>
                  {currentQ.options.map(opt => {
                    const selected = answers[currentQ.id] || [];
                    const isSelected = selected.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id, true)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <input type="checkbox" checked={isSelected} readOnly className="mt-1 rounded text-purple-600 pointer-events-none" />
                        <span className="font-bold text-slate-700">({opt.id})</span>
                        <span className="mt-0.5 leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* NAT */}
              {currentQ.type === 'NAT' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 max-w-md pt-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Virtual Keypad — Enter Numerical Answer:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder="Enter your numerical answer"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                    {['1','2','3','4','5','6','7','8','9','0','.','-'].map(k => (
                      <button
                        key={k}
                        onClick={() => {
                          const curr = answers[currentQ.id] || '';
                          setAnswers({ ...answers, [currentQ.id]: curr + k });
                        }}
                        className="py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                      >
                        {k}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const curr = answers[currentQ.id] || '';
                        setAnswers({ ...answers, [currentQ.id]: curr.slice(0, -1) });
                      }}
                      className="py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold col-span-4 cursor-pointer"
                    >
                      Backspace / Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearResponse}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Clear Response
                </button>
                <button
                  onClick={handleMarkForReviewAndNext}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                >
                  Mark for Review & Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Question Palette */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Question Palette
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-emerald-500 text-white font-bold flex items-center justify-center text-[9px]">✔</span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-rose-500 text-white font-bold flex items-center justify-center text-[9px]">✘</span>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-[9px]">●</span>
                <span>For Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-[9px]">-</span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Grid */}
            <div className="pt-2 border-t border-slate-100">
              <div className="grid grid-cols-5 gap-2">
                {testQuestions.map((q, idx) => {
                  const status = questionStatus[q.id] || 'NOT_VISITED';
                  const isCurrent = idx === currentIndex;
                  const subC = SUBJECT_COLORS[q.subjectId] || SUBJECT_COLORS.os;

                  let btnStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (status === 'ANSWERED') btnStyle = 'bg-emerald-600 text-white border-emerald-600';
                  else if (status === 'NOT_ANSWERED') btnStyle = 'bg-rose-500 text-white border-rose-500';
                  else if (status === 'REVIEW') btnStyle = 'bg-purple-600 text-white border-purple-600';
                  else if (status === 'ANS_REVIEW') btnStyle = 'bg-purple-700 text-emerald-300 border-purple-800 font-extrabold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      title={SUBJECTS.find(s => s.id === q.subjectId)?.name}
                      className={`h-9 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer relative ${btnStyle} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {/* Subject color dot */}
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${subC.dot} opacity-70`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject color legend */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Key:</p>
              {[...new Set(testQuestions.map(q => q.subjectId))].map(sid => {
                const sub = SUBJECTS.find(s => s.id === sid);
                const c = SUBJECT_COLORS[sid] || SUBJECT_COLORS.os;
                return (
                  <div key={sid} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className="text-[10px] text-slate-600 truncate">{sub?.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Source */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Source:</span>
              <p className="truncate">{testQuestions[currentIndex]?.source}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER: RESULT / SCORECARD
  // ===========================
  if (testState === 'RESULT' && evaluationResult) {
    const {
      score, totalMarks, positiveMarks, negativeMarks,
      correctCount, incorrectCount, unattemptedCount,
      accuracy, timeSpentSec, attempts,
      subjectStats, includedSubjectIds
    } = evaluationResult;

    const mins = Math.floor(timeSpentSec / 60);
    const secs = timeSpentSec % 60;
    const isHighRank = accuracy >= 70;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Scorecard Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Mix Test Complete
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {setupMode === 'quick' ? '⚡ Quick Auto Mix' : '🎛 Custom Mix'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">Mix Test Diagnostic Scorecard</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Candidate: {currentUser.name} · {evaluationResult.date} · {includedSubjectIds.length} Subjects
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center sm:text-right shrink-0">
              <span className="text-xs text-slate-400 uppercase font-bold block">Total Score</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                {score.toFixed(2)} <span className="text-base text-slate-400">/ {totalMarks}</span>
              </div>
              <span className={`text-[11px] font-bold ${isHighRank ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isHighRank ? '🌟 High GATE Percentile Track' : '⚡ Opportunity for Targeted Remediation'}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Accuracy Rate</span>
              <p className="text-xl font-black text-white mt-1">{accuracy}%</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Positive Marks</span>
              <p className="text-xl font-black text-emerald-400 mt-1">+{positiveMarks}</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Negative Penalty</span>
              <p className="text-xl font-black text-rose-400 mt-1">−{negativeMarks}</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Time Taken</span>
              <p className="text-xl font-black text-indigo-300 mt-1 font-mono">{mins}m {secs}s</p>
            </div>
          </div>
        </div>

        {/* Subject-wise Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">Subject-Wise Performance Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Total Qs</th>
                  <th className="py-3 px-4 text-center">Correct</th>
                  <th className="py-3 px-4 text-center">Wrong</th>
                  <th className="py-3 px-4 text-center">Skipped</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {includedSubjectIds.map(sid => {
                  const sub = SUBJECTS.find(s => s.id === sid);
                  const stat = subjectStats[sid] || { correct: 0, incorrect: 0, unattempted: 0, score: 0, totalMarks: 0 };
                  const total = stat.correct + stat.incorrect + stat.unattempted;
                  const subAccuracy = stat.correct + stat.incorrect > 0
                    ? Math.round((stat.correct / (stat.correct + stat.incorrect)) * 100)
                    : 0;
                  const c = SUBJECT_COLORS[sid] || SUBJECT_COLORS.os;

                  return (
                    <tr key={sid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                          <span className="font-bold text-slate-800">{sub?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">{total}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-emerald-600">{stat.correct}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-rose-600">{stat.incorrect}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-400">{stat.unattempted}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold font-mono ${Number(stat.score) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {Number(stat.score) >= 0 ? '+' : ''}{Number(stat.score).toFixed(2)}
                        </span>
                        <span className="text-slate-400 text-[10px]">/{stat.totalMarks}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-bold text-xs ${
                            subAccuracy >= 70 ? 'text-emerald-600' :
                            subAccuracy >= 50 ? 'text-amber-600' : 'text-rose-600'
                          }`}>{subAccuracy}%</span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                subAccuracy >= 70 ? 'bg-emerald-500' :
                                subAccuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${subAccuracy}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td className="py-3 px-4 font-extrabold text-xs">TOTAL</td>
                  <td className="py-3 px-4 text-center font-bold">{testQuestions.length}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-400">{correctCount}</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-400">{incorrectCount}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{unattemptedCount}</td>
                  <td className="py-3 px-4 text-center font-extrabold text-emerald-400 font-mono">{score.toFixed(2)}/{totalMarks}</td>
                  <td className="py-3 px-4 text-center font-extrabold">{accuracy}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Detailed Question Review & Solutions</h2>
          <button
            onClick={() => setTestState('SETUP')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Take Another Mix Test</span>
          </button>
        </div>

        {/* Question-by-Question Review */}
        <div className="space-y-4">
          {attempts.map((att, idx) => {
            const q = att.question;
            const userSkill = (currentUser.topicSkills && currentUser.topicSkills[q.subjectId]) || 5.0;
            const adaptive = getPersonalizedDifficulty(q.baseDifficulty, userSkill);
            const subC = SUBJECT_COLORS[q.subjectId] || SUBJECT_COLORS.os;

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subC.bg} ${subC.text} border ${subC.border}`}>
                      {SUBJECTS.find(s => s.id === q.subjectId)?.name}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{q.topic}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({q.type})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${adaptive.badgeColor}`}>
                      {adaptive.label}
                    </div>
                    {att.status === 'CORRECT' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Correct (+{att.marksAwarded} Marks)
                      </span>
                    )}
                    {att.status === 'INCORRECT' && (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Incorrect ({att.marksAwarded} Marks)
                      </span>
                    )}
                    {att.status === 'UNATTEMPTED' && (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        Unattempted (0 Marks)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                  {q.question}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Your Response:</span>
                    <span className={`font-mono font-bold ${att.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {att.userAns === null ? 'None (Skipped)' : Array.isArray(att.userAns) ? att.userAns.join(', ') : att.userAns}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Official Verified Key:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-1 font-mono">
                  <div className="text-indigo-400 font-bold text-[11px]">Official Explanation & Derivation:</div>
                  <p className="whitespace-pre-line text-slate-300 font-sans leading-relaxed text-[11px]">
                    {q.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Source: {q.source}</span>
                  <a
                    href={q.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Paper</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

// ===== SHARED SUB-COMPONENT =====
function GateRulesBox() {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        GATE CBT Marking Scheme:
      </h4>
      <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
        <li><strong>MCQ:</strong> 1 Mark (−0.33 wrong) or 2 Marks (−0.66 wrong). One correct option.</li>
        <li><strong>MSQ:</strong> One or more correct options. <strong>Zero negative marking</strong>. No partial marks.</li>
        <li><strong>NAT:</strong> Enter numerical response. <strong>Zero negative marking</strong>.</li>
        <li><strong>Virtual Calculator:</strong> Available in the toolbar during the exam.</li>
      </ul>
    </div>
  );
}
