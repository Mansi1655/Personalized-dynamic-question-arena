import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpenCheck, 
  BrainCircuit, 
  CloudDownload, 
  Award, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  Shuffle
} from 'lucide-react';
import { USER_PERSONAS } from '../data/defaultUser';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onSelectPersona, 
  onResetData, 
  onOpenEvaluatorGuide,
  readinessIndex
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">GATE Prep</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-100 text-indigo-700 border border-indigo-200">
                  CS / IT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Personalized Adaptive Mock Tests</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Weak/Strong</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'practice'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Topic Practice</span>
            </button>

            <button
              onClick={() => setActiveTab('mocktest')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'mocktest'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>Mock Test Arena (CBT)</span>
            </button>

            <button
              onClick={() => setActiveTab('mixtest')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'mixtest'
                  ? 'bg-purple-50 text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span>Mix Test</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 border border-purple-200">NEW</span>
            </button>

            <button
              onClick={() => setActiveTab('fetcher')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'fetcher'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CloudDownload className="w-4 h-4" />
              <span>Dynamic Ingestion</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          </nav>

          {/* Right Actions: Persona Switcher, Evaluator Guide, Readiness */}
          <div className="flex items-center gap-3">
            
            {/* Quick Evaluator Persona Switcher */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Persona:
              </span>
              <select
                aria-label="Persona"
                className="bg-white text-xs font-semibold text-slate-800 rounded-md px-2 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                value={currentUser.name}
                onChange={(e) => {
                  const persona = USER_PERSONAS.find(p => p.name === e.target.value);
                  if (persona) onSelectPersona(persona);
                }}
              >
                {USER_PERSONAS.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* GATE Readiness Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800">
              <Award className="w-4 h-4 text-emerald-600" />
              <div className="text-xs leading-none">
                <span className="text-[10px] block font-medium text-emerald-600 uppercase">Readiness</span>
                <span className="font-bold">{readinessIndex}%</span>
              </div>
            </div>

            {/* Guide Button */}
            <button
              onClick={onOpenEvaluatorGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xs hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer"
              title="Show Guide"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Guide</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              title="Reset prototype state to initial defaults"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'practice' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
          >
            Practice
          </button>
          <button
            onClick={() => setActiveTab('mocktest')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'mocktest' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
          >
            Mock Test (CBT)
          </button>
          <button
            onClick={() => setActiveTab('mixtest')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'mixtest' ? 'bg-purple-100 text-purple-700' : 'text-slate-600'}`}
          >
            Mix Test
          </button>
          <button
            onClick={() => setActiveTab('fetcher')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'fetcher' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'}`}
          >
            Dynamic Fetcher
          </button>
        </div>

      </div>
    </header>
  );
}
