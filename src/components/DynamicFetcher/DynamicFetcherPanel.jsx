import React, { useState } from 'react';
import { 
  CloudDownload, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  ExternalLink, 
  Database, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Search,
  ArrowRight
} from 'lucide-react';
import { AUTHENTIC_SOURCES, fetchAuthenticQuestions } from '../../services/questionFetcher';

export default function DynamicFetcherPanel({ 
  questions, 
  onQuestionsIngested,
  onNavigateToPractice
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [logs, setLogs] = useState([
    'System ready. Connected to 3 authentic GATE data pipelines.',
    'Awaiting ingestion command...'
  ]);
  const [ingestionStats, setIngestionStats] = useState(null);

  const handleStartIngestion = async () => {
    setIsFetching(true);
    setIngestionStats(null);
    setLogs(['Initiating dynamic question ingestion protocol...']);

    try {
      const existingIds = questions.map(q => q.id);
      const newQuestions = await fetchAuthenticQuestions((log) => {
        setLogs(prev => [...prev, log]);
      }, existingIds);

      setIsFetching(false);
      setIngestionStats({
        count: newQuestions.length,
        timestamp: new Date().toLocaleTimeString()
      });

      if (newQuestions.length > 0 && onQuestionsIngested) {
        onQuestionsIngested(newQuestions);
      }
    } catch (e) {
      setIsFetching(false);
      setLogs(prev => [...prev, `Error during ingestion: ${e.message}`]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Automated Ingestion Pipeline
              </span>
              <span className="text-xs text-slate-500 font-medium">Dynamic Data Aggregator</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Dynamic Authentic Question Fetcher
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              No manual question entry needed! The platform automatically scrapes and queries topic-wise questions from authoritative GATE sources with LaTeX formulas and verified solutions.
            </p>
          </div>

          <button
            onClick={handleStartIngestion}
            disabled={isFetching}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Fetching Live Feeds...' : 'Trigger Question Ingestion'}</span>
          </button>
        </div>
      </div>

      {/* Connected Authentic Sources Status Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {AUTHENTIC_SOURCES.map(source => (
          <div key={source.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">{source.name}</h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {source.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {source.description}
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {source.trustScore}
              </span>
              <a 
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>API Endpoint</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Live Pipeline Terminal / Logs */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-xl text-slate-100 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">Live Ingestion Terminal Logs</span>
          </div>
          <span className="text-[10px] text-slate-400">REST API • JSON-LD • Latency ~350ms</span>
        </div>

        <div className="min-h-[140px] max-h-56 overflow-y-auto space-y-1.5 text-xs text-slate-300 pr-2">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-indigo-400 shrink-0">&gt;</span>
              <span className={log.includes('complete') ? 'text-emerald-400 font-bold' : ''}>
                {log}
              </span>
            </div>
          ))}
        </div>

        {ingestionStats && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {ingestionStats.count > 0 
                  ? `Successfully ingested ${ingestionStats.count} new questions!` 
                  : 'Question bank is already fully synchronized with upstream archives.'}
              </span>
            </span>
            <button
              onClick={onNavigateToPractice}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Practice Ingested Questions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Currently Ingested Questions Bank Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Question Repository</h3>
            <p className="text-xs text-slate-500">
              Total <strong>{questions.length} authentic questions</strong> dynamically ingested and tagged with cognitive parameters.
            </p>
          </div>
          <button
            onClick={onNavigateToPractice}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Go to Practice Arena →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">Subject & Topic</th>
                <th className="py-2.5 px-3">Source Citation</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Base Difficulty</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{q.topic}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{q.subjectId}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-700">{q.source}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-bold">
                      {q.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                    {q.baseDifficulty} / 10
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={onNavigateToPractice}
                      className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
