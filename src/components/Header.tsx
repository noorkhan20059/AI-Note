import React from 'react';
import { BookOpen, Sparkles, HardDrive, Globe } from 'lucide-react';
import { Language } from '../types';
import { STUDENT_AVATAR } from '../data/defaultData';

interface HeaderProps {
  currentTab: 'chat' | 'notes' | 'graphs' | 'quiz' | 'flashcards' | 'analytics';
  onSelectTab: (tab: 'chat' | 'notes' | 'graphs' | 'quiz' | 'flashcards' | 'analytics') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenDocumentModal: () => void;
  activeDocName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  onOpenDocumentModal,
  activeDocName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Emblem & Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 relative">
            <BookOpen className="w-5 h-5 text-white" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                AI Study Buddy
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <HardDrive className="w-3 h-3" />
                Local-First
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Smart Learning Assistant
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) & Language Selector */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onSelectTab('chat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'chat'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Study Chat
            </button>
            <button
              onClick={() => onSelectTab('notes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'notes'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Notes Maker
            </button>
            <button
              onClick={() => onSelectTab('graphs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'graphs'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Graph Studio
            </button>
            <button
              onClick={() => onSelectTab('quiz')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'quiz'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quiz Maker
            </button>
            <button
              onClick={() => onSelectTab('flashcards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'flashcards'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => onSelectTab('analytics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'analytics'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analytics
            </button>
          </nav>

          {/* Bilingual Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <span className="pl-2 pr-1 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
            </span>
            <button
              onClick={() => onLanguageChange('english')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                language === 'english'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('roman_urdu')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                language === 'roman_urdu'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roman Urdu
            </button>
            <button
              onClick={() => onLanguageChange('urdu')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors font-urdu ${
                language === 'urdu'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اردو
            </button>
          </div>
        </div>

        {/* Zone 3: Student Avatar & Attached Doc Shortcut */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDocumentModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-medium max-w-[190px] truncate"
            title="Inspect Grounded Document"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">{activeDocName}</span>
          </button>

          {/* Student Profile Avatar with Fallback */}
          <div
            className="relative w-9 h-9 rounded-full ring-2 ring-indigo-500/20 overflow-hidden bg-slate-200 shrink-0 cursor-pointer"
            title="Student Profile: Noor K."
          >
            <img
              src={STUDENT_AVATAR}
              alt="Student Profile Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback styled avatar if needed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
