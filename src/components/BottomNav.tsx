import React from 'react';
import { MessageSquareText, HelpCircle, Layers, BarChart3, LineChart, FileText } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'chat' | 'notes' | 'graphs' | 'quiz' | 'flashcards' | 'analytics';
  onSelectTab: (tab: 'chat' | 'notes' | 'graphs' | 'quiz' | 'flashcards' | 'analytics') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-6 items-center h-16 max-w-md mx-auto px-1">
        <button
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'chat' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquareText className={`w-4 h-4 ${currentTab === 'chat' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight mt-1">Chat</span>
        </button>

        <button
          onClick={() => onSelectTab('notes')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'notes' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className={`w-4 h-4 ${currentTab === 'notes' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight mt-1">Notes</span>
        </button>

        <button
          onClick={() => onSelectTab('graphs')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'graphs' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LineChart className={`w-4 h-4 ${currentTab === 'graphs' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight mt-1">Graphs</span>
        </button>

        <button
          onClick={() => onSelectTab('quiz')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'quiz' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HelpCircle className={`w-4 h-4 ${currentTab === 'quiz' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight mt-1">Quizzes</span>
        </button>

        <button
          onClick={() => onSelectTab('flashcards')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'flashcards' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className={`w-4 h-4 ${currentTab === 'flashcards' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight mt-1">Cards</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentTab === 'analytics' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${currentTab === 'analytics' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight mt-1">Stats</span>
        </button>
      </div>
    </nav>
  );
};

