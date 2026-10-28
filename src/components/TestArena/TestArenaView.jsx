import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  Calculator as CalcIcon, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Bookmark,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUBJECTS } from '../../data/authenticQuestions';
import { getPersonalizedDifficulty } from '../../services/adaptiveEngine';

export default function TestArenaView({ 
  questions, 
  currentUser, 
  onCompleteTest, 
  onOpenCalculator 
}) {
  // Test Lifecycle: 'SETUP' | 'ACTIVE' | 'RESULT'
  const [testState, setTestState] = useState('SETUP');
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Responses state: { [qId]: answer }
  const [answers, setAnswers] = useState({});
  // Status state: 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'REVIEW' | 'ANS_REVIEW'
  const [questionStatus, setQuestionStatus] = useState({});
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins in seconds
  const [totalTime, setTotalTime] = useState(1800);
  
  // Result state
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Timer hook
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

  // Start Test configuration
  const handleStartTest = (subjectId = 'ALL', count = 15, durationMins = 30) => {
    let pool = questions;
    if (subjectId !== 'ALL') {
      pool = questions.filter(q => q.subjectId === subjectId);
    }
    if (pool.length === 0) pool = questions;

    // Pick questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.min(count, pool.length));
    
    // Initialize question statuses
    const initialStatus = {};
    shuffled.forEach((q, idx) => {
      initialStatus[q.id] = idx === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
    });

    setTestQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setQuestionStatus(initialStatus);
    setTimeLeft(durationMins * 60);
    setTotalTime(durationMins * 60);
    setTestState('ACTIVE');
  };

  // Navigate to question
  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= testQuestions.length) return;
    const targetQ = testQuestions[idx];
    
    // If target was NOT_VISITED, change to NOT_ANSWERED
    if (questionStatus[targetQ.id] === 'NOT_VISITED') {
      setQuestionStatus(prev => ({ ...prev, [targetQ.id]: 'NOT_ANSWERED' }));
    }
    setCurrentIndex(idx);
  };

  // Option selection
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

  // Save & Next
  const handleSaveAndNext = () => {
    const q = testQuestions[currentIndex];
    const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== '' && (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);

    setQuestionStatus(prev => ({
      ...prev,
      [q.id]: hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED'
    }));

    if (currentIndex < testQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    const q = testQuestions[currentIndex];
    const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== '' && (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);

    setQuestionStatus(prev => ({
      ...prev,
      [q.id]: hasAnswer ? 'ANS_REVIEW' : 'REVIEW'
    }));

    if (currentIndex < testQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  // Clear Response
  const handleClearResponse = () => {
    const q = testQuestions[currentIndex];
    const newAnswers = { ...answers };
    delete newAnswers[q.id];
    setAnswers(newAnswers);
    setQuestionStatus(prev => ({ ...prev, [q.id]: 'NOT_ANSWERED' }));
  };

  // Submit and evaluate
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
      subjectId: selectedSubjectId,
      date: new Date().toISOString().split('T')[0]
    };

    setEvaluationResult(evaluation);
    setTestState('RESULT');

    if (accuracy >= 65) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }

    if (onCompleteTest) {
      onCompleteTest(evaluation);
    }
  };

  // Helper format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ================= RENDER: TEST SETUP =================
  if (testState === 'SETUP') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                GATE Computer-Based Mock Test (CBT)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Simulate the real GATE exam environment with timer, negative marking, and virtual calculator.
              </p>
            </div>
          </div>

          {/* Test Selector Tabs */}
          <div className="mt-6 space-y-4">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Select Subject or Comprehensive Mock:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setSelectedSubjectId('ALL')}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  selectedSubjectId === 'ALL'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <span className="block text-slate-900 font-extrabold text-sm">Full Mini-Mock</span>
                <span className="text-[10px] text-slate-500 font-normal">Mixed across all topics</span>
              </button>
              {SUBJECTS.map(sub => {
                const isSelected = selectedSubjectId === sub.id;
                const skill = (currentUser.topicSkills && currentUser.topicSkills[sub.id]) || 5.0;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="block text-slate-900 font-bold truncate">{sub.name}</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">{skill}/10 Skill</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Rules & Guidelines Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Official GATE CBT Instructions & Marking Scheme:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
              <li><strong>MCQ (Multiple Choice):</strong> 1 Mark (-0.33 wrong) or 2 Marks (-0.66 wrong). Exactly one correct option.</li>
              <li><strong>MSQ (Multiple Select):</strong> One or more correct options. <strong>Zero negative marking</strong>. No partial marks.</li>
              <li><strong>NAT (Numerical Answer Type):</strong> Enter numerical response. <strong>Zero negative marking</strong>.</li>
              <li><strong>Virtual Calculator:</strong> Built-in scientific calculator provided in the top toolbar.</li>
            </ul>
          </div>

          {/* Start Test CTA */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Test Format: <strong>15 Authentic Questions</strong> • Duration: <strong>30 Minutes</strong>
            </div>
            <button
              onClick={() => handleStartTest(selectedSubjectId, 15, 30)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter CBT Examination Hall</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ================= RENDER: ACTIVE CBT EXAM =================
  if (testState === 'ACTIVE' && testQuestions.length > 0) {
    const currentQ = testQuestions[currentIndex];
    const userSkill = (currentUser.topicSkills && currentUser.topicSkills[currentQ.subjectId]) || 5.0;
    const adaptive = getPersonalizedDifficulty(currentQ.baseDifficulty, userSkill);
    const isWarningTime = timeLeft <= 120;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* CBT Top Examination Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              CBT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">GATE CS Mock Test</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {selectedSubjectId === 'ALL' ? 'General Mini-Mock' : currentQ.topic}
                </span>
              </div>
              <p className="text-xs text-slate-400">Candidate: {currentUser.name} ({currentUser.handle})</p>
            </div>
          </div>

          {/* Right Toolbar: Timer, Calculator, Submit */}
          <div className="flex items-center gap-3">
            {/* Scientific Calculator Trigger */}
            <button
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <CalcIcon className="w-4 h-4" />
              <span>Calculator</span>
            </button>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-black border transition-all ${
              isWarningTime 
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse' 
                : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>Time Left: {formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitTest}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Main Examination Workspace: Left Question Area, Right Palette */}
        <div className="grid lg:grid-cols-4 gap-4">
          
          {/* Left Column: Question Details & Inputs */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between min-h-[520px]">
            
            <div className="space-y-4">
              {/* Question Sub-Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Question {currentIndex + 1} of {testQuestions.length}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Type: {currentQ.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    +{currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}
                    {currentQ.negativeMarks > 0 && <span className="text-rose-500 font-mono"> (-{currentQ.negativeMarks})</span>}
                  </span>
                </div>

                {/* Adaptive Difficulty Indicator on Test */}
                <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${adaptive.badgeColor}`}>
                  <span>Difficulty: {adaptive.label}</span>
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                {currentQ.question}
              </div>

              {/* Options Input according to Type */}
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
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-2xs'
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

              {currentQ.type === 'MSQ' && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-purple-700 block">
                    Select all correct choices (One or more options may be correct):
                  </span>
                  <div className="space-y-2">
                    {currentQ.options.map(opt => {
                      const selected = answers[currentQ.id] || [];
                      const isSelected = selected.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id, true)}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mt-1 rounded text-purple-600 pointer-events-none"
                          />
                          <span className="font-bold text-slate-700">({opt.id})</span>
                          <span className="mt-0.5 leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentQ.type === 'NAT' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 max-w-md pt-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Virtual Keypad Entry for Numerical Answer:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder="Enter your numerical answer here"
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

            {/* Bottom Exam Navigation Toolbar */}
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

          {/* Right Column: Question Palette & Status Legend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Question Palette
            </h3>

            {/* Status Legend per TCS iON GATE specification */}
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
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-[9px]">-</span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Question Numbers Grid */}
            <div className="pt-2 border-t border-slate-100">
              <div className="grid grid-cols-5 gap-2">
                {testQuestions.map((q, idx) => {
                  const status = questionStatus[q.id] || 'NOT_VISITED';
                  const isCurrent = idx === currentIndex;

                  let btnStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (status === 'ANSWERED') btnStyle = 'bg-emerald-600 text-white border-emerald-600';
                  else if (status === 'NOT_ANSWERED') btnStyle = 'bg-rose-500 text-white border-rose-500';
                  else if (status === 'REVIEW') btnStyle = 'bg-purple-600 text-white border-purple-600';
                  else if (status === 'ANS_REVIEW') btnStyle = 'bg-purple-700 text-emerald-300 border-purple-800 font-extrabold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={`h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${btnStyle} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Authenticity Citation Footer */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Question Source:</span>
              <p className="truncate">{currentQ.source}</p>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ================= RENDER: POST-TEST EVALUATION & DIAGNOSTICS =================
  if (testState === 'RESULT' && evaluationResult) {
    const { 
      score, 
      totalMarks, 
      positiveMarks, 
      negativeMarks, 
      correctCount, 
      incorrectCount, 
      unattemptedCount, 
      accuracy, 
      timeSpentSec, 
      attempts 
    } = evaluationResult;

    const mins = Math.floor(timeSpentSec / 60);
    const secs = timeSpentSec % 60;
    const isHighRank = accuracy >= 70;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Scorecard Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Evaluation Complete
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">
                Mock Test Diagnostic Scorecard
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Candidate: {currentUser.name} • {evaluationResult.date}
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center sm:text-right shrink-0">
              <span className="text-xs text-slate-400 uppercase font-bold block">Total GATE Score</span>
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
              <p className="text-xl font-black text-rose-400 mt-1">-{negativeMarks}</p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Time Taken</span>
              <p className="text-xl font-black text-indigo-300 mt-1 font-mono">{mins}m {secs}s</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Detailed Solution & Adaptive Analysis
          </h2>
          <button
            onClick={() => setTestState('SETUP')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Take Another Test</span>
          </button>
        </div>

        {/* Question-by-Question Review */}
        <div className="space-y-4">
          {attempts.map((att, idx) => {
            const q = att.question;
            const userSkill = (currentUser.topicSkills && currentUser.topicSkills[q.subjectId]) || 5.0;
            const adaptive = getPersonalizedDifficulty(q.baseDifficulty, userSkill);

            return (
              <div 
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{q.topic}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({q.type})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${adaptive.badgeColor}`}>
                      Difficulty: {adaptive.label}
                    </div>
                    {att.status === 'CORRECT' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct (+{att.marksAwarded} Marks)</span>
                      </span>
                    )}
                    {att.status === 'INCORRECT' && (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Incorrect ({att.marksAwarded} Marks)</span>
                      </span>
                    )}
                    {att.status === 'UNATTEMPTED' && (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        Unattempted (0 Marks)
                      </span>
                    )}
                  </div>
                </div>

                {/* Statement */}
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                  {q.question}
                </p>

                {/* Response Comparison */}
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

                {/* Step-by-Step Official Explanation */}
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
                    <span>View Authentic Paper</span>
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
