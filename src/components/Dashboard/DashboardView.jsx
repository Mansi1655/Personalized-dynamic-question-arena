import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpenCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles, 
  GraduationCap, 
  FileText,
  Play
} from 'lucide-react';
import WeakStrongRadar from './WeakStrongRadar';
import RevisionRecommendations from './RevisionRecommendations';
import RecentTestsHistory from './RecentTestsHistory';

export default function DashboardView({
  currentUser,
  analysis,
  questions,
  onNavigateTab,
  onSelectTopicForPractice,
  onStartNewTest,
  onOpenEvaluatorGuide
}) {
  const { readinessIndex, strongAreas, weakAreas, averageSkill } = analysis;
  const history = currentUser.history || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner / Welcome with Evaluator Demo CTA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target: {currentUser.targetExam || 'GATE CS / IT 2027'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Aspirant Command Center: <span className="text-indigo-400">{currentUser.name}</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Personalized preparation powered by dynamic authentic question ingestion and Item Response Theory (IRT) adaptive difficulty calibration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenEvaluatorGuide}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-xs flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-300" />
              <span>Guide</span>
            </button>
            <button
              onClick={onStartNewTest}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Mock Test</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">GATE Readiness</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-400">{readinessIndex}%</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Average Skill</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-indigo-300">{averageSkill}</span>
              <span className="text-[10px] text-slate-400">/ 10.0</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Strong Subjects</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-400">{strongAreas.length}</span>
              <span className="text-[10px] text-slate-400">mastered</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Weak Areas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-rose-400">{weakAreas.length}</span>
              <span className="text-[10px] text-slate-400">need focus</span>
            </div>
          </div>
        </div>

      </div>

      {/* Weak vs Strong Topic Radar & Detailed Mastery Breakdown */}
      <WeakStrongRadar 
        analysis={analysis} 
        onSelectTopicForPractice={onSelectTopicForPractice} 
      />

      {/* AI-Prescribed Revision Roadmap */}
      <RevisionRecommendations 
        analysis={analysis} 
        onStartPracticeTopic={onSelectTopicForPractice} 
      />

      {/* Recent Evaluations History */}
      <RecentTestsHistory 
        history={history} 
        onStartNewTest={onStartNewTest} 
      />

    </div>
  );
}
