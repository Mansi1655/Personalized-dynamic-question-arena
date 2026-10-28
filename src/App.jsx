import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EvaluatorModal from './components/EvaluatorModal';
import CalculatorModal from './components/CalculatorModal';
import DashboardView from './components/Dashboard/DashboardView';
import TopicPracticeView from './components/Practice/TopicPracticeView';
import TestArenaView from './components/TestArena/TestArenaView';
import DynamicFetcherPanel from './components/DynamicFetcher/DynamicFetcherPanel';
import MixTestView from './components/MixTest/MixTestView';

import { SUBJECTS } from './data/authenticQuestions';
import { StorageService } from './services/storageService';
import { 
  analyzeStrengthsAndWeaknesses, 
  calculateUpdatedSkills 
} from './services/adaptiveEngine';

export default function App() {
  const [questions, setQuestions] = useState(() => StorageService.getQuestions());
  const [currentUser, setCurrentUser] = useState(() => StorageService.getUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPracticeSubject, setSelectedPracticeSubject] = useState('ALL');

  // Modals state
  const [isEvaluatorGuideOpen, setIsEvaluatorGuideOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Sync state to storage
  useEffect(() => {
    StorageService.saveQuestions(questions);
  }, [questions]);

  useEffect(() => {
    StorageService.saveUser(currentUser);
  }, [currentUser]);

  // Compute adaptive analytics
  const analysis = analyzeStrengthsAndWeaknesses(currentUser.topicSkills || {}, SUBJECTS);

  // Handle switching evaluator persona
  const handleSelectPersona = (persona) => {
    setCurrentUser(prev => ({
      ...prev,
      name: persona.name,
      handle: persona.handle,
      topicSkills: { ...persona.topicSkills }
    }));
  };

  // Handle resetting data
  const handleResetData = () => {
    if (window.confirm('Reset all progress and question bank to initial prototype state?')) {
      const reset = StorageService.resetAll();
      setQuestions(reset.questions);
      setCurrentUser(reset.user);
      setSelectedPracticeSubject('ALL');
      setActiveTab('dashboard');
    }
  };

  // Handle practice attempt (real-time adaptive calibration)
  const handleRecordPracticeAttempt = (question, isCorrect) => {
    const updatedSkills = calculateUpdatedSkills(currentUser.topicSkills, [
      { question, isCorrect, timeSpent: 45 }
    ]);
    setCurrentUser(prev => ({
      ...prev,
      topicSkills: updatedSkills
    }));
  };

  // Handle mock test submission (works for both CBT and Mix Test)
  const handleCompleteTest = (evaluation) => {
    const updatedSkills = calculateUpdatedSkills(currentUser.topicSkills, evaluation.attempts);

    let topicLabel;
    if (evaluation.isMixTest) {
      // Mix Test: label includes subject names
      topicLabel = evaluation.topic || 'Mix Test';
    } else {
      topicLabel = evaluation.subjectId === 'ALL'
        ? 'Full GATE Mock Exam'
        : (SUBJECTS.find(s => s.id === evaluation.subjectId)?.name || evaluation.subjectId);
    }

    const newHistoryItem = {
      testId: (evaluation.isMixTest ? 'mix-' : 'mock-') + Date.now(),
      date: evaluation.date,
      topic: topicLabel,
      subjectId: evaluation.subjectId,
      isMixTest: evaluation.isMixTest || false,
      mixMode: evaluation.mixMode || null,
      includedSubjectIds: evaluation.includedSubjectIds || null,
      score: evaluation.score,
      totalMarks: evaluation.totalMarks,
      accuracy: evaluation.accuracy,
      totalQuestions: evaluation.attempts.length,
      correctCount: evaluation.correctCount,
      timeTakenSec: evaluation.timeSpentSec
    };

    setCurrentUser(prev => ({
      ...prev,
      topicSkills: updatedSkills,
      history: [newHistoryItem, ...(prev.history || [])]
    }));
  };

  // Handle dynamic question ingestion
  const handleQuestionsIngested = (newBatch) => {
    setQuestions(prev => [...newBatch, ...prev]);
  };

  // Shortcut to start practice on a specific subject from dashboard
  const handleSelectTopicForPractice = (subjectId) => {
    setSelectedPracticeSubject(subjectId);
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSelectPersona={handleSelectPersona}
        onResetData={handleResetData}
        onOpenEvaluatorGuide={() => setIsEvaluatorGuideOpen(true)}
        readinessIndex={analysis.readinessIndex}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            analysis={analysis}
            questions={questions}
            onNavigateTab={setActiveTab}
            onSelectTopicForPractice={handleSelectTopicForPractice}
            onStartNewTest={() => setActiveTab('mocktest')}
            onOpenEvaluatorGuide={() => setIsEvaluatorGuideOpen(true)}
          />
        )}

        {activeTab === 'practice' && (
          <TopicPracticeView
            questions={questions}
            currentUser={currentUser}
            selectedSubjectId={selectedPracticeSubject}
            onSelectSubject={setSelectedPracticeSubject}
            onRecordPracticeAttempt={handleRecordPracticeAttempt}
          />
        )}

        {activeTab === 'mocktest' && (
          <TestArenaView
            questions={questions}
            currentUser={currentUser}
            onCompleteTest={handleCompleteTest}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        )}

        {activeTab === 'mixtest' && (
          <MixTestView
            questions={questions}
            currentUser={currentUser}
            onCompleteTest={handleCompleteTest}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        )}

        {activeTab === 'fetcher' && (
          <DynamicFetcherPanel
            questions={questions}
            onQuestionsIngested={handleQuestionsIngested}
            onNavigateToPractice={() => setActiveTab('practice')}
          />
        )}
      </main>

      {/* Global Modals */}
      <EvaluatorModal 
        isOpen={isEvaluatorGuideOpen} 
        onClose={() => setIsEvaluatorGuideOpen(false)} 
      />

      <CalculatorModal 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />

      {/* App Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">GATE Prep</span>
            <span>— Personalized Adaptive Mock Test Platform for GATE Aspirants</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={() => setIsEvaluatorGuideOpen(true)} 
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Guide
            </button>
            <button 
              onClick={() => setIsCalculatorOpen(true)} 
              className="text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Virtual Calculator
            </button>
            <span className="text-slate-400">Computer Science & Engineering</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
