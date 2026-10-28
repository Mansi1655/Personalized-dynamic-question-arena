import React from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Flame
} from 'lucide-react';

export default function RevisionRecommendations({ analysis, onStartPracticeTopic }) {
  const { weakAreas, moderateAreas, strongAreas } = analysis;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI-Prescribed Revision Roadmap</h3>
            <p className="text-xs text-slate-500">
              Personalized micro-actions based on your error patterns and skill deficits
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          GATE 2027 Strategy
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        
        {/* Recommendation 1: Urgent Weak Spot */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase mb-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Priority 1: Mark Leakage</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {weakAreas.length > 0 ? weakAreas[0].subject.name : 'All Core Concepts Solid'}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {weakAreas.length > 0
                ? `${weakAreas[0].recommendation} Focus on Numerical Answer Type (NAT) practice to eliminate guesswork.`
                : 'No critical weak spots detected. Maintain regular revision cycles.'}
            </p>
          </div>
          {weakAreas.length > 0 && (
            <button
              onClick={() => onStartPracticeTopic(weakAreas[0].subject.id)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Practice This Topic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Recommendation 2: Moderate to Strong Conversion */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase mb-1.5">
              <Target className="w-4 h-4" />
              <span>Priority 2: Score Booster</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {moderateAreas.length > 0 ? moderateAreas[0].subject.name : 'Focus on Full Mock Exams'}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {moderateAreas.length > 0
                ? `You have a basic foundation here (${moderateAreas[0].skill}/10). Solving 5-8 medium-difficulty questions will promote this to a strong area.`
                : 'Your subjects are well distributed. Focus on full-length 3-hour mock tests.'}
            </p>
          </div>
          {moderateAreas.length > 0 && (
            <button
              onClick={() => onStartPracticeTopic(moderateAreas[0].subject.id)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Boost Topic Score</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Recommendation 3: Speed & Negative Marking Control */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase mb-1.5">
              <Clock className="w-4 h-4" />
              <span>Priority 3: Speed & Accuracy</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Negative Marking Control</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              GATE penalizes wrong MCQs by -0.33 or -0.66 marks. For MSQs and NATs, there is <strong>zero negative marking</strong>, making aggressive attempts optimal.
            </p>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
            💡 <em>Rule of thumb: Always attempt all NAT and MSQ questions!</em>
          </div>
        </div>

      </div>
    </div>
  );
}
