import React, { useState } from 'react';
import { 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  HelpCircle, 
  ChevronRight, 
  Sparkles,
  Info,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';
import { SUBJECTS } from '../../data/authenticQuestions';
import { getPersonalizedDifficulty } from '../../services/adaptiveEngine';

export default function TopicPracticeView({ 
  questions, 
  currentUser, 
  selectedSubjectId, 
  onSelectSubject,
  onRecordPracticeAttempt
}) {
  const [difficultyFilter, setDifficultyFilter] = useState('ALL'); // ALL, Low, Medium, Hard
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, MCQ, MSQ, NAT
  const [expandedSolutions, setExpandedSolutions] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [checkedResults, setCheckedResults] = useState({});

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (selectedSubjectId && selectedSubjectId !== 'ALL' && q.subjectId !== selectedSubjectId) {
      return false;
    }
    if (typeFilter !== 'ALL' && q.type !== typeFilter) {
      return false;
    }
    if (difficultyFilter !== 'ALL') {
      const userSkill = (currentUser.topicSkills && currentUser.topicSkills[q.subjectId]) || 5.0;
      const adaptive = getPersonalizedDifficulty(q.baseDifficulty, userSkill);
      if (adaptive.label !== difficultyFilter) {
        return false;
      }
    }
    return true;
  });

  const handleSelectOption = (qId, optId, isMSQ = false) => {
    if (checkedResults[qId]) return; // locked after checking

    if (isMSQ) {
      const current = userAnswers[qId] || [];
      const updated = current.includes(optId)
        ? current.filter(x => x !== optId)
        : [...current, optId];
      setUserAnswers({ ...userAnswers, [qId]: updated });
    } else {
      setUserAnswers({ ...userAnswers, [qId]: optId });
    }
  };

  const handleCheckAnswer = (q) => {
    const ans = userAnswers[q.id];
    if (ans === undefined || ans === '') return;

    let isCorrect = false;
    if (q.type === 'MCQ') {
      isCorrect = ans === q.correctAnswer;
    } else if (q.type === 'MSQ') {
      const selected = (ans || []).sort().join(',');
      const expected = (q.correctAnswer || []).sort().join(',');
      isCorrect = selected === expected;
    } else if (q.type === 'NAT') {
      const num = parseFloat(ans);
      if (!isNaN(num) && q.tolerance) {
        isCorrect = num >= q.tolerance[0] && num <= q.tolerance[1];
      }
    }

    setCheckedResults({ ...checkedResults, [q.id]: isCorrect });
    setExpandedSolutions({ ...expandedSolutions, [q.id]: true });

    if (onRecordPracticeAttempt) {
      onRecordPracticeAttempt(q, isCorrect);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header and Explanation of Adaptive Difficulty */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Self-Paced Practice
              </span>
              <span className="text-xs text-slate-500 font-medium">Authentic GATE Questions</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Topic-Wise Adaptive Practice
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Questions below are dynamically tagged with <strong>Low</strong>, <strong>Medium</strong>, or <strong>Hard</strong> difficulty relative to your current mastery in each subject.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 max-w-sm">
            <span className="font-bold text-slate-900 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Dynamic Labeling Indicator:
            </span>
            <span className="text-[11px] block mt-0.5">
              If your skill is high in OS, OS questions shift to <strong>Low</strong>. If your skill is low in Algorithms, questions shift to <strong>Hard</strong>.
            </span>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => onSelectSubject('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              !selectedSubjectId || selectedSubjectId === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Subjects ({questions.length})
          </button>
          {SUBJECTS.map(sub => {
            const count = questions.filter(q => q.subjectId === sub.id).length;
            const isSelected = selectedSubjectId === sub.id;
            const skill = (currentUser.topicSkills && currentUser.topicSkills[sub.id]) || 5.0;

            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{sub.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count} • {skill}★
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-filters: Dynamic Difficulty & Question Type */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Dynamic Difficulty:
            </span>
            {['ALL', 'Low', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  difficultyFilter === d
                    ? d === 'Low' ? 'bg-emerald-600 text-white' : d === 'Hard' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Question Format:</span>
            {['ALL', 'MCQ', 'MSQ', 'NAT'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No questions match the selected filters.</p>
            <p className="text-xs mt-1">Try switching difficulty or selecting "All Subjects".</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const userSkill = (currentUser.topicSkills && currentUser.topicSkills[q.subjectId]) || 5.0;
            const adaptive = getPersonalizedDifficulty(q.baseDifficulty, userSkill);
            const isChecked = checkedResults[q.id] !== undefined;
            const isCorrect = checkedResults[q.id];
            const isSolutionOpen = expandedSolutions[q.id];

            return (
              <div 
                key={q.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Question Header & Dynamic Difficulty Tagging */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      {q.topic}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {q.type} • {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      {q.negativeMarks > 0 && <span className="text-rose-500 font-mono"> (-{q.negativeMarks})</span>}
                    </span>
                  </div>

                  {/* Adaptive Difficulty Badge Showcase */}
                  <div className="flex items-center gap-2">
                    <div 
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${adaptive.badgeColor}`}
                      title={adaptive.description}
                    >
                      <span className={`w-2 h-2 rounded-full ${adaptive.dotColor}`}></span>
                      <span>Difficulty: {adaptive.label}</span>
                      <span className="text-[10px] font-normal opacity-80">
                        (Personalized • Skill: {adaptive.userSkill} / Base: {adaptive.baseDifficulty})
                      </span>
                    </div>

                    {/* Source Citation Link */}
                    <a
                      href={q.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200"
                    >
                      <span>{q.source}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                  {q.question}
                </div>

                {/* Option / Answer inputs */}
                {q.type === 'MCQ' && (
                  <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                    {q.options.map(opt => {
                      const isSelected = userAnswers[q.id] === opt.id;
                      let optionStyle = 'border-slate-200 hover:border-indigo-300 bg-slate-50/50';
                      if (isSelected) optionStyle = 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-semibold';
                      if (isChecked) {
                        if (opt.id === q.correctAnswer) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-medium';
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(q.id, opt.id, false)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${optionStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-white border border-slate-300 font-bold flex items-center justify-center shrink-0 text-slate-700">
                            {opt.id}
                          </span>
                          <span className="mt-0.5">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'MSQ' && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-purple-700 block">
                      Multiple Select Question (MSQ): Select all correct options. No negative marking.
                    </span>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {q.options.map(opt => {
                        const selectedList = userAnswers[q.id] || [];
                        const isSelected = selectedList.includes(opt.id);
                        let optionStyle = 'border-slate-200 hover:border-indigo-300 bg-slate-50/50';
                        if (isSelected) optionStyle = 'border-purple-600 bg-purple-50/80 text-purple-950 font-semibold';
                        if (isChecked) {
                          const isExpected = (q.correctAnswer || []).includes(opt.id);
                          if (isExpected) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                          } else if (isSelected && !isExpected) {
                            optionStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id, true)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${optionStyle}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="mt-0.5 rounded text-purple-600 pointer-events-none"
                            />
                            <span className="font-bold text-slate-700 mr-1">({opt.id})</span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {q.type === 'NAT' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 max-w-sm">
                    <label className="text-xs font-bold text-slate-700 block">
                      Numerical Answer Type (NAT): Enter decimal or integer
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={isChecked}
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        placeholder="Enter numerical answer"
                        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {isChecked && (
                        <span className="text-xs font-mono font-bold text-slate-600 shrink-0">
                          Key: {q.correctAnswer}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons & Result Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {!isChecked ? (
                      <button
                        onClick={() => handleCheckAnswer(q)}
                        disabled={userAnswers[q.id] === undefined || userAnswers[q.id] === ''}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        Verify & Check Answer
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct! (+{q.marks} Marks)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Incorrect {q.negativeMarks > 0 ? `(-${q.negativeMarks} Marks)` : '(0 Penalty)'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedSolutions({ ...expandedSolutions, [q.id]: !isSolutionOpen })}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      {isSolutionOpen ? 'Hide Solution' : 'View Official Solution'}
                    </button>
                  </div>

                  {/* Concept Tags */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(q.conceptTags || []).map(tag => (
                      <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Official Explanation */}
                {isSolutionOpen && (
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-2 border border-slate-800 animate-in fade-in duration-150 font-mono">
                    <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-1.5 text-[11px]">
                      <span>Official GATE Solution & Derivation:</span>
                      <span>Correct: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span>
                    </div>
                    <p className="whitespace-pre-line text-slate-200 leading-relaxed font-sans text-xs">
                      {q.explanation}
                    </p>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
