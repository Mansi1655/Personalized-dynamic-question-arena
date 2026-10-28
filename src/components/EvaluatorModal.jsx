import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Network, 
  Calculator, 
  ArrowRight, 
  Layers, 
  GraduationCap, 
  BookCheck,
  TrendingUp,
  FileCode2
} from 'lucide-react';

export default function EvaluatorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Platform Guide</h2>
              <p className="text-xs text-indigo-200">
                Personalized Adaptive Practice & Mock Test Platform for GATE Aspirants
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-indigo-950 text-sm">Project Motivation & Vision</h3>
              <p className="text-xs text-indigo-900 mt-1 leading-relaxed">
                Traditional exam preparation platforms suffer from two major flaws: (1) <strong>Manual question curation</strong> which leads to stale questions, and (2) <strong>Static difficulty tagging</strong> where an easy question for an OS topper is marked the same as for a beginner. <strong>This platform solves both</strong> by automatically ingesting authentic GATE questions and personalizing the difficulty rating (Low, Medium, Hard) relative to each student's evolving topic skill.
              </p>
            </div>
          </div>

          {/* 3 Core Pillars */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Core Architectural Innovations
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              
              {/* Pillar 1 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2">
                  <Network className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">1. Dynamic Ingestion</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Fetches verified questions dynamically from authentic sources (GATE Overflow, NPTEL, IIT official papers). Automatically tags Year, IIT Organizing Institute, MCQ/MSQ/NAT format, and marking schemes.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">2. Adaptive Difficulty</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Uses an <strong>IRT (Item Response Theory) & Elo-based mathematical model</strong>. Rather than static labels, difficulty (Low, Medium, Hard) dynamically shifts based on the candidate's topic mastery score:
                  <span className="block mt-1 font-mono text-[11px] bg-slate-100 p-1 rounded-sm text-indigo-700">
                    Δ = Base_Diff - User_Skill
                  </span>
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                  <BookCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">3. Weak / Strong Diagnostics</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Continuously calculates mastery percentages across subjects. Classifies topics into <strong>Strong Areas (≥70%)</strong> vs <strong>Critical Weak Areas (&lt;45%)</strong> with targeted revision prescriptions.
                </p>
              </div>

            </div>
          </div>

          {/* Mathematical Formulation */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Mathematical Model: Adaptive Difficulty Mapping
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400">// Expected Probability of Correct Answer:</span>
                <p className="text-emerald-400 font-semibold mt-0.5">P(Correct) = 1 / (1 + e^((BaseDifficulty - UserSkill) * 0.8))</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                  <span className="text-emerald-300 font-bold">Δ ≤ -1.2 ➔ Low</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Candidate mastery dominates question complexity</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                  <span className="text-amber-300 font-bold">-1.2 &lt; Δ &lt; 1.2 ➔ Medium</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Optimal zone of proximal development</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                  <span className="text-rose-300 font-bold">Δ ≥ 1.2 ➔ Hard</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Stretch challenge / candidate weak area</p>
                </div>
              </div>
            </div>
          </div>

          {/* 30-Second Live Demonstration Script */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Recommended 4-Step Walkthrough Guide:
            </h4>
            <ol className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Show Dynamic Difficulty:</strong> Switch persona in navbar between <em>"Systems Specialist"</em> and <em>"Beginner"</em>. Point out how the identical Operating Systems question switches from <strong>Low</strong> to <strong>Hard</strong> based on user skill!
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Show Dynamic Question Ingestion:</strong> Click <em>"Dynamic Ingestion"</em> tab and click <em>"Fetch Latest Questions"</em>. Show live simulated connection to GATE Overflow/NPTEL and automated schema ingestion.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Run a CBT Mock Test:</strong> Start a quick topic-wise test in <em>"Mock Test Arena"</em>. Open the <strong>Virtual Scientific Calculator</strong>, answer MCQ/MSQ/NAT questions, and submit.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Review Weak vs Strong Analytics:</strong> Show the updated <strong>Readiness Meter</strong>, the <strong>Strong vs Weak Areas Breakdown</strong>, and the personalized <strong>Revision Roadmap</strong>.
                </div>
              </li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">Ready for Project Presentation & Evaluation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start Exploring Prototype</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
