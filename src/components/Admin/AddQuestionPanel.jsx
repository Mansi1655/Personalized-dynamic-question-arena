import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  BookOpen,
  RefreshCw,
  CloudUpload,
  Sparkles,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SUBJECTS } from '../../data/authenticQuestions';
import {
  addQuestion,
  seedQuestionsToFirestore,
  getAllQuestions,
  deleteQuestion
} from '../../services/firestoreService';

const QUESTION_TYPES = ['MCQ', 'MSQ', 'NAT'];

const EMPTY_QUESTION = {
  subjectId: '',
  topic: '',
  source: '',
  sourceUrl: '',
  type: 'MCQ',
  marks: 1,
  negativeMarks: 0.33,
  baseDifficulty: 5.0,
  question: '',
  options: [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ],
  correctAnswer: '',
  tolerance: null,
  explanation: '',
  conceptTags: []
};

export default function AddQuestionPanel({
  localQuestions,
  onQuestionsUpdated,
  onNavigateToPractice
}) {
  const [form, setForm] = useState({ ...EMPTY_QUESTION });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isFetchingFromDb, setIsFetchingFromDb] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text }
  const [seedLogs, setSeedLogs] = useState([]);
  const [dbQuestionCount, setDbQuestionCount] = useState(null);
  const [showSeedSection, setShowSeedSection] = useState(false);

  // Fetch DB count on mount
  useEffect(() => {
    refreshDbCount();
  }, []);

  const refreshDbCount = async () => {
    try {
      const allQ = await getAllQuestions();
      setDbQuestionCount(allQ.length);
    } catch (e) {
      setDbQuestionCount('?');
    }
  };

  // Form handlers
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (idx, text) => {
    setForm(prev => {
      const newOptions = [...prev.options];
      newOptions[idx] = { ...newOptions[idx], text };
      return { ...prev, options: newOptions };
    });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.conceptTags.includes(tag)) {
      setForm(prev => ({ ...prev, conceptTags: [...prev.conceptTags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({
      ...prev,
      conceptTags: prev.conceptTags.filter(t => t !== tag)
    }));
  };

  // Handle type change → adjust negative marks and options
  const handleTypeChange = (type) => {
    let negativeMarks = 0;
    let options = form.options;
    let correctAnswer = '';
    let tolerance = null;

    if (type === 'MCQ') {
      negativeMarks = form.marks === 1 ? 0.33 : 0.66;
      options = [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ];
    } else if (type === 'MSQ') {
      negativeMarks = 0;
      options = [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ];
      correctAnswer = [];
    } else if (type === 'NAT') {
      negativeMarks = 0;
      options = [];
      tolerance = [0, 0];
    }

    setForm(prev => ({
      ...prev,
      type,
      negativeMarks,
      options,
      correctAnswer,
      tolerance
    }));
  };

  // Handle marks change → update negative marks for MCQ
  const handleMarksChange = (marks) => {
    const m = Number(marks);
    let negativeMarks = form.negativeMarks;
    if (form.type === 'MCQ') {
      negativeMarks = m === 1 ? 0.33 : 0.66;
    }
    setForm(prev => ({ ...prev, marks: m, negativeMarks }));
  };

  // MSQ correct answer toggle
  const toggleMSQAnswer = (optId) => {
    setForm(prev => {
      const current = Array.isArray(prev.correctAnswer) ? prev.correctAnswer : [];
      const updated = current.includes(optId)
        ? current.filter(x => x !== optId)
        : [...current, optId];
      return { ...prev, correctAnswer: updated };
    });
  };

  // Validate form
  const validateForm = () => {
    if (!form.subjectId) return 'Please select a subject.';
    if (!form.topic.trim()) return 'Please enter a topic.';
    if (!form.question.trim()) return 'Please enter the question text.';
    if (!form.source.trim()) return 'Please enter the source.';
    if (form.type === 'MCQ') {
      if (form.options.some(o => !o.text.trim())) return 'All 4 options must have text.';
      if (!form.correctAnswer) return 'Please select the correct answer.';
    }
    if (form.type === 'MSQ') {
      if (form.options.some(o => !o.text.trim())) return 'All options must have text.';
      if (!Array.isArray(form.correctAnswer) || form.correctAnswer.length === 0) return 'Please select at least one correct answer.';
    }
    if (form.type === 'NAT') {
      if (form.correctAnswer === '' || form.correctAnswer === undefined) return 'Please enter the correct numerical answer.';
    }
    if (!form.explanation.trim()) return 'Please provide an explanation.';
    return null;
  };

  // Submit question to Firestore
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setStatusMessage({ type: 'error', text: validationError });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // Generate unique ID
      const questionId = `gate-${form.subjectId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const questionData = {
        ...form,
        id: questionId,
        sourceUrl: form.sourceUrl || '#',
        source_type: 'manual_admin'
      };

      // Handle NAT tolerance
      if (form.type === 'NAT' && form.tolerance) {
        const numAnswer = parseFloat(form.correctAnswer);
        questionData.tolerance = [
          form.tolerance[0] || numAnswer,
          form.tolerance[1] || numAnswer
        ];
      }

      await addQuestion(questionData);

      // Also update local state
      if (onQuestionsUpdated) {
        onQuestionsUpdated(questionData);
      }

      setStatusMessage({
        type: 'success',
        text: `Question added successfully! ID: ${questionId}`
      });
      setForm({ ...EMPTY_QUESTION });
      setTagInput('');
      refreshDbCount();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Failed to add question: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seed all local questions to Firestore
  const handleSeedToFirestore = async () => {
    setIsSeeding(true);
    setSeedLogs(['Starting seed process...']);

    try {
      const count = await seedQuestionsToFirestore(localQuestions, (log) => {
        setSeedLogs(prev => [...prev, log]);
      });

      setSeedLogs(prev => [...prev, `Done! ${count} questions seeded.`]);
      setStatusMessage({
        type: 'success',
        text: `Seeded ${count} questions to Firestore successfully!`
      });
      refreshDbCount();
    } catch (error) {
      setSeedLogs(prev => [...prev, `Error: ${error.message}`]);
      setStatusMessage({
        type: 'error',
        text: `Seeding failed: ${error.message}`
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Fetch all from Firestore and update local
  const handleFetchFromDb = async () => {
    setIsFetchingFromDb(true);
    setStatusMessage(null);

    try {
      const allQ = await getAllQuestions();
      if (onQuestionsUpdated) {
        onQuestionsUpdated(allQ, true); // true = replace all
      }
      setStatusMessage({
        type: 'success',
        text: `Loaded ${allQ.length} questions from Firestore into the app!`
      });
      setDbQuestionCount(allQ.length);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Failed to fetch from Firestore: ${error.message}`
      });
    } finally {
      setIsFetchingFromDb(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
            <Database className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Question Bank Admin</h1>
            <p className="text-xs sm:text-sm text-indigo-300 mt-0.5">
              Add new questions to Firebase Firestore, seed existing bank, or sync from the cloud.
            </p>
          </div>
        </div>

        {/* DB Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-xs text-indigo-300">Firestore DB</span>
            <p className="text-2xl font-black text-white mt-0.5">
              {dbQuestionCount !== null ? dbQuestionCount : '…'}
            </p>
            <span className="text-[10px] text-indigo-400">questions in cloud</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <span className="text-xs text-indigo-300">Local App</span>
            <p className="text-2xl font-black text-white mt-0.5">{localQuestions.length}</p>
            <span className="text-[10px] text-indigo-400">questions loaded</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 sm:col-span-1 col-span-2">
            <span className="text-xs text-indigo-300">Subjects</span>
            <p className="text-2xl font-black text-white mt-0.5">{SUBJECTS.length}</p>
            <span className="text-[10px] text-indigo-400">GATE CS topics</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid sm:grid-cols-3 gap-3">
        <button
          onClick={handleFetchFromDb}
          disabled={isFetchingFromDb}
          className="p-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-all cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className={`w-5 h-5 text-blue-600 ${isFetchingFromDb ? 'animate-spin' : ''}`} />
            <span className="font-extrabold text-sm text-blue-900">Sync from Firestore</span>
          </div>
          <p className="text-xs text-blue-700">Load all questions from cloud DB into the app</p>
        </button>

        <button
          onClick={() => setShowSeedSection(!showSeedSection)}
          className="p-4 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-1">
            <CloudUpload className="w-5 h-5 text-amber-600" />
            <span className="font-extrabold text-sm text-amber-900">Seed to Firestore</span>
          </div>
          <p className="text-xs text-amber-700">Upload all local questions to cloud DB</p>
        </button>

        <button
          onClick={onNavigateToPractice}
          className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span className="font-extrabold text-sm text-emerald-900">Practice Questions</span>
          </div>
          <p className="text-xs text-emerald-700">Go to the practice arena to attempt questions</p>
        </button>
      </div>

      {/* Seed Section (collapsible) */}
      {showSeedSection && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Seed Local Bank → Firestore</h3>
              <p className="text-xs text-slate-500">
                Uploads all {localQuestions.length} local questions to Firestore. Duplicates are skipped automatically.
              </p>
            </div>
            <button
              onClick={handleSeedToFirestore}
              disabled={isSeeding}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Upload className={`w-4 h-4 ${isSeeding ? 'animate-bounce' : ''}`} />
              {isSeeding ? 'Seeding...' : 'Start Seed'}
            </button>
          </div>

          {seedLogs.length > 0 && (
            <div className="bg-slate-950 rounded-xl p-3 max-h-40 overflow-y-auto text-xs font-mono space-y-1">
              {seedLogs.map((log, i) => (
                <div key={i} className="text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">&gt;</span>
                  <span className={log.includes('Done') || log.includes('Successfully') ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {statusMessage.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          }
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ============= ADD QUESTION FORM ============= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Plus className="w-5 h-5 text-indigo-600" />
          <h2 className="font-extrabold text-slate-900 text-base">Add New Question</h2>
        </div>

        {/* Row 1: Subject & Topic */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Subject *</label>
            <select
              value={form.subjectId}
              onChange={e => updateField('subjectId', e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a subject...</option>
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Topic *</label>
            <input
              type="text"
              value={form.topic}
              onChange={e => updateField('topic', e.target.value)}
              placeholder="e.g. Virtual Memory & Paging"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: Source & URL */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Source *</label>
            <input
              type="text"
              value={form.source}
              onChange={e => updateField('source', e.target.value)}
              placeholder="e.g. GATE CS 2023 (IIT Kanpur)"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Source URL</label>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={e => updateField('sourceUrl', e.target.value)}
              placeholder="https://gate.iitk.ac.in"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 3: Type, Marks, Difficulty */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Question Type *</label>
            <div className="flex gap-2">
              {QUESTION_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    form.type === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Marks</label>
            <select
              value={form.marks}
              onChange={e => handleMarksChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>1 Mark</option>
              <option value={2}>2 Marks</option>
            </select>
            {form.type === 'MCQ' && (
              <span className="text-[10px] text-rose-500 font-medium mt-1 block">
                Negative: −{form.negativeMarks}
              </span>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Base Difficulty (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={form.baseDifficulty}
              onChange={e => updateField('baseDifficulty', parseFloat(e.target.value) || 5)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Question Text *</label>
          <textarea
            value={form.question}
            onChange={e => updateField('question', e.target.value)}
            rows={4}
            placeholder="Enter the full question statement..."
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        </div>

        {/* Options (MCQ / MSQ only) */}
        {(form.type === 'MCQ' || form.type === 'MSQ') && (
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Options * {form.type === 'MSQ' && <span className="text-purple-600 font-normal">(Select all correct below)</span>}
            </label>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  {form.type === 'MCQ' ? (
                    <button
                      onClick={() => updateField('correctAnswer', opt.id)}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer transition-all ${
                        form.correctAnswer === opt.id
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-emerald-400'
                      }`}
                      title={`Mark ${opt.id} as correct`}
                    >
                      {opt.id}
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleMSQAnswer(opt.id)}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer transition-all ${
                        Array.isArray(form.correctAnswer) && form.correctAnswer.includes(opt.id)
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-purple-400'
                      }`}
                      title={`Toggle ${opt.id} as correct`}
                    >
                      {opt.id}
                    </button>
                  )}
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => updateOption(idx, e.target.value)}
                    placeholder={`Option ${opt.id} text...`}
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NAT Answer */}
        {form.type === 'NAT' && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Correct Numerical Answer *</label>
              <input
                type="text"
                value={form.correctAnswer}
                onChange={e => updateField('correctAnswer', e.target.value)}
                placeholder="e.g. 4.5"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Tolerance Min</label>
              <input
                type="number"
                step="any"
                value={form.tolerance ? form.tolerance[0] : ''}
                onChange={e => updateField('tolerance', [parseFloat(e.target.value) || 0, form.tolerance ? form.tolerance[1] : 0])}
                placeholder="Lower bound"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Tolerance Max</label>
              <input
                type="number"
                step="any"
                value={form.tolerance ? form.tolerance[1] : ''}
                onChange={e => updateField('tolerance', [form.tolerance ? form.tolerance[0] : 0, parseFloat(e.target.value) || 0])}
                placeholder="Upper bound"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Step-by-Step Explanation *</label>
          <textarea
            value={form.explanation}
            onChange={e => updateField('explanation', e.target.value)}
            rows={4}
            placeholder="Provide a detailed step-by-step solution..."
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />
        </div>

        {/* Concept Tags */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Concept Tags</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag and press Enter"
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addTag}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.conceptTags.map(tag => (
              <span
                key={tag}
                className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-200"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setForm({ ...EMPTY_QUESTION })}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            Clear Form
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Question to Firestore</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
