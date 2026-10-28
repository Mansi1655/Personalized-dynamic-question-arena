import React from 'react';
import { History, Award, Clock, CheckCircle2, ChevronRight, FileSpreadsheet, Shuffle } from 'lucide-react';
import { SUBJECTS } from '../../data/authenticQuestions';

export default function RecentTestsHistory({ history, onStartNewTest }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Mock Test Evaluations</h3>
            <p className="text-xs text-slate-500">History of Computer-Based Tests with performance metrics</p>
          </div>
        </div>
        <button
          onClick={onStartNewTest}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Take New Mock Test</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {(!history || history.length === 0) ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          No mock tests taken yet. Launch your first topic-wise test to evaluate your readiness!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-2.5 px-3">Date & Topic</th>
                <th className="py-2.5 px-3">Questions</th>
                <th className="py-2.5 px-3">Score Obtained</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Time Spent</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((test, idx) => {
                   const mins = Math.floor(test.timeTakenSec / 60);
                const secs = test.timeTakenSec % 60;
                const isPass = test.accuracy >= 50;

                return (
                  <tr key={test.testId || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {test.isMixTest && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                            <Shuffle className="w-2.5 h-2.5" />
                            MIX
                          </span>
                        )}
                        <span className="font-bold text-slate-900 text-xs leading-tight">{test.topic}</span>
                      </div>
                      {test.isMixTest && test.includedSubjectIds && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {test.includedSubjectIds.slice(0, 3).map(sid => {
                            const sub = SUBJECTS.find(s => s.id === sid);
                            return sub ? (
                              <span key={sid} className="text-[9px] px-1 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                                {sub.name.split(' ')[0]}
                              </span>
                            ) : null;
                          })}
                          {test.includedSubjectIds.length > 3 && (
                            <span className="text-[9px] px-1 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                              +{test.includedSubjectIds.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400">{test.date}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {test.correctCount || Math.round((test.accuracy / 100) * test.totalQuestions)} / {test.totalQuestions} Correct
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 font-mono">
                        {test.score.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-[10px]"> / {test.totalMarks} Marks</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${test.accuracy >= 70 ? 'text-emerald-600' : test.accuracy >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {test.accuracy}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {mins}m {secs}s
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPass ? 'Evaluated • Pass' : 'Evaluated • Below Cutoff'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
