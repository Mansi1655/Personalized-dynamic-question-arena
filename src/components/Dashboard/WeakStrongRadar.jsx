import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  HelpCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function WeakStrongRadar({ analysis, onSelectTopicForPractice }) {
  const { strongAreas, weakAreas, moderateAreas, breakdown } = analysis;

  return (
    <div className="space-y-6">
      
      {/* Highlights Grid: Strong vs Weak */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Strong Areas Card */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl border border-emerald-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                  Strong Areas (Mastered)
                </h3>
                <p className="text-xs text-emerald-700">Skill Rating ≥ 7.0 / 10 • Consistent High Accuracy</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              {strongAreas.length} Subjects
            </span>
          </div>

          {strongAreas.length === 0 ? (
            <div className="text-xs text-emerald-700/80 bg-white/60 p-4 rounded-xl border border-emerald-100 text-center">
              No topics in the strong zone yet. Take more mock tests to push your mastery above 70%!
            </div>
          ) : (
            <div className="space-y-2.5">
              {strongAreas.map(item => (
                <div 
                  key={item.subject.id} 
                  className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between hover:bg-white transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{item.subject.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                        {item.skill} / 10 Skill
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.recommendation}</p>
                  </div>
                  <button
                    onClick={() => onSelectTopicForPractice(item.subject.id)}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <span>Keep Sharp</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Areas Card */}
        <div className="bg-gradient-to-br from-rose-50/70 to-orange-50/40 rounded-2xl border border-rose-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-rose-950 uppercase tracking-wider">
                  Critical Weak Areas (Action Required)
                </h3>
                <p className="text-xs text-rose-700">Skill Rating ≤ 4.6 / 10 • Primary Mark Leakage</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
              {weakAreas.length} Subjects
            </span>
          </div>

          {weakAreas.length === 0 ? (
            <div className="text-xs text-rose-700/80 bg-white/60 p-4 rounded-xl border border-rose-100 text-center">
              Great news! You have no critical weak topics. Keep working on moderate areas.
            </div>
          ) : (
            <div className="space-y-2.5">
              {weakAreas.map(item => (
                <div 
                  key={item.subject.id} 
                  className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-rose-200/80 flex items-center justify-between hover:bg-white transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{item.subject.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800">
                        {item.skill} / 10 Skill
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-600 font-medium">{item.recommendation}</p>
                  </div>
                  <button
                    onClick={() => onSelectTopicForPractice(item.subject.id)}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-2 shadow-xs"
                  >
                    <span>Fix Weakness</span>
                    <Zap className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Comprehensive Topic Mastery Breakdown Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">GATE CS/IT Subject Mastery Spectrum</h3>
            <p className="text-xs text-slate-500">
              Real-time calibration: Determines personalized Low, Medium, or Hard labels for each question
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Strong (≥70%)
            </span>
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (47-69%)
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Weak (&lt;47%)
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {breakdown.map(item => {
            const pct = item.masteryPercentage;
            let barColor = 'bg-amber-500';
            if (item.skill >= 7.0) barColor = 'bg-emerald-500';
            else if (item.skill <= 4.6) barColor = 'bg-rose-500';

            return (
              <div key={item.subject.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{item.subject.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500 font-medium">Skill: {item.skill} / 10</span>
                    <span className="font-extrabold text-slate-900">{pct}% Mastery</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Adaptive Labeling Impact: Standard questions in this subject appear as{' '}
                    <strong className="text-slate-700">
                      {item.skill >= 7.0 ? 'Low (Easy for You)' : item.skill <= 4.6 ? 'Hard (High Challenge)' : 'Medium (Balanced)'}
                    </strong>
                  </span>
                  <button 
                    onClick={() => onSelectTopicForPractice(item.subject.id)}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Practice Questions →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
